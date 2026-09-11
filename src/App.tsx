/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StudentProfile, Certificate } from "./types";
import { getMe, logoutStudent, getStoredToken } from "./api";
import { Navigation, TabType } from "./components/Navigation";
import { AuthView } from "./components/AuthView";
import { HomeDashboard } from "./components/HomeDashboard";
import { AskAI } from "./components/AskAI";
import { CoursesView } from "./components/CoursesView";
import { ProgressView } from "./components/ProgressView";
import { ProfileView } from "./components/ProfileView";
import { CertificateModal } from "./components/CertificateModal";

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  // Topic to prefill into Ask AI
  const [askTopic, setAskTopic] = useState<string | undefined>(undefined);

  // Active certificate to view in modal
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      setLoadingStudent(false);
      return;
    }

    try {
      const res = await getMe();
      setStudent(res.student);
    } catch {
      // Token invalid or expired
      setStudent(null);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleAuthenticated = (newStudent: StudentProfile) => {
    setStudent(newStudent);
    setCurrentTab("home");
  };

  const handleLogout = async () => {
    await logoutStudent();
    setStudent(null);
    setCurrentTab("home");
  };

  const handleAskTopic = (topic: string) => {
    setAskTopic(topic);
    setCurrentTab("ask");
  };

  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-4 animate-pulse shadow-lg shadow-indigo-600/30">
          LX
        </div>
        <p className="text-xs font-mono text-slate-400">Initializing LearnX Student Space...</p>
      </div>
    );
  }

  if (!student) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header & Mobile Bottom Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== "ask") setAskTopic(undefined);
          setCurrentTab(tab);
        }}
        student={student}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentTab === "home" && (
          <HomeDashboard
            student={student}
            onNavigate={(tab) => {
              if (tab !== "ask") setAskTopic(undefined);
              setCurrentTab(tab);
            }}
            onAskTopic={handleAskTopic}
          />
        )}

        {currentTab === "ask" && (
          <AskAI
            student={student}
            initialTopic={askTopic}
          />
        )}

        {currentTab === "courses" && (
          <CoursesView
            student={student}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {currentTab === "progress" && (
          <ProgressView
            student={student}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
            onAskTopic={handleAskTopic}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            student={student}
            onUpdateStudent={(updated) => setStudent(updated)}
            onLogout={handleLogout}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}
      </main>

      {/* Certificate Viewer Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
