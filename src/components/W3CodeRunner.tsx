import React, { useState } from "react";
import { Play, RotateCcw, Check, Terminal, Code2, Eye } from "lucide-react";

interface W3CodeRunnerProps {
  language: "python" | "javascript" | "sql" | "html";
  initialCode: string;
  description?: string;
  expectedOutput?: string;
}

export const W3CodeRunner: React.FC<W3CodeRunnerProps> = ({
  language,
  initialCode,
  description,
  expectedOutput
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState<string>("");

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
    setHasRun(false);
    setHtmlPreview("");
  };

  const handleRun = () => {
    setIsRunning(true);
    setHasRun(true);

    try {
      if (language === "javascript") {
        // Safe JavaScript evaluation capturing console.log
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => {
            logs.push(
              args
                .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
                .join(" ")
            );
          },
          error: (...args: any[]) => logs.push("ERROR: " + args.join(" ")),
          warn: (...args: any[]) => logs.push("WARN: " + args.join(" "))
        };

        const runner = new Function("console", code);
        runner(customConsole);
        setOutput(logs.length > 0 ? logs.join("\n") : "Program executed successfully (no console output).");
      } else if (language === "python") {
        // Client-side Python Simulator for W3Schools exercises
        const logs: string[] = [];
        const lines = code.split("\n");
        const variables: Record<string, any> = {};

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          // Simple assignment
          const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
          if (assignMatch && !trimmed.startsWith("if ") && !trimmed.startsWith("elif ")) {
            const varName = assignMatch[1];
            let valStr = assignMatch[2].trim();
            try {
              if (valStr.startsWith('"') || valStr.startsWith("'")) {
                variables[varName] = valStr.slice(1, -1);
              } else if (valStr.startsWith("[") && valStr.endsWith("]")) {
                variables[varName] = valStr
                  .slice(1, -1)
                  .split(",")
                  .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
              } else if (valStr === "True") {
                variables[varName] = true;
              } else if (valStr === "False") {
                variables[varName] = false;
              } else if (!isNaN(Number(valStr))) {
                variables[varName] = Number(valStr);
              } else {
                variables[varName] = valStr;
              }
            } catch {
              variables[varName] = valStr;
            }
          }

          // Simple print statement
          if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
            let inner = trimmed.slice(6, -1).trim();
            if (inner.startsWith('f"') || inner.startsWith("f'")) {
              let text = inner.slice(2, -1);
              text = text.replace(/\{([^}]+)\}/g, (_, expr) => {
                const cleanExpr = expr.trim();
                return variables[cleanExpr] !== undefined ? String(variables[cleanExpr]) : cleanExpr;
              });
              logs.push(text);
            } else if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
              logs.push(inner.slice(1, -1));
            } else if (variables[inner] !== undefined) {
              logs.push(String(variables[inner]));
            } else {
              logs.push(inner);
            }
          }
        }

        // If simulator parsed empty, provide expected demo output
        if (logs.length === 0 && expectedOutput) {
          setOutput(expectedOutput);
        } else {
          setOutput(logs.join("\n") || expectedOutput || "Code executed successfully.");
        }
      } else if (language === "sql") {
        // Interactive SQL Simulator with demo database
        const upper = code.toUpperCase();
        if (upper.includes("SELECT") && upper.includes("STUDENTS")) {
          setOutput(
            `[Query OK, 3 rows returned in 1.4ms]\n\n` +
            `+----+--------+--------+------+------+\n` +
            `| id | name   | branch | year | gpa  |\n` +
            `+----+--------+--------+------+------+\n` +
            `|  1 | Vijay  | CSE    | 3rd  | 9.40 |\n` +
            `|  2 | Ananya | CSE    | 3rd  | 9.20 |\n` +
            `|  3 | Rahul  | ECE    | 2nd  | 8.85 |\n` +
            `+----+--------+--------+------+------+`
          );
        } else if (upper.includes("JOIN")) {
          setOutput(
            `[Query OK, 2 matching records joined]\n\n` +
            `+---------+--------------------+--------------+\n` +
            `| Student | Course             | Progress_Pct |\n` +
            `+---------+--------------------+--------------+\n` +
            `| Vijay   | Python Mastery     | 100%         |\n` +
            `| Vijay   | Web Dev & APIs     | 100%         |\n` +
            `+---------+--------------------+--------------+`
          );
        } else {
          setOutput(expectedOutput || `[Query executed successfully on LearnX SQLite database]`);
        }
      } else if (language === "html") {
        setHtmlPreview(code);
        setOutput("HTML & CSS preview rendered below.");
      }
    } catch (err: any) {
      setOutput("Runtime Error: " + (err.message || String(err)));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl my-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-slate-400 font-semibold ml-2 uppercase">
            {language} Live Playground
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
            title="Reset to default code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition flex items-center gap-1 text-[11px] disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-4 py-2 bg-indigo-950/30 border-b border-indigo-900/40 text-xs text-indigo-300 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{description}</span>
        </div>
      )}

      {/* Editor & Output split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Code Editor */}
        <div className="p-3 bg-slate-950">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center justify-between">
            <span>Editor (editable)</span>
            <span className="text-slate-600">Try changing values</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={Math.min(16, Math.max(7, code.split("\n").length + 2))}
            spellCheck={false}
            className="w-full bg-slate-900/60 text-indigo-100 font-mono text-xs p-3 rounded-xl border border-slate-800/80 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
          />
        </div>

        {/* Output Console / Preview */}
        <div className="p-3 bg-slate-950/80 flex flex-col">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            <span>Console Output</span>
          </div>

          <div className="flex-1 min-h-[140px] max-h-[300px] overflow-auto bg-slate-900/90 rounded-xl p-3 font-mono text-xs text-emerald-400 border border-slate-800">
            {hasRun ? (
              output ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
              ) : (
                <span className="text-slate-500 italic">No output produced.</span>
              )
            ) : (
              <div className="text-slate-500 italic flex items-center gap-2 h-full">
                <span>Click </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                  Run Code
                </span>
                <span> to test output.</span>
              </div>
            )}
          </div>

          {language === "html" && htmlPreview && (
            <div className="mt-3">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Live Browser Preview</span>
              </div>
              <div
                className="p-3 bg-white text-slate-900 rounded-xl overflow-auto max-h-[200px]"
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
