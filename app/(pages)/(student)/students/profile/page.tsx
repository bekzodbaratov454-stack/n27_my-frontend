"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
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

interface StudentProfile {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
}

export default function StudentProfile() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageType>("uz");
  const [profile, setProfile] = useState<StudentProfile>({
    fullName: "",
    email: "",
    phone: "",
    role: "STUDENT",
  });
  const [editProfile, setEditProfile] = useState<StudentProfile>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const t = messages[language];

  // Load language from localStorage
  useEffect(() => {
    const savedLang = (localStorage.getItem("language") || "uz") as LanguageType;
    setLanguage(savedLang);

    // Get user profile from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "STUDENT",
        });
        setEditProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch (err) {
        console.error("Failed to parse user info:", err);
      }
    }
    setLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current user data from localStorage
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};

      // Update with new values
      const updatedUser = {
        ...currentUser,
        ...editProfile,
      };

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update profile state
      setProfile(editProfile);
      setIsEditing(false);

      // Show success message
      setMessage({
        type: "success",
        text: language === "uz" ? "Profil muvaffaqiyatli yangilandi" : 
              language === "ru" ? "Профиль успешно обновлен" :
              "Profile updated successfully",
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({
        type: "error",
        text: language === "uz" ? "Profil yangilashda xatolik" :
              language === "ru" ? "Ошибка при обновлении профиля" :
              "Error updating profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0f19]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-[#eef1f4] p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F7FFF]"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0f19]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-[#eef1f4] p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1a1a1a]">
                {language === "uz" && "Profil ma'lumotlari"}
                {language === "ru" && "Информация профиля"}
                {language === "en" && "Profile Information"}
              </h1>
              <p className="text-[#64748B] mt-1">
                {language === "uz" && "O'z ma'lumotlaringizni ko'rish va tahrirlash"}
                {language === "ru" && "Просмотр и редактирование ваших данных"}
                {language === "en" && "View and edit your information"}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-8">
                {!isEditing ? (
                  // View Mode
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-2">
                        {language === "uz" && "To'liq ismi"}
                        {language === "ru" && "Полное имя"}
                        {language === "en" && "Full Name"}
                      </label>
                      <p className="text-lg text-[#1a1a1a]">{profile.fullName || "-"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-2">
                        {language === "uz" && "Email"}
                        {language === "ru" && "Электронная почта"}
                        {language === "en" && "Email"}
                      </label>
                      <p className="text-lg text-[#1a1a1a]">{profile.email || "-"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-2">
                        {language === "uz" && "Telefon"}
                        {language === "ru" && "Телефон"}
                        {language === "en" && "Phone"}
                      </label>
                      <p className="text-lg text-[#1a1a1a]">{profile.phone || "-"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-2">
                        {language === "uz" && "Rol"}
                        {language === "ru" && "Роль"}
                        {language === "en" && "Role"}
                      </label>
                      <p className="text-lg text-[#1a1a1a]">
                        {profile.role === "STUDENT"
                          ? language === "uz"
                            ? "O'quvchi"
                            : language === "ru"
                            ? "Студент"
                            : "Student"
                          : profile.role}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditProfile(profile);
                        setIsEditing(true);
                      }}
                      className="w-full bg-[#4F7FFF] hover:bg-[#3D6EEE] text-white font-semibold py-3 rounded-lg transition-colors mt-6"
                    >
                      {language === "uz" && "Profilni tahrirlash"}
                      {language === "ru" && "Редактировать профиль"}
                      {language === "en" && "Edit Profile"}
                    </button>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                        {language === "uz" && "To'liq ismi"}
                        {language === "ru" && "Полное имя"}
                        {language === "en" && "Full Name"}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editProfile.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7FFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                        {language === "uz" && "Email"}
                        {language === "ru" && "Электронная почта"}
                        {language === "en" && "Email"}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editProfile.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7FFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                        {language === "uz" && "Telefon"}
                        {language === "ru" && "Телефон"}
                        {language === "en" && "Phone"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editProfile.phone}
                        onChange={handleInputChange}
                        placeholder="+998 90 123 45 67"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7FFF] focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-[#4F7FFF] hover:bg-[#3D6EEE] disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        {saving
                          ? language === "uz"
                            ? "Saqlanmoqda..."
                            : language === "ru"
                            ? "Сохранение..."
                            : "Saving..."
                          : language === "uz"
                          ? "Saqlash"
                          : language === "ru"
                          ? "Сохранить"
                          : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1a1a1a] font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        {language === "uz" && "Bekor qilish"}
                        {language === "ru" && "Отмена"}
                        {language === "en" && "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
