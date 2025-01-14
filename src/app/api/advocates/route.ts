import { sql, type SQL } from "drizzle-orm";
import { and, asc, desc, ilike, or } from "drizzle-orm/expressions";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import type { AdvocatesResponse, AvailableFilters, ErrorResponse, Advocate } from "./types";
import { validateAndParseFilters } from "./validation";
import { advocateData } from "../../../db/seed/advocates";

/**
 * GET handler for advocates API endpoint
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    console.log('Incoming search params:', Object.fromEntries(searchParams.entries()));
    
    const filters = validateAndParseFilters(searchParams);
    console.log('Parsed filters:', filters);

    try {
      // Test database connection
      await db.select().from(advocates).limit(1);
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback data in development');
        
        // Transform advocate data to match required type
        const mockAdvocates: Advocate[] = advocateData.map((advocate, index) => ({
          ...advocate,
          id: index + 1,
          createdAt: new Date(),
          specialties: advocate.specialties as unknown as string[],
        }));

        const mockResponse: AdvocatesResponse = {
          data: mockAdvocates,
          pagination: {
            total: mockAdvocates.length,
            page: 1,
            limit: 10,
            totalPages: Math.ceil(mockAdvocates.length / 10),
          },
          filters: {
            available: {
              cities: Array.from(new Set(mockAdvocates.map(a => a.city))),
              degrees: Array.from(new Set(mockAdvocates.map(a => a.degree))),
              specialties: [],
              experienceRange: [0, 15],
            },
            applied: {
              search: "",
              specialty: "",
              city: "",
              degree: "",
              minExperience: 0,
              sortBy: "createdAt",
              order: "desc",
              page: 1,
              limit: 10,
            },
          },
        };
        return new Response(JSON.stringify(mockResponse), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      throw dbError;
    }
    
    const {
      page = 1,
      limit = 10,
      search,
      specialty,
      city,
      degree,
      minExperience,
      sortBy = "createdAt",
      order = "desc"
    } = filters;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build base conditions array
    const conditions: SQL<unknown>[] = [];

    // Add minimum experience filter if provided
    if (minExperience !== undefined) {
      conditions.push(sql`${advocates.yearsOfExperience} >= ${minExperience}`);
    }

    // Add text search conditions if search parameter is provided
    if (search) {
      const searchConditions: SQL<unknown>[] = [
        ilike(advocates.firstName, `%${search}%`),
        ilike(advocates.lastName, `%${search}%`),
        sql`${search}::text = ANY(${advocates.specialties})`
      ];
      conditions.push(sql`(${or(...searchConditions)})`);
    }

    // Add specialty filter using array containment
    if (specialty) {
      conditions.push(sql`${specialty}::text = ANY(${advocates.specialties})`);
    }

    // Add exact match filters for city and degree
    if (city) {
      conditions.push(sql`${advocates.city} = ${city}`);
    }

    if (degree) {
      conditions.push(sql`${advocates.degree} = ${degree}`);
    }

    console.log('SQL conditions:', conditions);

    // Build dynamic sort expression based on user input
    const sortExpression = order === "asc" 
      ? asc(advocates[sortBy === "yearsOfExperience" ? "yearsOfExperience" : sortBy === "firstName" ? "firstName" : sortBy === "lastName" ? "lastName" : sortBy === "city" ? "city" : "createdAt"])
      : desc(advocates[sortBy === "yearsOfExperience" ? "yearsOfExperience" : sortBy === "firstName" ? "firstName" : sortBy === "lastName" ? "lastName" : sortBy === "city" ? "city" : "createdAt"]);

    // Execute main query with all conditions
    const data = await db
      .select()
      .from(advocates)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sortExpression)
      .limit(limit)
      .offset(offset);

    console.log('Query result data:', data);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ 
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(advocates)
      .where(conditions.length ? and(...conditions) : undefined);

    console.log('Total count:', count);

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    // Get available filters
    const availableFilters = await getAvailableFilters();
    console.log('Available filters:', availableFilters);

    // Prepare response with data, pagination, and filters
    const response: AdvocatesResponse = {
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
      filters: {
        available: availableFilters,
        applied: {
          search: search || "",
          specialty: specialty || "",
          city: city || "",
          degree: degree || "",
          minExperience: minExperience || 0,
          sortBy,
          order,
          page,
          limit,
        },
      },
    };

    // Return response with caching headers for Next.js
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });

  } catch (error) {
    console.error("Detailed error in advocates API:", {
      name: error instanceof Error ? error.name : 'Unknown error type',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    const errorResponse: ErrorResponse = {
      error: "Failed to fetch advocates",
      details: process.env.NODE_ENV === "development" ? {
        name: error instanceof Error ? error.name : 'Unknown error type',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      } : undefined,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

/**
 * Helper function to get available filter options
 * Fetches distinct values for cities, degrees, specialties, and experience range
 */
async function getAvailableFilters(): Promise<AvailableFilters> {
  const [cities] = await db
    .select({
      values: sql<string[]>`array_agg(DISTINCT city ORDER BY city)`
        .mapWith((x) => x || [])
    })
    .from(advocates);

  const [degrees] = await db
    .select({
      values: sql<string[]>`array_agg(DISTINCT degree ORDER BY degree)`
        .mapWith((x) => x || [])
    })
    .from(advocates);

  const [specialties] = await db
    .select({
      values: sql<string[]>`array_agg(DISTINCT value ORDER BY value)`.mapWith((x) => x || [])
    })
    .from(sql`(SELECT unnest(specialties) as value FROM ${advocates}) as s`);

  const [experience] = await db
    .select({
      min: sql<number>`COALESCE(min(${advocates.yearsOfExperience}), 0)`,
      max: sql<number>`COALESCE(max(${advocates.yearsOfExperience}), 0)`
    })
    .from(advocates);

  return {
    cities: cities.values,
    degrees: degrees.values,
    specialties: specialties.values,
    experienceRange: [experience.min, experience.max],
  };
}
