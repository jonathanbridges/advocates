export type SortField = "firstName" | "lastName" | "city" | "yearsOfExperience" | "createdAt";
export type SortOrder = "asc" | "desc";

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

const VALID_SORT_FIELDS: SortField[] = ["firstName", "lastName", "city", "yearsOfExperience", "createdAt"];
const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

/**
 * Validates and parses URL search parameters into strongly typed filter objects
 * 
 * @param searchParams - URLSearchParams object containing raw filter parameters
 * @returns AdvocateFilters - Validated and parsed filter object
 */
export function validateAndParseFilters(searchParams: URLSearchParams): AdvocateFilters {
  /**
   * Safely parses integer values with min/max bounds
   * 
   * @param value - String value to parse
   * @param fallback - Default value if parsing fails
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns number | undefined - Parsed and bounded number or fallback
   */
  const safeParseInt = (value: string | null, fallback: number | undefined, min: number, max: number) => {
    if (!value) return fallback;
    const parsed = parseInt(value);
    if (isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
  };

  /**
   * Safely gets and trims string parameters
   * 
   * @param param - Raw string parameter
   * @returns string | undefined - Trimmed string or undefined if empty
   */
  const safeGetString = (param: string | null): string | undefined => {
    if (!param) return undefined;
    const trimmed = param.trim();
    return trimmed === "" ? undefined : trimmed;
  };

  // Validate and parse all parameters
  const filters: AdvocateFilters = {
    page: safeParseInt(searchParams.get("page"), 1, 1, Infinity),
    limit: safeParseInt(searchParams.get("limit"), 10, 1, 50),
    search: safeGetString(searchParams.get("search")),
    specialty: safeGetString(searchParams.get("specialty")),
    city: safeGetString(searchParams.get("city")),
    degree: safeGetString(searchParams.get("degree")),
    minExperience: safeParseInt(searchParams.get("minExperience"), undefined, 0, Infinity),
  };

  // Validate sort parameters
  const sortBy = searchParams.get("sortBy");
  if (sortBy && VALID_SORT_FIELDS.includes(sortBy as SortField)) {
    filters.sortBy = sortBy as SortField;
  }

  const order = searchParams.get("order");
  if (order && VALID_SORT_ORDERS.includes(order as SortOrder)) {
    filters.order = order as SortOrder;
  }

  return filters;
} 