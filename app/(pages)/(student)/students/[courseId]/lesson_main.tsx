"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";
import LessonPlayer, { Question, Material, Task, Exam } from "../components/LessonPlayer";
import ismatxurshidov from "../../../../assets/ismatxurshidov.png";
import messagesUz from "../../../../messages/uz.json";
import messagesRu from "../../../../messages/ru.json";
import messagesEn from "../../../../messages/en.json";

type LanguageType = "uz" | "ru" | "en";

const messages = {
  uz: messagesUz,
  ru: messagesRu,
  en: messagesEn,
};

// Darslar ro'yxati
const lessons = [
  { id: "l1", title: "IT Live akademiyasi haqida", duration: "10 daqiqa" },
  { id: "l2", title: "Frontend dasturlash nima?", duration: "10 daqiqa" },
  { id: "l3", title: "Nimadan boshlash kerak?", duration: "10 daqiqa" },
  { id: "l4", title: "HTML asoslari", duration: "15 daqiqa" },
  { id: "l5", title: "CSS bilan ishlash", duration: "20 daqiqa" },
];

// Sample materials
const materials: Material[] = [
  { id: "m1", name: "Materiallar.pdf", type: "pdf" },
  { id: "m2", name: "Materiallar.pdf", type: "pdf" },
  { id: "m3", name: "Materiallar.pdf", type: "pdf" },
  { id: "m4", name: "Materiallar.pdf", type: "pdf" },
];

// Sample tasks
const tasks: Task[] = [
  {
    id: "t1",
    title: "CSS'da shriftlar va maros bo'lib o'tadigan xususiyatlar",
    description: "Ushbu vazifani bajarish orqali CSS bilan ishlash ko'nikmalaringizni rivojlantirasiz",
    fileName: "vazifa.pdf",
    uploadInstructions: "Yuklash va fayl yuklanmagan",
  },
];

// Sample exam
const exams: Exam[] = [
  {
    id: "e1",
    title: "CSS Imtihoni",
    level: "O'rta",
    difficulty: "Cheksiz",
    totalQuestions: 5,
    currentQuestion: 2,
    questions: [
      {
        id: "eq1",
        question: "Quyidagilardan qaysi biri formatish tegi emas?",
        options: ["A) span", "B) Strong", "C) Mark", "D) i"],
      },
      {
        id: "eq2",
        question: "HTML da nechta heading darajasi mavjud?",
        options: ["A) 5", "B) 6", "C) 7", "D) 8"],
      },
    ],
    result: "-",
    explanation: "-",
    nextSteps: "-",
  },
];

export default function LessonMain() {
  const [activeLessonId, setActiveLessonId] = useState("l3");
  const [language, setLanguage] = useState<LanguageType>("uz");
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  // Load language from localStorage
  useEffect(() => {
    const savedLang = (localStorage.getItem("language") || "uz") as LanguageType;
    setLanguage(savedLang);

    // Load lesson progress from localStorage
    const savedProgress = localStorage.getItem("lessonProgress");
    if (savedProgress) {
      try {
        setLessonProgress(JSON.parse(savedProgress));
      } catch (err) {
        console.error("Failed to parse lesson progress:", err);
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

  const questions: Question[] = [
    {
      id: "q1",
      name: "Xurshid Istamov",
      avatar: ismatxurshidov,
      text: "Assalomu aleykum. Jonli efir yaxshi bo'yapti. Faqat ovoz yaxshi eshitilmayapti!",
      likes: 125,
    },
    {
      id: "q2",
      name: "Sardor Rahimov",
      avatar: ismatxurshidov,
      text: "Zo'r tushuntirasiz! Keyingi darsni kutib qolamiz. Rahmat sizga!",
      likes: 89,
    },
    {
      id: "q3",
      name: "Dilshod Karimov",
      avatar: ismatxurshidov,
      text: "Bu mavzuni batafsil tushuntirib bera olasizmi? Juda qiziqarli mavzu ekan",
      likes: 45,
    },
  ];

  const currentLesson = lessons.find((l) => l.id === activeLessonId);
  const currentIndex = lessons.findIndex((l) => l.id === activeLessonId);

  const handleNextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setActiveLessonId(lessons[currentIndex + 1].id);
      // Save progress
      saveLessonProgress(lessons[currentIndex + 1].id, 0);
    }
  };

  const saveLessonProgress = (lessonId: string, progress: number) => {
    const newProgress = { ...lessonProgress, [lessonId]: progress };
    setLessonProgress(newProgress);
    localStorage.setItem("lessonProgress", JSON.stringify(newProgress));
  };

  const t = messages[language];

  // Intro content for "Nimadan boshlash kerak?" lesson
  const introContent = {
    uz: {
      title: "Nimadan boshlash kerak?",
      description: "Bu darsda Frontend dasturlash yo'nalishi asoslari bilan tanishib, natija sifatida qanday loyihalarni yarata olasligingizni bilib olasiz.",
      modules: [
        {
          number: 1,
          title: "HTML asoslari",
          description: "Web sahifalarni tuzish uchun zarur bo'lgan HTML teglarini o'rganamiz",
        },
        {
          number: 2,
          title: "CSS bilan dizayn",
          description: "HTML elementlarini stylelash va dizayn qilish uchun CSS-dan foydalanamiz",
        },
        {
          number: 3,
          title: "JavaScript interaktivligi",
          description: "Veb-sahifalarga interaktivlik va dinamik xususiyatlarni qo'shamiz",
        },
        {
          number: 4,
          title: "Haqiqiy loyihalar",
          description: "O'rganganlarimizni praktikada qo'llab, real loyihalar tayyorlaymiz",
        },
      ],
      expectations: [
        "HTML5 dokumenti tuzishni o'rganish",
        "Responsive dizayn bilan CSS yozishni bilish",
        "JavaScript bilan DOM-ni boshqarishni o'rganish",
        "Git va GitHub bilan ishlashni o'zlashtirish",
      ],
    },
    ru: {
      title: "С чего начать?",
      description: "На этом уроке вы познакомитесь с основами веб-разработки Frontend и узнаете, какие проекты вы сможете создавать.",
      modules: [
        {
          number: 1,
          title: "Основы HTML",
          description: "Изучаем HTML теги необходимые для создания веб-страниц",
        },
        {
          number: 2,
          title: "Дизайн с CSS",
          description: "Используем CSS для оформления и стилизации элементов HTML",
        },
        {
          number: 3,
          title: "Интерактивность JavaScript",
          description: "Добавляем интерактивность и динамические функции на веб-страницы",
        },
        {
          number: 4,
          title: "Реальные проекты",
          description: "Применяем полученные знания на практике и создаем реальные проекты",
        },
      ],
      expectations: [
        "Научиться создавать документы HTML5",
        "Писать CSS с адаптивным дизайном",
        "Управлять DOM с помощью JavaScript",
        "Работать с Git и GitHub",
      ],
    },
    en: {
      title: "Getting Started?",
      description: "In this lesson, you will familiarize yourself with the basics of Frontend web development and learn what projects you will be able to create.",
      modules: [
        {
          number: 1,
          title: "HTML Basics",
          description: "Learn HTML tags necessary for creating web pages",
        },
        {
          number: 2,
          title: "Design with CSS",
          description: "Use CSS to style and format HTML elements",
        },
        {
          number: 3,
          title: "JavaScript Interactivity",
          description: "Add interactivity and dynamic features to web pages",
        },
        {
          number: 4,
          title: "Real Projects",
          description: "Apply knowledge in practice and create real projects",
        },
      ],
      expectations: [
        "Learn to create HTML5 documents",
        "Write CSS with responsive design",
        "Manage DOM with JavaScript",
        "Work with Git and GitHub",
      ],
    },
  };

  const content = introContent[language];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-hidden bg-[#F8FAFC] p-6">
          <div className="flex gap-5 items-start h-full max-w-[1600px] mx-auto">
            <CourseSidebar 
              courseTitle="Frontend dasturlash" 
              activeLessonId={activeLessonId}
              onLessonChange={setActiveLessonId}
            />
            <div className="flex-1 overflow-y-auto h-full">
              {/* Intro for "Nimadan boshlash kerak?" lesson */}
              {activeLessonId === "l3" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 min-w-0">
                  <div className="flex items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">{content.title}</h2>
                    <button 
                      onClick={handleNextLesson}
                      className="shrink-0 bg-[#4F7FFF] hover:bg-[#3D6EEE] transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-lg"
                    >
                      {language === "uz" && "Keyingi dars"}
                      {language === "ru" && "Следующий урок"}
                      {language === "en" && "Next Lesson"}
                    </button>
                  </div>

                  <p className="text-[#64748B] text-lg mb-8 leading-relaxed">{content.description}</p>

                  {/* Modules */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">
                      {language === "uz" && "O'rganadigan modullar"}
                      {language === "ru" && "Модули для изучения"}
                      {language === "en" && "Modules to Learn"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.modules.map((module) => (
                        <div key={module.number} className="bg-gradient-to-br from-[#4F7FFF]/10 to-[#3D6EEE]/10 border border-[#4F7FFF]/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4F7FFF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {module.number}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#1a1a1a] mb-1">{module.title}</h4>
                              <p className="text-sm text-[#64748B]">{module.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expectations */}
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">
                      {language === "uz" && "Nimani o'rganasiz"}
                      {language === "ru" && "Что вы изучите"}
                      {language === "en" && "What You'll Learn"}
                    </h3>
                    <ul className="space-y-2">
                      {content.expectations.map((expectation, index) => (
                        <li key={index} className="flex items-start gap-3 text-[#64748B]">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="shrink-0 mt-0.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{expectation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {language === "uz" && "💡 Maslahat: Har bir darsni dikkaatli tomosha qiling va amaliy vazifalarni bajarish orqali bilimingizni mustahkamlashtiring."}
                      {language === "ru" && "💡 Совет: Внимательно смотрите каждый урок и укрепляйте свои знания, выполняя практические задания."}
                      {language === "en" && "💡 Tip: Watch each lesson carefully and strengthen your knowledge by completing practical tasks."}
                    </p>
                  </div>
                </div>
              )}

              {/* Regular lesson player for other lessons */}
              {activeLessonId !== "l3" && (
                <LessonPlayer
                  title={currentLesson?.title || "Dars"}
                  totalQuestions={questions.length}
                  totalAnswers={12}
                  questions={questions}
                  materials={materials}
                  tasks={tasks}
                  exams={exams}
                  onNextLesson={handleNextLesson}
                  videoUrl="/video_2026-08-10_11-15-10.mp4"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
