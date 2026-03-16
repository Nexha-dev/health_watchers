export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  createdAt: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  notes: string;
  diagnosis: string;
  createdAt: string;
}

export interface PaymentIntent {
  patientId: string;
  amount: number;
  asset: string;
  memo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
