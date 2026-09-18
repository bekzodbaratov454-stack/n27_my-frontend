"use client";

import Image from "next/image";
import ismatxurshidov from "../../../../assets/ismatxurshidov.png";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import messagesUz from "../../../../messages/uz.json";
import messagesRu from "../../../../messages/ru.json";
import messagesEn from "../../../../messages/en.json";

type LanguageType = "uz" | "ru" | "en";

const messages = {
  uz: messagesUz,
  ru: messagesRu,
  en: messagesEn,
};

interface StudentInfo {
  fullName: string;
  role: string;
  email?: string;
}

export default function Topbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageType>("uz");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Load language and student info from localStorage on mount
  useEffect(() => {
    const savedLang = (localStorage.getItem("language") || "uz") as LanguageType;
    setLanguage(savedLang);

    // Get student info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStudentInfo({
          fullName: user.fullName || "Student",
          role: user.role || "STUDENT",
          email: user.email,
        });
      } catch (err) {
        console.error("Failed to parse user info:", err);
      }
    }
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e: any) => {
      if (e.detail?.language) {
        setLanguage(e.detail.language);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  // Handle language change
  const handleLanguageChange = (lang: LanguageType) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    // Trigger event for other components
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
    setIsLangDropdownOpen(false);
  };

  // Handle logout
const handleLogout = () => {
  cookieStore.delete("accessToken")
  // localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("language");
  window.location.href = "/"; // router.push emas
};

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLangLabel = () => {
    const langMap: Record<LanguageType, string> = {
      uz: "O'zbek tili",
      ru: "Русский",
      en: "English",
    };
    return langMap[language];
  };

  const t = messages[language];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-[#1a1a1a]">
        {/* Galochka icon */}
        <div className="w-5 h-5 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        Student
      </div>

      <div className="flex items-center gap-4">
        {/* Bell notification */}
        <button className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[10px] font-bold leading-none rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Settings icon */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </button>

        {/* Language selector */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 text-sm text-[#1a1a1a] font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {getLangLabel()}
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1a1a1a" 
              strokeWidth="2"
              className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {isLangDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button 
                onClick={() => handleLanguageChange("uz")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === "uz" ? "text-[#4F7FFF] font-semibold" : "text-[#1a1a1a]"
                }`}
              >
                O&apos;zbek tili
              </button>
              <button 
                onClick={() => handleLanguageChange("ru")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === "ru" ? "text-[#4F7FFF] font-semibold" : "text-[#1a1a1a]"
                }`}
              >
                Русский
              </button>
              <button 
                onClick={() => handleLanguageChange("en")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language === "en" ? "text-[#4F7FFF] font-semibold" : "text-[#1a1a1a]"
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
          >
            <Image
              src={ismatxurshidov}
              alt={studentInfo?.fullName || "Student"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-[#1a1a1a]">{studentInfo?.fullName || "Student"}</p>
              <p className="text-xs text-[#94A3B8]">
                {studentInfo?.role === "STUDENT" ? "O'quvchi" : studentInfo?.role}
              </p>
            </div>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1a1a1a" 
              strokeWidth="2"
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              <button 
                onClick={() => router.push("/")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === "uz" && "Saytga qaytish"}
                  {language === "ru" && "Вернуться на сайт"}
                  {language === "en" && "Back to Site"}
                </span>
              </button>
              
              <button 
                onClick={() => router.push("/students/profile")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {language === "uz" && "Profil ma'lumotlari"}
                  {language === "ru" && "Информация профиля"}
                  {language === "en" && "Profile Information"}
                </span>
              </button>
              
              <div className="h-px bg-gray-200 my-1.5 mx-2"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-sm text-[#EF4444] font-medium">
                  {language === "uz" && "Profildan chiqish"}
                  {language === "ru" && "Выход из профиля"}
                  {language === "en" && "Sign Out"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
