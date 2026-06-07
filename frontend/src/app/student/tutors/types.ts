import type {
  EducationLevel,
  Subject,
  TeachingMethod,
} from '@/types/shared';

export interface TutorSearchItem {
  id: string;
  bio: string | null;
  hourlyRate: number | null;
  subjects: Subject[];
  educationLevels: EducationLevel[];
  teachingMethods: TeachingMethod[];
  averageRating: number;
  reviewCount: number;
  featured: boolean;
  user: { id: string; name: string; email: string };
}

export interface TutorSearchFilters {
  name?: string;
  subject?: Subject;
  educationLevel?: EducationLevel;
  methods?: TeachingMethod[];
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  sortBy?: 'rating' | 'priceAsc' | 'priceDesc' | 'featured';
}
