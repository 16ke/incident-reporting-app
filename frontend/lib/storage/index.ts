/**
 * Local Storage Manager
 * AsyncStorage wrapper for incident data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IncidentReport, PersonalInfo, AppSettings } from '@/shared';
import { generateIncidentReference } from '@/shared';

const KEYS = {
  INCIDENTS: '@incidents',
  PERSONAL_INFO: '@personal_info',
  APP_SETTINGS: '@app_settings',
};

/**
 * Save incident to local storage
 */
export async function saveIncident(incident: IncidentReport): Promise<void> {
  try {
    const incidents = await getAllIncidents();
    const index = incidents.findIndex(i => i.id === incident.id);
    
    if (index >= 0) {
      incidents[index] = { ...incident, updatedAt: new Date().toISOString() };
    } else {
      incidents.push(incident);
    }
    
    await AsyncStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents));
  } catch (error: unknown) {
    console.error('Error saving incident:', error);
    throw error;
  }
}

/**
 * Get all incidents from local storage
 */
export async function getAllIncidents(): Promise<IncidentReport[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.INCIDENTS);
    return data ? JSON.parse(data) : [];
  } catch (error: unknown) {
    console.error('Error getting incidents:', error);
    return [];
  }
}

/**
 * Get incident by ID
 */
export async function getIncidentById(id: string): Promise<IncidentReport | null> {
  try {
    const incidents = await getAllIncidents();
    return incidents.find(i => i.id === id) || null;
  } catch (error: unknown) {
    console.error('Error getting incident by ID:', error);
    return null;
  }
}

/**
 * Delete incident
 */
export async function deleteIncident(id: string): Promise<void> {
  try {
    const incidents = await getAllIncidents();
    const filtered = incidents.filter(i => i.id !== id);
    await AsyncStorage.setItem(KEYS.INCIDENTS, JSON.stringify(filtered));
  } catch (error: unknown) {
    console.error('Error deleting incident:', error);
    throw error;
  }
}

/**
 * Create new incident with defaults
 */
export function createNewIncident(category: string): Partial<IncidentReport> {
  return {
    id: `incident_${Date.now()}`,
    referenceCode: generateIncidentReference(),
    category: category as any,
    dateOfIncident: new Date().toISOString().split('T')[0],
    timeOfIncident: new Date().toTimeString().slice(0, 5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    location: {},
    reportedBy: {
      name: '',
    },
    incidentDescription: {
      whatHappened: '',
      supervisionPresent: 'unknown',
      areaPreviouslyInspected: 'unknown',
    },
    reportStatus: 'draft',
  };
}

/**
 * Save personal info
 */
export async function savePersonalInfo(info: PersonalInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PERSONAL_INFO, JSON.stringify(info));
  } catch (error: unknown) {
    console.error('Error saving personal info:', error);
    throw error;
  }
}

/**
 * Get personal info
 */
export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PERSONAL_INFO);
    return data ? JSON.parse(data) : null;
  } catch (error: unknown) {
    console.error('Error getting personal info:', error);
    return null;
  }
}

/**
 * Save app settings
 */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error: unknown) {
    console.error('Error saving app settings:', error);
    throw error;
  }
}

/**
 * Get app settings
 */
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error: unknown) {
    console.error('Error getting app settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Get default app settings
 */
function getDefaultSettings(): AppSettings {
  return {
    theme: 'system',
    locationEnabled: true,
    autoFillPersonalInfo: true,
    defaultPdfExportType: 'full',
    language: 'en-GB',
  };
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.INCIDENTS,
      KEYS.PERSONAL_INFO,
      KEYS.APP_SETTINGS,
    ]);
  } catch (error: unknown) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

