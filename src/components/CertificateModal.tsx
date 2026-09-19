import React, { useRef, useState } from "react";
import { Award, Printer, X, ShieldCheck, Download, Check } from "lucide-react";
import { Certificate } from "../types";

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
  onVerifySeal?: (certId: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose, onVerifySeal }) => {
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    setDownloadingImage(true);
    try {
      // Create high-res canvas for crystal clear image export
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient (Deep Midnight Navy)
      const grad = ctx.createLinearGradient(0, 0, 1200, 850);
      grad.addColorStop(0, "#090d16");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#090d16");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 850);

      // 2. Decorative Golden Double Border
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#4f46e5";
      ctx.strokeRect(30, 30, 1140, 790);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#eab308"; // Gold inner border
      ctx.strokeRect(44, 44, 1112, 762);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#6366f1";
      ctx.strokeRect(52, 52, 1096, 746);

      // 3. Corner Ornaments
      const drawCornerOrnament = (x: number, y: number) => {
        ctx.save();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };
      drawCornerOrnament(60, 60);
      drawCornerOrnament(1140, 60);
      drawCornerOrnament(60, 790);
      drawCornerOrnament(1140, 790);

      // 4. LearnX Brand Header
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("LEARNX MASTERY PLATFORM", 600, 130);

      ctx.fillStyle = "#818cf8";
      ctx.font = "14px monospace";
      ctx.fillText("ACCREDITED STUDENT AI ACADEMIC SYSTEM", 600, 155);

      // Decorative divider
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(350, 175);
      ctx.lineTo(850, 175);
      ctx.stroke();

      // 5. Title
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "italic 20px Georgia, serif";
      ctx.fillText("Official Certificate of Academic Mastery", 600, 230);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText("This is officially awarded to verify that", 600, 280);

      // 6. Recipient Name
      ctx.fillStyle = "#facc15"; // Vibrant Golden Name
      ctx.font = "bold 44px Georgia, serif";
      ctx.fillText(certificate.student_name, 600, 350);

      // Underline
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 375);
      ctx.lineTo(900, 375);
      ctx.stroke();

      // 7. Course & Completion Text
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "16px sans-serif";
      ctx.fillText("has successfully completed all modules, interactive code labs, and assessments for", 600, 425);

      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 30px Georgia, serif";
      ctx.fillText(certificate.course_name, 600, 480);

      // 8. Seal & Badge in Center Bottom
      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 580, 48, 0, Math.PI * 2);
      ctx.fillStyle = "#1e1b4b";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#eab308";
      ctx.stroke();

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("VERIFIED", 600, 575);
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("MASTERY", 600, 595);
      ctx.restore();

      // 9. Footer Details: Date and Verification ID
      const awardedDate = new Date(certificate.completion_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Left Column: Date
      ctx.textAlign = "left";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText("Date of Issue:", 100, 710);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(awardedDate, 100, 735);

      // Right Column: Certificate ID
      ctx.textAlign = "right";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText("Credential Serial ID:", 1100, 710);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 16px monospace";
      ctx.fillText(certificate.certificate_id, 1100, 735);

      // Bottom Authenticity Tag
      ctx.textAlign = "center";
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.fillText("Validated cryptographically across LearnX Academic Nodes. Non-transferable credential.", 600, 785);

      // 10. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeCourse = certificate.course_name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `LearnX_Certificate_${safeCourse}_${certificate.certificate_id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate certificate PNG:", err);
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Display Frame */}
        <div
          id="printable-certificate"
          className="p-6 sm:p-8 border-4 border-double border-indigo-500/40 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center space-y-6 relative overflow-hidden shadow-inner"
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
            <h1 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif py-1">
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

            {onVerifySeal ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerifySeal(certificate.certificate_id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono transition cursor-pointer"
                title="Verify this certificate in the Security Trust Registry"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified: {certificate.certificate_id} · Verify Registry</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Certificate: {certificate.certificate_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {/* Verify Seal in Registry */}
          {onVerifySeal && (
            <button
              onClick={() => {
                onClose();
                onVerifySeal(certificate.certificate_id);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Seal</span>
            </button>
          )}
          {/* Download Image Button */}
          <button
            onClick={handleDownloadPNG}
            disabled={downloadingImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{downloadingImage ? "Generating..." : "Download Certificate (PNG)"}</span>
              </>
            )}
          </button>

          {/* Print Certificate Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
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
