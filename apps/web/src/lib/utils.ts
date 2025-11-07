import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Star } from "lucide-react"; // Import Star icon

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StarProps {
  rating: number | null | undefined;
  totalStars?: number;
  starClassName?: string;
  fillClassName?: string;
  emptyClassName?: string;
}

export function renderStars({
  rating,
  totalStars = 5,
  starClassName = "h-4 w-4",
  fillClassName = "text-yellow-400 fill-yellow-400",
  emptyClassName = "text-gray-400",
}: StarProps) {
  const roundedRating = Math.round((rating || 0) * 2) / 2; // Round to nearest 0.5
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (roundedRating >= i) {
      // Full star
      stars.push(
        <Star key={i} className={`${starClassName} ${fillClassName}`} />
      );
    } else if (roundedRating >= i - 0.5) {
      // Half star
      stars.push(
        <Star
          key={i}
          className={`${starClassName} ${fillClassName}`}
          style={{
            clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)", // Clip to show half star
          }}
        />
      );
    } else {
      // Empty star
      stars.push(
        <Star key={i} className={`${starClassName} ${emptyClassName}`} />
      );
    }
  }
  return stars;
}
