import Image from "next/image";
 
import avatar from "@/app/assets/bekzodsafarov.jpg"
interface CourseCardProps {
  id: number;
  title: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  progress: number;
  category?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onOpen?: () => void;
}

export default function CourseCard({
  id,
  title,
  instructor,
  instructorAvatar,
  thumbnail,
  progress,
  category = "UI/UX Dizayn",
  isLiked = false,
  onLike,
  onOpen,
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Course thumbnail */}
      <button onClick={onOpen} className="block w-full relative aspect-video overflow-hidden bg-gradient-to-br from-[#4F7FFF] to-[#3D6EEE]">
        {thumbnail && thumbnail !== "/bolakay.png" ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            style={{ objectPosition: 'center 20%' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm font-semibold">{title}</p>
            </div>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-[#10B981] text-white text-xs font-semibold rounded-full shadow-lg">
            {category}
          </span>
        </div>
      </button>

      {/* Course info */}
      <div className="p-4">
        {/* Instructor */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image
              src={avatar}
              alt={instructor}
              className="rounded-full object-cover h-[25px] w-[25px]"
            />
            <span className="text-xs font-medium text-[#64748B]">{instructor}</span>
          </div>
          <button
            onClick={onLike}
            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Like"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isLiked ? "#EF4444" : "none"}
              stroke={isLiked ? "#EF4444" : "#94A3B8"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>

        {/* Course title */}
        <button onClick={onOpen} className="w-full text-left hover:text-[#4F7FFF] transition-colors">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-3 line-clamp-2">
            {title}
          </h3>
        </button>

        {/* Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Ko&apos;rildi:</span>
            <span className="text-[#1a1a1a] font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F7FFF] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onOpen}
          className="w-full block text-center bg-[#4F7FFF] hover:bg-[#3D6EEE] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Ko&apos;rishni boshlash
        </button>
      </div>
    </div>
  );
}
