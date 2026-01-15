/**
 * Shared utility functions
 */

import type { IncidentReport } from '../types/incident';

/**
 * Generate a unique incident reference code
 * Format: INC-YYYYMMDD-XXXX
 */
export function generateIncidentReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `INC-${year}${month}${day}-${random}`;
}

/**
 * Format date to UK format (DD/MM/YYYY)
 */
export function formatDateUK(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to UK format (HH:mm)
 */
export function formatTimeUK(time: string): string {
  if (time.includes(':')) {
    return time;
  }
  return time;
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}

/**
 * Get category label from category value
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    personal_injury: 'Personal Injury',
    property_damage: 'Property Damage',
    vehicle_incident: 'Vehicle Incident',
    public_liability: 'Public Liability',
  };
  return labels[category] || category;
}

/**
 * Check if incident is potentially RIDDOR reportable
 * Note: This is a helper only - proper RIDDOR assessment requires expert judgment
 */
export function isPotentiallyRIDDORReportable(incident: IncidentReport): boolean {
  // Death or major injury
  if (incident.injuryDetails?.severity === 'fatal' || incident.injuryDetails?.severity === 'severe') {
    return true;
  }
  
  // Over 7 days absence
  if (incident.injuryDetails?.expectedLostTimeDays && incident.injuryDetails.expectedLostTimeDays > 7) {
    return true;
  }
  
  // Hospital admission
  if (incident.injuryDetails?.hospitalVisit?.admissionRequired) {
    return true;
  }
  
  return false;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Create a deep copy of an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}
