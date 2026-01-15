/**
 * Incident Store - Zustand State Management
 * Manages global incident state
 */

import { create } from 'zustand';
import type { IncidentReport, ValidationResult } from '@/shared';
import { validateIncident } from '@/shared';
import {
  saveIncident as saveToStorage,
  getAllIncidents,
  getIncidentById,
  deleteIncident as deleteFromStorage,
  createNewIncident,
} from '../storage';

interface IncidentStore {
  // State
  incidents: IncidentReport[];
  currentIncident: Partial<IncidentReport> | null;
  validationResult: ValidationResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadIncidents: () => Promise<void>;
  createIncident: (category: string) => void;
  loadIncident: (id: string) => Promise<void>;
  updateCurrentIncident: (updates: Partial<IncidentReport>) => void;
  saveCurrentIncident: () => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  validateCurrentIncident: () => ValidationResult;
  clearCurrentIncident: () => void;
  setError: (error: string | null) => void;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  // Initial state
  incidents: [],
  currentIncident: null,
  validationResult: null,
  isLoading: false,
  error: null,

  // Load all incidents from storage
  loadIncidents: async () => {
    set({ isLoading: true, error: null });
    try {
      const incidents = await getAllIncidents();
      set({ incidents, isLoading: false });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load incidents',
        isLoading: false 
      });
    }
  },

  // Create new incident
  createIncident: (category: string) => {
    const newIncident = createNewIncident(category);
    set({ currentIncident: newIncident, validationResult: null, error: null });
  },

  // Load existing incident
  loadIncident: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const incident = await getIncidentById(id);
      if (incident) {
        set({ currentIncident: incident, isLoading: false });
      } else {
        set({ error: 'Incident not found', isLoading: false });
      }
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load incident',
        isLoading: false 
      });
    }
  },

  // Update current incident
  updateCurrentIncident: (updates: Partial<IncidentReport>) => {
    const current = get().currentIncident;
    if (current) {
      set({ currentIncident: { ...current, ...updates } });
    }
  },

  // Save current incident
  saveCurrentIncident: async () => {
    const current = get().currentIncident;
    if (!current) {
      throw new Error('No incident to save');
    }

    // Validate before saving
    const validation = validateIncident(current as IncidentReport);
    set({ validationResult: validation });

    if (!validation.valid) {
      throw new Error('Incident validation failed');
    }

    set({ isLoading: true, error: null });
    try {
      await saveToStorage(current as IncidentReport);
      
      // Reload incidents
      await get().loadIncidents();
      
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save incident',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete incident
  deleteIncident: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteFromStorage(id);
      await get().loadIncidents();
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete incident',
        isLoading: false 
      });
      throw error;
    }
  },

  // Validate current incident
  validateCurrentIncident: () => {
    const current = get().currentIncident;
    if (!current) {
      return { valid: false, errors: [], warnings: [] };
    }

    const result = validateIncident(current as IncidentReport);
    set({ validationResult: result });
    return result;
  },

  // Clear current incident
  clearCurrentIncident: () => {
    set({ currentIncident: null, validationResult: null, error: null });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

