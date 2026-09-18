"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pen,
  Trash2,
  X,
  UploadCloud,
  Check,
  EyeOff,
  Link as LinkIcon,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/dashboard/Header";
import { useCategoryStore } from "@/app/store/useCategoryStore";
import { useCourseStore, Course } from "@/app/store/useCourseStore";
import CustomSelect from "@/app/components/dashboard/CustomSelect";
import Pagination from "@/app/components/dashboard/Pagination";
import { baseAPI } from "@/app/lib/utils";
import { showToast } from "@/store/useToastStore";

export default function AllCoursesPage() {
  const { categories, setCategories } = useCategoryStore();
  const { 
    courses, 
    setCourses,
    addCourse, 
    updateCourse, 
    deleteCourse, 
    toggleCourseStatus, 
    assignAssistant, 
    removeAssistant 
  } = useCourseStore();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current items
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    level: "beginner",
    categoryId: "",
  });
  const [assistant, setAssistant] = useState("");

  // File Upload State
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  // Fetch Categories & Courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, coursesRes] = await Promise.allSettled([
          baseAPI.get("/categories"),
          baseAPI.get("/courses"),
        ]);

        if (catsRes.status === "fulfilled") {
          const list = catsRes.value.data?.data || catsRes.value.data || [];
          if (Array.isArray(list)) {
            setCategories(list);
          }
        }

        if (coursesRes.status === "fulfilled") {
          const courseList = coursesRes.value.data?.data || coursesRes.value.data || [];
          if (Array.isArray(courseList) && courseList.length > 0) {
            const mappedCourses = courseList.map((c: any) => ({
              id: c.id,
              title: c.name || c.title,
              desc: c.description || c.desc || "",
              price: Number(c.price) || 0,
              level: (c.level || "beginner").toLowerCase(),
              categoryId: c.categoryId,
              status: "active" as const,
              cover: c.banner || "bg-gradient-to-br from-blue-400 to-indigo-500",
              studentsCount: c._count?.students || 0,
              rating: 5.0,
              duration: "20 soat",
              mentor: "Ustoz",
              createdAt: c.created_at || new Date().toISOString(),
            }));
            setCourses(mappedCourses);
          }
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    fetchData();
  }, [setCategories, setCourses]);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  // Pagination
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Handlers
  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(currentCourses.map(c => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const isAllSelected = currentCourses.length > 0 && selectedRows.length === currentCourses.length;
  const selectedAreActive = selectedRows.length > 0 && selectedRows.every(id => courses.find(c => c.id === id)?.status === 'active');
  
  const handleBulkToggle = () => {
    if (selectedRows.length === 0) return;
    const newStatus = selectedAreActive ? 'inactive' : 'active';
    toggleCourseStatus(selectedRows, newStatus);
    setSuccessMessage(`Tanlanganlar muvaffaqiyatli ${newStatus === 'active' ? 'faollashtirildi' : 'nofaol qilindi'}`);
    setIsSuccessModalOpen(true);
    setSelectedRows([]);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ title: "", desc: "", price: "", level: "beginner", categoryId: "" });
    setBannerFile(null);
    setBannerPreview(null);
    setVideoFile(null);
    setCurrentCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setModalMode("edit");
    setFormData({ 
      title: course.title, 
      desc: course.desc, 
      price: course.price.toString(), 
      level: course.level, 
      categoryId: course.categoryId.toString() 
    });
    setBannerFile(null);
    setBannerPreview(course.cover?.startsWith("http") || course.cover?.startsWith("/") ? course.cover : null);
    setVideoFile(null);
    setCurrentCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!formData.title || !formData.level || !formData.categoryId || !formData.price) {
      showToast("Xatolik !", {
        title: "Iltimos barcha maydonlarni to'ldiring",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        const postData = new FormData();
        postData.append("name", formData.title);
        postData.append("description", formData.desc || formData.title);
        postData.append("price", formData.price.toString());
        postData.append("level", formData.level.toUpperCase());
        postData.append("categoryId", formData.categoryId.toString());
        if (bannerFile) {
          postData.append("banner", bannerFile);
        }
        if (videoFile) {
          postData.append("introVideo", videoFile);
        }

        const res = await baseAPI.post("/courses", postData);
        const createdCourse = res.data?.data || res.data;

        addCourse({
          title: formData.title,
          desc: formData.desc,
          price: Number(formData.price),
          level: formData.level,
          categoryId: Number(formData.categoryId),
          status: "active",
          cover: createdCourse?.banner || "bg-gradient-to-br from-blue-400 to-indigo-500",
          studentsCount: 0,
          rating: 5.0,
        });

        setSuccessMessage("Muvaffaqiyatli qo’shildi");
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
      } else if (modalMode === "edit" && currentCourse) {
        updateCourse(currentCourse.id, {
          title: formData.title,
          desc: formData.desc,
          price: Number(formData.price),
          level: formData.level,
          categoryId: Number(formData.categoryId)
        });
        setSuccessMessage("Muvaffaqiyatli o’zgartirildi");
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      console.error("Course save error:", err);
      showToast("Xatolik !", {
        title: err.response?.data?.message || "Kursni saqlashda xatolik yuz berdi",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (currentCourse) {
      deleteCourse(currentCourse.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage("Muvaffaqiyatli o'chirildi");
      setIsSuccessModalOpen(true);
      setSelectedRows(selectedRows.filter(id => id !== currentCourse.id));
    }
  };

  const handleAssignAssistant = () => {
    if (currentCourse && assistant) {
      assignAssistant(currentCourse.id, assistant);
      setIsAssignModalOpen(false);
      setCurrentCourse({ ...currentCourse, assistant });
      setAssistant("");
      setSuccessMessage("Assistent biriktirildi");
      setIsSuccessModalOpen(true);
    }
  };

  const handleRemoveAssistant = () => {
    if (currentCourse) {
      removeAssistant(currentCourse.id);
      setCurrentCourse({ ...currentCourse, assistant: undefined });
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || "Noma'lum";
  };
  
  const downloadXLS = () => {
    const headers = ["ID", "Kurs nomi", "Darajasi", "Narxi", "Kategoriya", "Holati"];
    const rows = courses.map(c => [c.id, c.title, c.level, c.price, getCategoryName(c.categoryId), c.status].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kurslar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
        {/* Courses List Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-7 flex flex-col min-h-full">
            {/* Box Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[22px] font-bold text-gray-900 mb-1.5">Kurslar</h1>
                <div className="flex items-center text-[13px] font-medium gap-2">
                  <span className="text-gray-500">Kurslar</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-gray-700">
                    Faollashtirilgan
                  </span>
                  <button 
                    onClick={handleBulkToggle}
                    className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                      selectedAreActive && selectedRows.length > 0 ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                      selectedAreActive && selectedRows.length > 0 ? "translate-x-4" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>
                <button 
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
                >
                  <Plus size={18} />
                  Qo’shish
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Search */}
              <div className="relative w-[340px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Izlash"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer border-l border-gray-200 my-2.5 pl-3">
                  <Filter size={16} className="text-gray-400 hover:text-gray-600" />
                </div>
              </div>

              {/* Top Pagination Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium relative group">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-transparent outline-none cursor-pointer pr-5"
                  >
                    <option value={10}>Bir sahifada 10</option>
                    <option value={20}>Bir sahifada 20</option>
                    <option value={50}>Bir sahifada 50</option>
                  </select>
                  <ChevronDown size={14} className="text-gray-500 absolute right-0 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 flex items-center justify-center rounded text-[13px] font-medium transition-colors ${currentPage === page ? "bg-white border border-gray-200 shadow-sm text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-400 px-1 font-medium text-xs">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2.5 h-7 flex items-center justify-center rounded bg-white border border-gray-200 shadow-sm text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors ml-1 disabled:opacity-50"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 mb-6 border border-gray-100">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-white text-[13px] text-gray-900 font-bold tracking-wide border-b border-gray-100">
                      <th className="px-5 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={isAllSelected}
                          className="rounded border-gray-300 w-4 h-4 accent-blue-600 cursor-pointer" 
                        />
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Banner <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        Kurs nomi
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Darajasi <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Narxi <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 cursor-pointer group">
                          Kategoriya <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-center cursor-pointer group">
                          Holati <Filter size={14} className="text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold whitespace-nowrap text-center">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] text-gray-800 divide-y divide-gray-100">
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course) => (
                        <tr key={course.id} className={`${selectedRows.includes(course.id) ? "bg-blue-50/50 hover:bg-blue-50/70" : "bg-white hover:bg-gray-50"} transition-colors group`}>
                          <td className="px-5 py-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(course.id)}
                              onChange={() => handleSelectRow(course.id)}
                              className="rounded border-gray-300 w-4 h-4 accent-blue-600 cursor-pointer" 
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className={`w-[52px] h-[32px] mx-auto rounded ${course.cover || 'bg-gray-200'} shadow-sm`}></div>
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900">
                            <Link href={`/dashboard/courses/allCourses/${course.id}/sections`} className="hover:text-blue-600 hover:underline transition-colors">
                              {course.title}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-gray-600 font-medium capitalize text-center">{course.level}</td>
                          <td className="px-5 py-4 text-gray-900 font-medium text-center">{(course.price).toLocaleString()}</td>
                          <td className="px-5 py-4 text-gray-600 text-center">{getCategoryName(course.categoryId)}</td>
                          <td className="px-5 py-4 text-center">
                            {course.status === 'active' ? (
                              <span className="text-green-600 font-medium text-[13px]">Faol</span>
                            ) : (
                              <span className="text-red-500 font-medium text-[13px]">Nofaol</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-3 text-gray-400">
                              <button 
                                onClick={() => {
                                  setCurrentCourse(course);
                                  setIsViewModalOpen(true);
                                }}
                                className="hover:text-blue-600 transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => openEditModal(course)}
                                className="hover:text-blue-600 transition-colors"
                              >
                                <Pen size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setCurrentCourse(course);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          Ma'lumot topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Pagination */}
            <div className="mt-auto">
               <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                }}
                onDownloadXLS={downloadXLS}
              />
            </div>

          </div>
        </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Qo’shish" : "Tahrirlash"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              
              {/* Uploads */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Banner</label>
                  <input 
                    type="file" 
                    ref={bannerInputRef} 
                    accept="image/*" 
                    onChange={handleBannerChange} 
                    className="hidden" 
                  />
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className={`border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center ${bannerPreview ? "p-1.5" : "py-6 px-4"} bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group text-center relative overflow-hidden`}
                  >
                    {bannerPreview ? (
                      <div className="w-full h-24 relative rounded-xl overflow-hidden group">
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                          O'zgartirish
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-[12px] text-gray-500 mb-0.5"><span className="text-blue-600 font-medium">Bu yerga bosing</span> yoki faylni tanlang</p>
                        <p className="text-[10px] text-gray-400">SVG, PNG, JPG (max. 800x400)</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kirish video</label>
                  <input 
                    type="file" 
                    ref={videoInputRef} 
                    accept="video/*" 
                    onChange={handleVideoChange} 
                    className="hidden" 
                  />
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className={`border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center ${videoFile ? "p-2" : "py-6 px-4"} bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group text-center relative overflow-hidden`}
                  >
                    {videoFile ? (
                      <div className="flex flex-col items-center p-2 text-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 text-sm font-bold">
                          ✓
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[130px]">{videoFile.name}</p>
                        <p className="text-[10px] text-gray-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud size={20} />
                        </div>
                        <p className="text-[12px] text-gray-500 mb-0.5"><span className="text-blue-600 font-medium">Bu yerga bosing</span> yoki faylni tanlang</p>
                        <p className="text-[10px] text-gray-400">MP4, WebM (max. 50MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kurs nomi</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Kiriting" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Kurs haqida</label>
                <textarea 
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Kiriting" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow resize-none"
                />
              </div>

              {/* Level & Price */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Darajasi</label>
                  <CustomSelect
                    options={[
                      { value: "beginner", label: "Beginner" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                    value={formData.level}
                    onChange={(v) => setFormData({ ...formData, level: v })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Narxi</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="400 000" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400 transition-shadow"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-semibold text-gray-700">Kategoriya</label>
                  {categories.length === 0 && (
                    <Link href="/dashboard/courses/categories" className="text-xs text-blue-600 hover:underline">
                      + Kategoriya yaratish
                    </Link>
                  )}
                </div>
                <CustomSelect
                  options={categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))}
                  value={formData.categoryId}
                  onChange={(v) => setFormData({ ...formData, categoryId: v })}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-100 flex items-center bg-gray-50/50 rounded-b-3xl">
              <button 
                onClick={handleSaveCourse}
                disabled={isSubmitting || !formData.title || !formData.level || !formData.categoryId || !formData.price}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-3xl font-bold">?</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-8">Siz rostdan ham o’chirmoqchimisiz?</h2>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                O’chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-8">{successMessage}</h2>
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm inline-block"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* View Course Details Modal */}
      {isViewModalOpen && currentCourse && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-125 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Batafsil</h2>
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  <EyeOff size={18} />
                </button>
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(currentCourse);
                  }}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pen size={18} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              <div>
                <p className="text-[12px] font-semibold text-gray-500 mb-1">Kurs nomi</p>
                <p className="text-sm font-medium text-gray-900">{currentCourse.title}</p>
              </div>

              <div>
                <div className={`w-full h-32 rounded-xl ${currentCourse.cover || 'bg-gray-200'} shadow-sm mb-2`}></div>
                <div className="flex items-center gap-1.5 text-blue-600 text-[13px] font-medium cursor-pointer hover:underline">
                  <LinkIcon size={14} />
                  Banner.jpg
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Darajasi</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{currentCourse.level}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Narxi</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.price.toLocaleString()} so’m</p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Sana</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.createdAt}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Kategoriya</p>
                  <p className="text-sm font-medium text-gray-900">{getCategoryName(currentCourse.categoryId)}</p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Mentor</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.mentor || "Biriktirilmagan"}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Holati</p>
                  <p className={`text-sm font-medium ${currentCourse.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                    {currentCourse.status === 'active' ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Assistent</p>
                  {currentCourse.assistant ? (
                    <div className="flex items-center justify-between group">
                      <p className="text-sm font-medium text-gray-900">{currentCourse.assistant}</p>
                      <button 
                        onClick={handleRemoveAssistant}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAssignModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Biriktirish
                    </button>
                  )}
                </div>
                
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">O’quvchilar soni</p>
                  <p className="text-sm font-medium text-gray-900">{currentCourse.studentsCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Assistant Modal */}
      {isAssignModalOpen && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Assistent biriktirish</h2>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Assistentni tanlang</label>
              <CustomSelect
                options={[
                  { value: "Safarov Oybek", label: "Safarov Oybek" },
                  { value: "Aliyev Vali", label: "Aliyev Vali" },
                ]}
                value={assistant}
                onChange={setAssistant}
              />
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex items-center bg-gray-50/50 rounded-b-3xl">
              <button 
                onClick={handleAssignAssistant}
                disabled={!assistant}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
