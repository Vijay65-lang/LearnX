import React from "react";
import { X, Users, Sparkles, Target, ShieldCheck, Heart, ArrowRight } from "lucide-react";

interface TeamManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamManifestoModal: React.FC<TeamManifestoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="team-manifesto-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl text-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30">
              LX
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>About Team LearnX</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Student Initiative
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Built by students, dedicated to serious students worldwide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Mission Card */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Who We Are &amp; Why We Built LearnX</span>
            </div>
            <p className="text-slate-200">
              This app is proudly made by a student engineering team called <strong>Team LearnX</strong>. As students ourselves, we noticed that generic AI tools often just dump surface-level answers without checking whether the learner actually understood the underlying academic concept.
            </p>
            <p className="text-slate-200">
              Our team created LearnX to help students systematically increase their study knowledge with custom AI tutoring engineered to boost their academic, examination, and career goals.
            </p>
          </div>

          {/* Student Promise */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Our Unwavering Commitment to You</span>
            </div>
            <p className="text-emerald-200 font-medium">
              &ldquo;We will study with and mentor that student until he or she thoroughly clears their doubt!&rdquo;
            </p>
            <p className="text-slate-300 text-xs">
              Whether you need three explanations, intuitive real-world analogies, deep error breakdowns, or infinite practice MCQs, LearnX will never abandon you until your doubt is completely resolved.
            </p>
          </div>

          {/* Candid Warning for Serious Students */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>A Clear Standard for Serious Learners</span>
            </div>
            <p className="text-amber-200/95 leading-relaxed">
              This application is purposefully built for students who are serious about their education. It is not designed for people who just want to chill, procrastinate, or casually scroll all the time.
            </p>
            <p className="text-slate-300 text-xs leading-relaxed">
              If someone is not serious about their studies, please either reconsider your commitment or step up to work hard with smart, focused study habits using our AI tutor. We are here to champion students who are ready to put in the effort to master their field.
            </p>
          </div>

          {/* Closing note */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="italic">— Team LearnX Student Developers</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-sm"
            >
              Let&apos;s Start Learning &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
