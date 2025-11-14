// Common types used across the application

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
