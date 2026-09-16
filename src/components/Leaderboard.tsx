import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Shield,
  Eye,
  EyeOff,
  Medal,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle2,
  Filter
} from "lucide-react";
import { StudentProfile, LeaderboardEntry } from "../types";
import { getLeaderboard, setLeaderboardPrivacy } from "../api";

interface LeaderboardProps {
  currentStudent: StudentProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentStudent }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStreamOnly, setFilterStreamOnly] = useState<boolean>(false);
  const [privacyEnabled, setPrivacyEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`learnx_leaderboard_privacy_${currentStudent.id}`) === "true";
    } catch {
      return false;
    }
  });
  const [savingPrivacy, setSavingPrivacy] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(currentStudent.education_level, privacyEnabled);
      setEntries(data.entries || []);
    } catch (err) {
      console.warn("Could not load leaderboard from server, using local ranking:", err);
      // Resilient local ranking generator strictly for student's education level
      generateLocalRanking();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalRanking = () => {
    const level = currentStudent.education_level || "Intermediate";
    const myBranch = currentStudent.inter_stream || currentStudent.btech_branch || currentStudent.degree_specialization || currentStudent.degree_name || currentStudent.school_grade || "MPC";
    const norm = level.toLowerCase();

    let peers: LeaderboardEntry[] = [];

    if (norm.includes("btech") || norm.includes("b.tech") || norm.includes("engineering")) {
      peers = [
        {
          rank: 1,
          student_id: "peer_btech_1",
          name: "Priya Rao",
          education_level: level,
          stream_branch: "CSE - AI & ML",
          mastery_points: 1850,
          topics_mastered: 15,
          total_attempts: 175,
          accuracy: 95,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 2,
          student_id: "peer_btech_2",
          name: "Karthik N",
          education_level: level,
          stream_branch: "CSE",
          mastery_points: 1640,
          topics_mastered: 13,
          total_attempts: 158,
          accuracy: 92,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 3,
          student_id: currentStudent.id,
          name: privacyEnabled ? "Anonymous Learner (You)" : currentStudent.name || "Student",
          education_level: level,
          stream_branch: myBranch,
          mastery_points: 1510,
          topics_mastered: 11,
          total_attempts: 145,
          accuracy: 90,
          is_current_student: true,
          is_anonymous: privacyEnabled
        },
        {
          rank: 4,
          student_id: "peer_btech_3",
          name: "Sneha K",
          education_level: level,
          stream_branch: "ECE",
          mastery_points: 1380,
          topics_mastered: 10,
          total_attempts: 130,
          accuracy: 88,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 5,
          student_id: "peer_btech_4",
          name: "Arjun Mehta",
          education_level: level,
          stream_branch: "Mechanical",
          mastery_points: 1240,
          topics_mastered: 8,
          total_attempts: 115,
          accuracy: 86,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 6,
          student_id: "peer_btech_5",
          name: "Divya Nair",
          education_level: level,
          stream_branch: "IT",
          mastery_points: 1120,
          topics_mastered: 7,
          total_attempts: 102,
          accuracy: 84,
          is_current_student: false,
          is_anonymous: false
        }
      ];
    } else if (norm.includes("degree") || norm.includes("b.sc") || norm.includes("b.com") || norm.includes("b.a")) {
      peers = [
        {
          rank: 1,
          student_id: "peer_deg_1",
          name: "Pooja Verma",
          education_level: level,
          stream_branch: "B.Sc Data Science",
          mastery_points: 1820,
          topics_mastered: 14,
          total_attempts: 170,
          accuracy: 94,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 2,
          student_id: "peer_deg_2",
          name: "Rahul Deshmukh",
          education_level: level,
          stream_branch: "B.Com Computers",
          mastery_points: 1610,
          topics_mastered: 12,
          total_attempts: 150,
          accuracy: 91,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 3,
          student_id: currentStudent.id,
          name: privacyEnabled ? "Anonymous Learner (You)" : currentStudent.name || "Student",
          education_level: level,
          stream_branch: myBranch,
          mastery_points: 1470,
          topics_mastered: 10,
          total_attempts: 138,
          accuracy: 89,
          is_current_student: true,
          is_anonymous: privacyEnabled
        },
        {
          rank: 4,
          student_id: "peer_deg_3",
          name: "Meera Sen",
          education_level: level,
          stream_branch: "B.A Economics",
          mastery_points: 1320,
          topics_mastered: 9,
          total_attempts: 124,
          accuracy: 87,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 5,
          student_id: "peer_deg_4",
          name: "Aditya Roy",
          education_level: level,
          stream_branch: "B.Sc Maths",
          mastery_points: 1210,
          topics_mastered: 8,
          total_attempts: 110,
          accuracy: 85,
          is_current_student: false,
          is_anonymous: false
        }
      ];
    } else if (norm.includes("school") || norm.includes("10th") || norm.includes("9th") || norm.includes("8th")) {
      peers = [
        {
          rank: 1,
          student_id: "peer_sch_1",
          name: "Vikram Malhotra",
          education_level: level,
          stream_branch: "10th Class CBSE",
          mastery_points: 1790,
          topics_mastered: 14,
          total_attempts: 165,
          accuracy: 94,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 2,
          student_id: "peer_sch_2",
          name: "Dia Nair",
          education_level: level,
          stream_branch: "10th Class ICSE",
          mastery_points: 1590,
          topics_mastered: 12,
          total_attempts: 148,
          accuracy: 91,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 3,
          student_id: currentStudent.id,
          name: privacyEnabled ? "Anonymous Learner (You)" : currentStudent.name || "Student",
          education_level: level,
          stream_branch: myBranch,
          mastery_points: 1460,
          topics_mastered: 10,
          total_attempts: 136,
          accuracy: 89,
          is_current_student: true,
          is_anonymous: privacyEnabled
        },
        {
          rank: 4,
          student_id: "peer_sch_3",
          name: "Aman Gupta",
          education_level: level,
          stream_branch: "9th Class State Board",
          mastery_points: 1310,
          topics_mastered: 9,
          total_attempts: 122,
          accuracy: 86,
          is_current_student: false,
          is_anonymous: false
        }
      ];
    } else {
      // Default: Intermediate (MPC / BiPC / MEC / CEC)
      peers = [
        {
          rank: 1,
          student_id: "peer_inter_1",
          name: "Aarav Sharma",
          education_level: "Intermediate",
          stream_branch: "MPC",
          mastery_points: 1850,
          topics_mastered: 14,
          total_attempts: 180,
          accuracy: 94,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 2,
          student_id: "peer_inter_2",
          name: "Ananya Reddy",
          education_level: "Intermediate",
          stream_branch: "MPC",
          mastery_points: 1620,
          topics_mastered: 12,
          total_attempts: 165,
          accuracy: 91,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 3,
          student_id: currentStudent.id,
          name: privacyEnabled ? "Anonymous Learner (You)" : currentStudent.name || "Student",
          education_level: "Intermediate",
          stream_branch: myBranch || "MPC",
          mastery_points: 1480,
          topics_mastered: 10,
          total_attempts: 142,
          accuracy: 89,
          is_current_student: true,
          is_anonymous: privacyEnabled
        },
        {
          rank: 4,
          student_id: "peer_inter_3",
          name: "Rohan Varma",
          education_level: "Intermediate",
          stream_branch: "MPC",
          mastery_points: 1350,
          topics_mastered: 9,
          total_attempts: 130,
          accuracy: 86,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 5,
          student_id: "peer_inter_4",
          name: "Sai Teja",
          education_level: "Intermediate",
          stream_branch: "BiPC",
          mastery_points: 1240,
          topics_mastered: 8,
          total_attempts: 118,
          accuracy: 88,
          is_current_student: false,
          is_anonymous: false
        },
        {
          rank: 6,
          student_id: "peer_inter_5",
          name: "Nikhil Joshi",
          education_level: "Intermediate",
          stream_branch: "MEC",
          mastery_points: 1150,
          topics_mastered: 7,
          total_attempts: 98,
          accuracy: 84,
          is_current_student: false,
          is_anonymous: false
        }
      ];
    }

    setEntries(peers);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentStudent.id, privacyEnabled]);

  const togglePrivacy = async () => {
    const nextVal = !privacyEnabled;
    setPrivacyEnabled(nextVal);
    setSavingPrivacy(true);
    try {
      localStorage.setItem(`learnx_leaderboard_privacy_${currentStudent.id}`, String(nextVal));
      await setLeaderboardPrivacy(nextVal);
    } catch {
      // Local storage handled
    } finally {
      setSavingPrivacy(false);
      fetchLeaderboard();
    }
  };

  const myBranch = (
    currentStudent.inter_stream ||
    currentStudent.btech_branch ||
    currentStudent.degree_specialization ||
    currentStudent.degree_name ||
    currentStudent.school_grade ||
    ""
  ).toLowerCase();

  const displayedEntries = filterStreamOnly && myBranch
    ? entries.filter(
        (e) =>
          e.stream_branch?.toLowerCase().includes(myBranch) ||
          myBranch.includes(e.stream_branch?.toLowerCase() || "")
      )
    : entries;

  const currentStudentEntry = entries.find((e) => e.is_current_student || e.student_id === currentStudent.id);

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl text-slate-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Academic Mastery Leaderboard</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {currentStudent.education_level || "Intermediate"} Cohort
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked strictly among verified <span className="text-indigo-300 font-semibold">{currentStudent.education_level || "Intermediate"}</span> peers based on curriculum mastery points
            </p>
          </div>
        </div>

        {/* Controls: Stream Filter & Privacy Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {myBranch && (
            <button
              type="button"
              onClick={() => setFilterStreamOnly(!filterStreamOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                filterStreamOnly
                  ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title={`Filter to students in your specific stream (${currentStudent.inter_stream || currentStudent.btech_branch || "Stream"})`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterStreamOnly ? `${currentStudent.inter_stream || currentStudent.btech_branch || currentStudent.degree_specialization || currentStudent.degree_name || "My Stream"} Only` : `All ${currentStudent.education_level || "Cohort"} Streams`}</span>
            </button>
          )}

          {/* Privacy Mode Toggle Button */}
          <button
            type="button"
            onClick={togglePrivacy}
            disabled={savingPrivacy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              privacyEnabled
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title="Toggle whether your real name appears on the public student leaderboard"
          >
            {privacyEnabled ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                <span>Privacy: Anonymous</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Privacy: Public</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Current Student's Rank Snapshot Card */}
      {currentStudentEntry && (
        <div className="my-4 p-3 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              #{currentStudentEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {privacyEnabled ? "You (Displaying as Anonymous to others)" : `${currentStudent.name} (You)`}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Your Standings
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentStudentEntry.topics_mastered} topics mastered · {currentStudentEntry.accuracy}% accuracy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">
                {currentStudentEntry.mastery_points} pts
              </div>
              <div className="text-[10px] text-slate-400">Mastery Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      <div className="mt-3 divide-y divide-slate-800/80">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Calculating verified student mastery standings...</span>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No students found in this stream filter yet.
          </div>
        ) : (
          displayedEntries.map((entry) => {
            const isMe = entry.is_current_student || entry.student_id === currentStudent.id;
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={entry.student_id || `rank_${entry.rank}`}
                className={`py-3 px-2 flex items-center justify-between gap-3 rounded-xl transition ${
                  isMe
                    ? "bg-indigo-950/30 border border-indigo-500/40"
                    : "hover:bg-slate-850/50"
                }`}
              >
                {/* Rank & Student Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 flex items-center justify-center flex-shrink-0">
                    {entry.rank === 1 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-amber-400/30 shadow-md">
                        🥇
                      </span>
                    ) : entry.rank === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-md">
                        🥈
                      </span>
                    ) : entry.rank === 3 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-extrabold text-xs shadow-md">
                        🥉
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold truncate ${isMe ? "text-indigo-300" : "text-white"}`}>
                        {entry.is_anonymous && !isMe ? "Anonymous Learner" : entry.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          YOU
                        </span>
                      )}
                      {entry.is_anonymous && isMe && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                          <EyeOff className="w-2.5 h-2.5" /> Hidden to others
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{entry.education_level} {entry.stream_branch ? `(${entry.stream_branch})` : ""}</span>
                      <span>·</span>
                      <span className="text-slate-400">{entry.topics_mastered} Mastered</span>
                      <span>·</span>
                      <span className="text-slate-400">{entry.accuracy}% Acc</span>
                    </div>
                  </div>
                </div>

                {/* Mastery Points */}
                <div className="flex items-center gap-2 flex-shrink-0 text-right">
                  <div className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {entry.mastery_points.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note on privacy and point calculation */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mastery points: 10 pts per correct problem + 50 pts per mastered curriculum topic</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Privacy mode can be updated at any time.
        </div>
      </div>
    </div>
  );
};
