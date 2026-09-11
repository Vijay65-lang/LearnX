import React from "react";
import { Award, CheckCircle, Printer, X, ShieldCheck } from "lucide-react";
import { Certificate } from "../types";

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Certificate Frame */}
        <div
          id="printable-certificate"
          className="p-6 sm:p-8 border-4 border-double border-indigo-500/40 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center space-y-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              LX
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-wider text-white">LEARNX</span>
              <div className="text-[10px] text-indigo-400 tracking-widest uppercase">
                Student Mastery Platform
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Certificate of Academic Mastery
            </h2>
            <p className="text-xs text-slate-500 italic">
              This officially certifies that
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-indigo-300 font-serif py-1">
              {certificate.student_name}
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              has successfully completed all modules, lessons, and mastery comprehension assessments for the accredited curriculum in:
            </p>
            <div className="text-base sm:text-lg font-bold text-white pt-1">
              {certificate.course_name}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <div className="text-left space-y-0.5">
              <div className="text-[10px] text-slate-500">Date Awarded</div>
              <div className="font-mono text-slate-300">
                {new Date(certificate.completion_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Certificate: {certificate.certificate_id}</span>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
