import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (error.response?.status === 401) return "Please sign in again to continue.";
    if (error.response?.status === 403) return "You do not have permission to do that.";
    if (error.response?.status === 404) return "The requested information was not found.";
    if (error.response?.status === 409) return "This action has already been completed.";
  }
  return error instanceof Error ? error.message : fallback;
}

export function readList<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): T[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null && "data" in value
      ? value.data
      : null;

  if (!Array.isArray(list) || !list.every(isItem)) {
    throw new Error("The server returned data in an unexpected format.");
  }

  return list;
}

export function readItem<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): T {
  const item =
    typeof value === "object" && value !== null && "data" in value
      ? value.data
      : value;

  if (!isItem(item)) {
    throw new Error("The server returned data in an unexpected format.");
  }

  return item;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isTuition(value: unknown): value is import("@/types").Tuition {
  if (!isObject(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.subject === "string" &&
    typeof value.classLevel === "string" &&
    (value.mode === "Online" || value.mode === "Offline") &&
    typeof value.monthlyFee === "number" &&
    typeof value.daysPerWeek === "number" &&
    typeof value.description === "string" &&
    typeof value.tutorName === "string" &&
    typeof value.tutorEmail === "string" &&
    (value.approvalStatus === "pending" ||
      value.approvalStatus === "approved" ||
      value.approvalStatus === "rejected") &&
    typeof value.isActive === "boolean"
  );
}

export function isApplication(value: unknown): value is import("@/types").Application {
  if (!isObject(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.tuitionId === "string" &&
    typeof value.tuitionTitle === "string" &&
    typeof value.studentName === "string" &&
    typeof value.studentEmail === "string" &&
    (value.status === "pending" ||
      value.status === "accepted" ||
      value.status === "rejected") &&
    typeof value.appliedAt === "string"
  );
}

export function isUser(value: unknown): value is import("@/types").User {
  if (!isObject(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (value.role === "student" || value.role === "tutor" || value.role === "admin") &&
    (value.plan === "free" || value.plan === "pro")
  );
}

export function isPayment(value: unknown): value is import("@/types").Payment {
  if (!isObject(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.userEmail === "string" &&
    typeof value.userName === "string" &&
    typeof value.amount === "number" &&
    typeof value.transactionId === "string" &&
    typeof value.paidAt === "string"
  );
}

export function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}
