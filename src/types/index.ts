export type Role = "student" | "tutor" | "admin";
export type Plan = "free" | "pro";
export type Approval = "pending" | "approved" | "rejected";
export type AppStatus = "pending" | "accepted" | "rejected";

export type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  phone?: string;
  bio?: string;
  plan: Plan;
  createdAt: string;
};

export type Tuition = {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: Approval;
  isActive: boolean;
  createdAt: string;
};

export type Application = {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
  status: AppStatus;
  appliedAt: string;
};

export type Payment = {
  _id: string;
  userEmail: string;
  userName: string;
  userRole: Role;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
};

export type TutorStats = {
  totalTuitions: number;
  activeApproved: number;
  totalApplicants: number;
  plan: Plan;
};

export type StudentStats = {
  total: number;
  accepted: number;
  pending: number;
  plan: Plan;
};
