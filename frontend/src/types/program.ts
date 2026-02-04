/**
 * Program Management Types
 * 
 * Type definitions for program management feature.
 * These types align with the backend DTOs and API contracts.
 */

/**
 * Main Program Interface
 * Represents a program entity
 */
export interface Program {
  id: number;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Program Form DTO
 * Data transfer object for creating or updating a program
 */
export interface ProgramFormDto {
  name: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
}
