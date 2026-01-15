/**
 * App Configuration
 */

export const APP_CONFIG = {
  name: 'OhOh! Incident Reporter',
  version: '1.0.0',
  description: 'Professional incident investigation and reporting for UK workplaces',
  
  // Backend API (optional, for PDF generation)
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  
  // Feature flags
  features: {
    offlineMode: true,
    gpsLocation: true,
    photoAttachments: true,
    videoAttachments: false, // Coming soon
    signatures: true,
  },
  
  // Validation
  minDescriptionLength: 20,
  maxAttachments: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // UI
  colors: {
    primary: '#003366',
    secondary: '#FFB81C',
    danger: '#D32F2F',
    success: '#2E7D32',
    warning: '#F57C00',
    background: '#F5F5F5',
    text: '#333333',
    textLight: '#666666',
  },
};

export const INCIDENT_CATEGORIES = [
  {
    id: 'personal_injury',
    label: 'Personal Injury',
    description: 'Injuries to employees, contractors, or others',
    icon: 'user-x',
    color: APP_CONFIG.colors.danger,
  },
  {
    id: 'property_damage',
    label: 'Property Damage',
    description: 'Damage to buildings, equipment, or assets',
    icon: 'building',
    color: APP_CONFIG.colors.warning,
  },
  {
    id: 'vehicle_incident',
    label: 'Vehicle Incident',
    description: 'Road traffic incidents involving company vehicles',
    icon: 'car',
    color: APP_CONFIG.colors.secondary,
  },
  {
    id: 'public_liability',
    label: 'Public Liability',
    description: 'Incidents involving members of the public',
    icon: 'users',
    color: APP_CONFIG.colors.primary,
  },
];
