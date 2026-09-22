import { KnowledgeGap, MasteryRecord, GapSeverity } from "../types";
import { getLocalQuestionAttempts, StoredQuestionAttempt } from "../api";

/**
 * Analyzes past quiz results and mastery records to identify specific
 * topics and sub-topics where the student has knowledge gaps that require review.
 *
 * A knowledge gap is detected when:
 * 1. Accuracy is below 70% with at least 1 mistake.
 * 2. Or the mastery state is "Needs Improvement" or "Developing" with mistakes.
 * 3. Or a topic has high mistake frequency.
 */
export function analyzeKnowledgeGaps(masteryRecords: MasteryRecord[] = []): KnowledgeGap[] {
  const attempts: StoredQuestionAttempt[] = getLocalQuestionAttempts();

  // Map topic to attempts for detailed sub-topic / mistake analysis
  const attemptsByTopic = new Map<string, StoredQuestionAttempt[]>();
  for (const att of attempts) {
    const key = `${att.subject}:::${att.topic}`.toLowerCase();
    const existing = attemptsByTopic.get(key) || [];
    existing.push(att);
    attemptsByTopic.set(key, existing);
  }

  const gaps: KnowledgeGap[] = [];

  for (const rec of masteryRecords) {
    const key = `${rec.subject}:::${rec.topic}`.toLowerCase();
    const topicAttempts = attemptsByTopic.get(key) || [];

    // Check if this topic qualifies as a gap:
    // - Needs Improvement
    // - Accuracy < 70% with at least 1 mistake
    // - Or mistakes >= 2 even if accuracy is moderate
    const hasGap =
      rec.mastery_state === "Needs Improvement" ||
      (rec.attempts >= 1 && rec.accuracy < 70 && rec.mistakes > 0) ||
      (rec.mistakes >= 2 && rec.accuracy < 80);

    if (!hasGap) continue;

    // Determine severity
    let severity: GapSeverity = "Low";
    if (rec.accuracy < 40 || rec.mistakes >= 3) {
      severity = "Critical";
    } else if (rec.accuracy < 65 || rec.mistakes >= 2) {
      severity = "Moderate";
    }

    // Extract sub-concept / mistake details from local attempts
    const incorrectAttempts = topicAttempts.filter((a) => !a.is_correct);
    let mostRecentMistake = incorrectAttempts[incorrectAttempts.length - 1];
    let concept = mostRecentMistake?.concept;

    // If no concept detected in question attempts, derive from topic or prompt
    if (!concept || concept.trim() === "") {
      concept = rec.topic;
    }

    // Snippet describing what was missed
    let mistakeSnippet: string | undefined;
    if (mostRecentMistake) {
      mistakeSnippet = `Selected "${mostRecentMistake.selected_answer}" instead of "${mostRecentMistake.correct_answer}"`;
    }

    // Tailored review prompt for instant AI tutor review
    const reviewPrompt = `Can you explain the key concepts of ${rec.topic} (${concept}), clarify common pitfalls, and give me a quick practice problem to strengthen my understanding?`;

    // Last attempted time
    const lastAttempt = topicAttempts[topicAttempts.length - 1];

    gaps.push({
      id: `gap_${rec.id || Math.random().toString(36).substring(2, 9)}`,
      subject: rec.subject,
      topic: rec.topic,
      concept,
      accuracy: rec.accuracy,
      attempts: rec.attempts,
      correctCount: rec.correct_count,
      mistakes: rec.mistakes,
      severity,
      recentMistakeSnippet: mistakeSnippet,
      reviewPrompt,
      lastAttemptedAt: lastAttempt?.timestamp || rec.updated_at,
    });
  }

  // Also check if any standalone attempts exist for topics not yet in masteryRecords
  for (const [key, atts] of attemptsByTopic.entries()) {
    const [sub, top] = key.split(":::");
    const alreadyMapped = gaps.some(
      (g) => g.subject.toLowerCase() === sub && g.topic.toLowerCase() === top
    );
    if (alreadyMapped) continue;

    const total = atts.length;
    const correct = atts.filter((a) => a.is_correct).length;
    const mistakes = total - correct;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;

    if (total >= 1 && acc < 70 && mistakes > 0) {
      const subjectName = atts[0].subject || "General";
      const topicName = atts[0].topic || "Topic";
      const lastIncorrect = atts.filter((a) => !a.is_correct).slice(-1)[0];
      const conceptName = lastIncorrect?.concept || topicName;

      let severity: GapSeverity = "Low";
      if (acc < 40 || mistakes >= 3) severity = "Critical";
      else if (acc < 65 || mistakes >= 2) severity = "Moderate";

      gaps.push({
        id: `gap_att_${Math.random().toString(36).substring(2, 9)}`,
        subject: subjectName,
        topic: topicName,
        concept: conceptName,
        accuracy: acc,
        attempts: total,
        correctCount: correct,
        mistakes,
        severity,
        recentMistakeSnippet: lastIncorrect
          ? `Selected "${lastIncorrect.selected_answer}" instead of "${lastIncorrect.correct_answer}"`
          : undefined,
        reviewPrompt: `Explain ${topicName} (${conceptName}), why I might have gotten it wrong, and provide a clear step-by-step review.`,
        lastAttemptedAt: atts[atts.length - 1]?.timestamp,
      });
    }
  }

  // Sort by severity (Critical first, then Moderate, then Low), then by accuracy ascending (lowest first)
  const severityRank: Record<GapSeverity, number> = {
    Critical: 0,
    Moderate: 1,
    Low: 2,
  };

  return gaps.sort((a, b) => {
    const sevDiff = severityRank[a.severity] - severityRank[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.accuracy - b.accuracy;
  });
}
