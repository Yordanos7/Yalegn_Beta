export type RateType = "HOURLY" | "FIXED"; // Align with JobType enum
export type ExperienceLevel = "ENTRY" | "INTERMEDIATE" | "EXPERT"; // Align with new enum
export type Rating = 1 | 2 | 3 | 4 | 5;
export type FreelancerLevel = "JUNIOR" | "MID" | "SENIOR"; // Align with new enum
export type EstimatedDelivery =
  | "ONE_TO_THREE_DAYS"
  | "THREE_TO_SEVEN_DAYS"
  | "ONE_TO_TWO_WEEKS"
  | "TWO_TO_FOUR_WEEKS"; // Align with new enum

export interface FreelancerFiltersState {
  search: string;
  category: string | null; // Will map to CategoryEnum string values
  rateType: RateType | null;
  experiences: ExperienceLevel | null;
  language: string | null; // User.languages is String[]
  rating: Rating | null;
  level: FreelancerLevel | null;
  estimatedDelivery: EstimatedDelivery | null;
  location: string | null; // Added based on User.location
  isVerified: boolean | null; // Added based on User.isVerified
  isOpenToWork: boolean | null; // Added based on User.isOpenToWork
}
