import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Mail,
  Lock,
  Save,
  LogOut,
  Award,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { StudentProfile, EducationLevel, Certificate } from "../types";
import { updateProfile, logoutStudent } from "../api";

interface ProfileViewProps {
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile) => void;
  onLogout: () => void;
  onViewCertificate?: (cert: Certificate) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  onUpdateStudent,
  onLogout,
  onViewCertificate,
}) => {
  const [name, setName] = useState(student.name || "");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(student.education_level || "B.Tech");

  // Level-specific fields
  const [schoolGrade, setSchoolGrade] = useState(student.school_grade || "10th Grade");
  const [interStream, setInterStream] = useState(student.inter_stream || "MPC (Mathematics, Physics, Chemistry)");
  const [degreeName, setDegreeName] = useState(student.degree_name || "B.Sc");
  const [degreeSpecialization, setDegreeSpecialization] = useState(student.degree_specialization || "Computer Science");
  const [btechBranch, setBtechBranch] = useState(student.btech_branch || "Computer Science & Engineering");
  const [btechYear, setBtechYear] = useState(student.btech_year || "3rd Year");
  const [btechSemester, setBtechSemester] = useState(student.btech_semester || "1st Semester");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload: Partial<StudentProfile> = {
        name: name.trim(),
        education_level: educationLevel,
        school_grade: educationLevel === "School" ? schoolGrade : undefined,
        inter_stream: educationLevel === "Intermediate" ? interStream : undefined,
        degree_name: educationLevel === "Degree" ? degreeName : undefined,
        degree_specialization: educationLevel === "Degree" ? degreeSpecialization : undefined,
        btech_branch: educationLevel === "B.Tech" ? btechBranch : undefined,
        btech_year: educationLevel === "B.Tech" ? btechYear : undefined,
        btech_semester: educationLevel === "B.Tech" ? btechSemester : undefined,
      };

      const res = await updateProfile(payload);
      onUpdateStudent(res.student);
      setMessage({ type: "success", text: "Profile details updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="profile-view" className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            Student Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your student identity and academic curriculum mapping.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/50 text-emerald-300"
              : "bg-rose-950/50 border-rose-800/50 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Student Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Student Email (Read-Only)
            </label>
            <input
              type="email"
              disabled
              value={student.email}
              className="w-full px-3.5 py-2.5 bg-slate-850/60 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Academic Education Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["School", "Intermediate", "Degree", "B.Tech"] as EducationLevel[]).map((level) => (
                <button
                  key={level}
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

          {/* Level Specific Fields */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3">
            {educationLevel === "School" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Class / Grade
                </label>
                <select
                  value={schoolGrade}
                  onChange={(e) => setSchoolGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="6th Grade">6th Grade</option>
                  <option value="7th Grade">7th Grade</option>
                  <option value="8th Grade">8th Grade</option>
                  <option value="9th Grade">9th Grade</option>
                  <option value="10th Grade">10th Grade</option>
                </select>
              </div>
            )}

            {educationLevel === "Intermediate" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Group / Stream
                </label>
                <select
                  value={interStream}
                  onChange={(e) => setInterStream(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Degree</label>
                  <select
                    value={degreeName}
                    onChange={(e) => setDegreeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                    <option value="B.Com">B.Com (Bachelor of Commerce)</option>
                    <option value="B.A">B.A (Bachelor of Arts)</option>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={degreeSpecialization}
                    onChange={(e) => setDegreeSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {educationLevel === "B.Tech" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Branch</label>
                  <select
                    value={btechBranch}
                    onChange={(e) => setBtechBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                    <select
                      value={btechYear}
                      onChange={(e) => setBtechYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
                    <select
                      value={btechSemester}
                      onChange={(e) => setBtechSemester(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="1st Semester">Semester 1</option>
                      <option value="2nd Semester">Semester 2</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
