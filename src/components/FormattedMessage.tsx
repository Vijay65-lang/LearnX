import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-100">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          return <CodeBlock key={index} raw={part} />;
        }
        return <TextBlock key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ raw: string }> = ({ raw }) => {
  const [copied, setCopied] = useState(false);
  const lines = raw.slice(3, -3).trim().split("\n");
  const firstLine = lines[0].trim();
  const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : "";
  const code = (language ? lines.slice(1) : lines).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-750 bg-slate-950 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-300">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-emerald-300 leading-relaxed font-mono selection:bg-indigo-900">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  // Split into paragraphs / lines
  const lines = text.split("\n");

  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-4 list-disc marker:text-indigo-400 text-slate-200">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-indigo-400 text-slate-200">
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Horizontal Rule
    if (line === "---" || line === "***" || line === "___") {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="border-slate-800 my-4" />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-indigo-300 mt-4 mb-2 flex items-center gap-2">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-base sm:text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg sm:text-xl font-extrabold text-white mt-5 mb-3">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-indigo-500/80 pl-3 my-2 text-slate-300 italic bg-slate-950/40 py-1 rounded-r">
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(line.slice(2));
      continue;
    }

    // Numbered List
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numMatch[2]);
      continue;
    }

    // Standard Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-200">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <>{elements}</>;
};

// Formats inline bold (**text**), inline code (`code`), and italics (*text*)
function renderInline(text: string): React.ReactNode {
  // Regex to match code tokens, bold tokens, italic tokens
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] sm:text-xs border border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
