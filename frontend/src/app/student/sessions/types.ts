import type { ClassFormat, ClassMode, SessionStatus } from '@/types/shared';

export interface SessionItem {
  id: string;
  tutorId: string;
  format: ClassFormat;
  mode: ClassMode;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
  pricePerSeat: number;
  meetingUrl: string | null;
  location: string | null;
  tutor?: { user: { name: string } };
  attendees?: Array<{ id: string; studentId: string; paymentId: string | null }>;
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
