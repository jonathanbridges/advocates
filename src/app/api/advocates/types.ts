import { advocates } from "../../../db/schema";

export type SortField = "firstName" | "lastName" | "city" | "yearsOfExperience" | "createdAt";
export type SortOrder = "asc" | "desc";

export type Advocate = typeof advocates.$inferSelect;

export interface AdvocateFilters {
  search?: string;
  specialty?: string;
  city?: string;
  degree?: string;
  minExperience?: number;
  sortBy?: SortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableFilters {
  cities: string[];
  degrees: string[];
  specialties: string[];
  experienceRange: [number, number];
}

export interface AppliedFilters {
  search: string;
  specialty: string;
  city: string;
  degree: string;
  minExperience: number;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface AdvocatesResponse {
  data: Advocate[];
  pagination: PaginationInfo;
  filters: {
    available: AvailableFilters;
    applied: AppliedFilters;
  };
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
} 