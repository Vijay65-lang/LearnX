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
import { TeamManifestoModal } from "./components/TeamManifestoModal";
import { ComfortSettingsModal, ComfortSettings } from "./components/ComfortSettingsModal";
import { cacheAllCoursesLocally, areCoursesCachedOffline } from "./utils/offlineManager";
import { ACADEMIC_COURSES } from "./data/coursesData";

const DEFAULT_COMFORT_SETTINGS: ComfortSettings = {
  fontSize: "normal",
  contrastMode: "slate",
  codeWrap: true,
  offlineAutoCache: true,
};

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loadingStudent, setLoadingStudent] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>("home");

  // Topic to prefill into Ask AI
  const [askTopic, setAskTopic] = useState<string | undefined>(undefined);

  // Active certificate to view in modal
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Team Manifesto Modal
  const [showManifesto, setShowManifesto] = useState<boolean>(false);

  // Comfort Settings Modal & Preference State
  const [showComfortModal, setShowComfortModal] = useState<boolean>(false);
  const [comfortSettings, setComfortSettings] = useState<ComfortSettings>(() => {
    try {
      const raw = localStorage.getItem("learnx_comfort_settings");
      return raw ? { ...DEFAULT_COMFORT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_COMFORT_SETTINGS;
    } catch {
      return DEFAULT_COMFORT_SETTINGS;
    }
  });

  const handleUpdateComfortSettings = (newSettings: Partial<ComfortSettings>) => {
    setComfortSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("learnx_comfort_settings", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Warm background offline course caching
  useEffect(() => {
    if (comfortSettings.offlineAutoCache && !areCoursesCachedOffline()) {
      cacheAllCoursesLocally(ACADEMIC_COURSES);
    }
  }, [comfortSettings.offlineAutoCache]);

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

  const getRootThemeClasses = () => {
    let classes = "min-h-screen text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200 ";
    if (comfortSettings.contrastMode === "warm") {
      classes += "comfort-theme-warm bg-stone-950 ";
    } else if (comfortSettings.contrastMode === "black") {
      classes += "comfort-theme-black bg-black ";
    } else {
      classes += "bg-slate-950 ";
    }

    if (comfortSettings.fontSize === "large") {
      classes += "comfort-size-large ";
    } else if (comfortSettings.fontSize === "xl") {
      classes += "comfort-size-xl ";
    }

    return classes;
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
    <div className={getRootThemeClasses()}>
      {/* Navigation Header & Mobile Bottom Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== "ask") setAskTopic(undefined);
          setCurrentTab(tab);
        }}
        student={student}
        onOpenManifesto={() => setShowManifesto(true)}
        onOpenComfortSettings={() => setShowComfortModal(true)}
      />

      {/* Main View Container with mobile bottom clearance */}
      <main className={`flex-1 ${currentTab === "ask" ? "h-[calc(100dvh-57px)] pb-14 md:pb-0 overflow-hidden" : "pb-20 md:pb-8"}`}>
        {currentTab === "home" && (
          <HomeDashboard
            key={student.id}
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
            key={student.id}
            student={student}
            initialTopic={askTopic}
          />
        )}

        {currentTab === "courses" && (
          <CoursesView
            key={student.id}
            student={student}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {currentTab === "progress" && (
          <ProgressView
            key={student.id}
            student={student}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
            onAskTopic={handleAskTopic}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            key={student.id}
            student={student}
            onUpdateStudent={(updated) => setStudent(updated)}
            onLogout={handleLogout}
            onViewCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}
      </main>

      {/* Comfort Settings Modal */}
      <ComfortSettingsModal
        isOpen={showComfortModal}
        onClose={() => setShowComfortModal(false)}
        settings={comfortSettings}
        onUpdateSettings={handleUpdateComfortSettings}
      />

      {/* Team LearnX Manifesto Modal */}
      <TeamManifestoModal
        isOpen={showManifesto}
        onClose={() => setShowManifesto(false)}
      />

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
