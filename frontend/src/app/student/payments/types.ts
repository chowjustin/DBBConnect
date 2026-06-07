import type {
  PaymentKind,
  PaymentMethod,
  PaymentStatus,
} from '@/types/shared';

export interface PaymentItem {
  id: string;
  kind: PaymentKind;
  refId: string;
  method: PaymentMethod;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  commission: number;
  status: PaymentStatus;
  proofUrl: string | null;
  notes: string | null;
  createdAt: string;
  receivedToBank?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | null;
}

export interface PlatformBank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes: string | null;
  isActive: boolean;
}

export interface UploadProofForm {
  kind: PaymentKind;
  refId: string;
  method: PaymentMethod;
  promoCode: string;
  proofImage: File | null;
}

export interface PreviewDiscountResponse {
  gross: number;
  discount: number;
  net: number;
}
