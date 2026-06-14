import type {
  ClassFormat,
  ClassMode,
  EducationLevel,
  SessionStatus,
  Subject,
} from '@/types/shared';

export interface SessionItem {
  id: string;
  tutorId: string;
  format: ClassFormat;
  mode: ClassMode;
  subjects?: Subject[];
  level?: EducationLevel | null;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
  pricePerSeat: number;
  meetingUrl: string | null;
  location: string | null;
  tutor?: { whatsappNumber?: string | null; user: { name: string } };
  attendees?: Array<{
    id: string;
    studentId: string;
    paymentId: string | null;
    payment?: {
      id: string;
      status: 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED';
    } | null;
    student?: {
      whatsappNumber?: string | null;
      user: { name: string; email?: string };
    };
  }>;
}

export interface BookSessionForm {
  tutorId: string;
  format: ClassFormat;
  mode: ClassMode;
  startsAt: string;
  endsAt: string;
  pricePerSeat: string;
  attendeeStudentIds: string;
}

export interface BookSessionRequest {
  tutorId: string;
  format: ClassFormat;
  mode: ClassMode;
  startsAt: string;
  endsAt: string;
  pricePerSeat: number;
  attendeeStudentIds: string[];
}
