import React, { useState } from "react";
import { GraduationCap, ArrowRight, Lock, Mail, User, BookOpen, AlertCircle } from "lucide-react";
import { EducationLevel, StudentProfile } from "../types";
import { registerStudent, loginStudent } from "../api";

interface AuthViewProps {
  onAuthenticated: (student: StudentProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("B.Tech");

  // Level-specific fields
  const [schoolGrade, setSchoolGrade] = useState("10th Grade");
  const [interStream, setInterStream] = useState("MPC (Maths, Physics, Chem)");
  const [degreeName, setDegreeName] = useState("B.Sc");
  const [degreeSpecialization, setDegreeSpecialization] = useState("Computer Science");
  const [btechBranch, setBtechBranch] = useState("Computer Science & Engineering");
  const [btechYear, setBtechYear] = useState("3rd Year");
  const [btechSemester, setBtechSemester] = useState("1st Semester");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginStudent({ email, password });
        onAuthenticated(res.student);
      } else {
        const payload = {
          name,
          email,
          password,
          education_level: educationLevel,
          school_grade: educationLevel === "School" ? schoolGrade : undefined,
          inter_stream: educationLevel === "Intermediate" ? interStream : undefined,
          degree_name: educationLevel === "Degree" ? degreeName : undefined,
          degree_specialization: educationLevel === "Degree" ? degreeSpecialization : undefined,
          btech_branch: educationLevel === "B.Tech" ? btechBranch : undefined,
          btech_year: educationLevel === "B.Tech" ? btechYear : undefined,
          btech_semester: educationLevel === "B.Tech" ? btechSemester : undefined,
        };
        const res = await registerStudent(payload);
        onAuthenticated(res.student);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30">
            LX
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-white">
          LearnX
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-indigo-400 font-medium">
          “General AI answers questions. LearnX understands the learner.”
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          Student-only personalized mastery &amp; doubt resolution platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60">
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Student Registration
            </button>
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Student Login
            </button>
          </div>

          {error && (
            <div
              id="auth-error-banner"
              className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Student Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="student-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alex Johnson"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Student Email / ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="student-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="student-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    Education Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["School", "Intermediate", "Degree", "B.Tech"] as EducationLevel[]).map((level) => (
                      <button
                        key={level}
                        id={`edu-level-${level}`}
                        type="button"
                        onClick={() => setEducationLevel(level)}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                          educationLevel === level
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Specific Fields - Strict Section 2 Mandate */}
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
                  {educationLevel === "School" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Class / Grade
                      </label>
                      <select
                        id="school-grade-select"
                        value={schoolGrade}
                        onChange={(e) => setSchoolGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="6th Grade">6th Grade</option>
                        <option value="7th Grade">7th Grade</option>
                        <option value="8th Grade">8th Grade</option>
                        <option value="9th Grade">9th Grade</option>
                        <option value="10th Grade">10th Grade (Secondary)</option>
                      </select>
                    </div>
                  )}

                  {educationLevel === "Intermediate" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Group / Stream
                      </label>
                      <select
                        id="inter-stream-select"
                        value={interStream}
                        onChange={(e) => setInterStream(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="MPC (Mathematics, Physics, Chemistry)">MPC (Maths, Physics, Chem)</option>
                        <option value="BiPC (Biology, Physics, Chemistry)">BiPC (Biology, Physics, Chem)</option>
                        <option value="MEC (Maths, Economics, Commerce)">MEC (Maths, Economics, Commerce)</option>
                        <option value="CEC (Civics, Economics, Commerce)">CEC (Civics, Economics, Commerce)</option>
                      </select>
                    </div>
                  )}

                  {educationLevel === "Degree" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Degree
                        </label>
                        <select
                          id="degree-name-select"
                          value={degreeName}
                          onChange={(e) => setDegreeName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                          <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                          <option value="B.A">B.A (Bachelor of Arts)</option>
                          <option value="BBA">BBA (Bachelor of Business Administration)</option>
                          <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Branch / Specialization
                        </label>
                        <input
                          id="degree-spec-input"
                          type="text"
                          value={degreeSpecialization}
                          onChange={(e) => setDegreeSpecialization(e.target.value)}
                          placeholder="e.g., Computer Science, Data Science, Finance"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {educationLevel === "B.Tech" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Branch
                        </label>
                        <select
                          id="btech-branch-select"
                          value={btechBranch}
                          onChange={(e) => setBtechBranch(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Computer Science & Engineering">Computer Science &amp; Engineering (CSE)</option>
                          <option value="Electronics & Communication">Electronics &amp; Communication (ECE)</option>
                          <option value="Artificial Intelligence & Data Science">AI &amp; Data Science (AI/DS)</option>
                          <option value="Information Technology">Information Technology (IT)</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Electrical Engineering">Electrical &amp; Electronics (EEE)</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Year
                          </label>
                          <select
                            id="btech-year-select"
                            value={btechYear}
                            onChange={(e) => setBtechYear(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Semester
                          </label>
                          <select
                            id="btech-semester-select"
                            value={btechSemester}
                            onChange={(e) => setBtechSemester(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="1st Semester">Semester 1</option>
                            <option value="2nd Semester">Semester 2</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              id="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Log In to Student Space" : "Complete Registration"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Student Team Manifesto Card (Requested by User) */}
          <div
            id="team-learnx-manifesto-card"
            className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-300 space-y-3"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Created by Student Team LearnX</span>
            </div>

            <p className="leading-relaxed text-slate-300 text-xs">
              This application was built by a passionate student team—<strong>Team LearnX</strong>. Our mission is to help fellow students exponentially increase their knowledge with our AI to reach and exceed their goals.
            </p>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 text-xs leading-relaxed font-medium">
              🎯 <strong>Our Core Commitment:</strong> We will study with you and guide you step-by-step until every single doubt is 100% understood and cleared!
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-[11px] leading-relaxed">
              ⚠️ <strong>A Candid Note for Serious Learners:</strong> This app is built exclusively for students who are serious about learning and driven to excel. It is not intended for casual browsing or idling. If you are ready to commit to smart, disciplined hard work powered by our AI tutor, we warmly welcome you!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
