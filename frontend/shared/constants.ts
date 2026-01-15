/**
 * Shared constants for incident reporting
 * UK HSE-aligned reference data
 */

export const INCIDENT_CATEGORIES = {
  PERSONAL_INJURY: 'personal_injury',
  PROPERTY_DAMAGE: 'property_damage',
  VEHICLE_INCIDENT: 'vehicle_incident',
  PUBLIC_LIABILITY: 'public_liability',
} as const;

export const INCIDENT_CATEGORY_LABELS = {
  personal_injury: 'Personal Injury',
  property_damage: 'Property Damage',
  vehicle_incident: 'Vehicle Incident',
  public_liability: 'Public Liability',
} as const;

export const INJURY_TYPES = [
  'Cut',
  'Laceration',
  'Fracture',
  'Sprain',
  'Strain',
  'Burn',
  'Scald',
  'Bruise',
  'Concussion',
  'Crush injury',
  'Amputation',
  'Chemical exposure',
  'Electrical shock',
  'Heat exhaustion',
  'Hypothermia',
  'Respiratory illness',
  'Skin condition',
  'Repetitive strain injury',
  'Other',
] as const;

export const BODY_PARTS = [
  { value: 'head', label: 'Head' },
  { value: 'face', label: 'Face' },
  { value: 'eye', label: 'Eye(s)' },
  { value: 'ear', label: 'Ear(s)' },
  { value: 'neck', label: 'Neck' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'arm', label: 'Arm' },
  { value: 'elbow', label: 'Elbow' },
  { value: 'wrist', label: 'Wrist' },
  { value: 'hand', label: 'Hand' },
  { value: 'finger', label: 'Finger(s)' },
  { value: 'chest', label: 'Chest' },
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'back', label: 'Back' },
  { value: 'hip', label: 'Hip' },
  { value: 'leg', label: 'Leg' },
  { value: 'knee', label: 'Knee' },
  { value: 'ankle', label: 'Ankle' },
  { value: 'foot', label: 'Foot' },
  { value: 'toe', label: 'Toe(s)' },
  { value: 'multiple', label: 'Multiple body parts' },
  { value: 'other', label: 'Other' },
] as const;

export const PPE_TYPES = [
  'Safety helmet / Hard hat',
  'Safety goggles / Glasses',
  'Face shield',
  'Ear defenders / Ear plugs',
  'Respirator / Dust mask',
  'High-visibility vest',
  'Safety gloves',
  'Safety boots / Shoes',
  'Knee pads',
  'Safety harness',
  'Fall arrest equipment',
  'Protective clothing',
  'Other',
] as const;

export const CONTRIBUTING_FACTORS = [
  { value: 'human_error', label: 'Human error' },
  { value: 'mechanical_failure', label: 'Mechanical failure' },
  { value: 'poor_housekeeping', label: 'Poor housekeeping' },
  { value: 'inadequate_lighting', label: 'Inadequate lighting' },
  { value: 'slippery_surfaces', label: 'Slippery surfaces' },
  { value: 'inadequate_training', label: 'Inadequate training' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'lack_of_ppe', label: 'Lack of PPE' },
  { value: 'time_pressure', label: 'Time pressure' },
  { value: 'structural_defects', label: 'Structural defects' },
  { value: 'weather_conditions', label: 'Weather conditions' },
  { value: 'inadequate_supervision', label: 'Inadequate supervision' },
  { value: 'communication_breakdown', label: 'Communication breakdown' },
  { value: 'equipment_misuse', label: 'Equipment misuse' },
  { value: 'lack_of_maintenance', label: 'Lack of maintenance' },
  { value: 'other', label: 'Other' },
] as const;

export const ASSET_TYPES = [
  'Building',
  'Machinery',
  'Hand tool',
  'Power tool',
  'Vehicle',
  'Computer equipment',
  'Furniture',
  'Fixture',
  'Electrical equipment',
  'Other',
] as const;

export const ROAD_CONDITIONS = [
  'Dry',
  'Wet',
  'Icy',
  'Snow covered',
  'Uneven surface',
  'Pothole',
  'Poor road markings',
  'Other',
] as const;

export const WEATHER_CONDITIONS = [
  'Clear',
  'Cloudy',
  'Light rain',
  'Heavy rain',
  'Fog / Mist',
  'Snow',
  'Sleet',
  'High winds',
  'Other',
] as const;

/**
 * RIDDOR reportable injury types
 * As per RIDDOR 2013 regulations
 */
export const RIDDOR_REPORTABLE_INJURIES = [
  'Fracture (excluding fingers, thumbs, toes)',
  'Amputation',
  'Permanent loss of sight / reduction in sight',
  'Crush injury leading to internal organ damage',
  'Serious burns (covering more than 10% of body)',
  'Scalping requiring hospital treatment',
  'Unconsciousness caused by head injury or asphyxia',
  'Any injury from electric shock or burn leading to unconsciousness',
  'Any injury from absorption of substance leading to acute ill health',
  'Over 7 days absence from work',
  'Death',
] as const;

/**
 * UK HSE legal disclaimer text
 */
export const LEGAL_DISCLAIMER = `
This incident report is an internal document prepared for workplace health and safety management purposes.
It does not constitute a statutory notification to the Health and Safety Executive (HSE) under RIDDOR 2013.

Reportable incidents must be notified to the HSE separately through the official RIDDOR reporting system.

This document may contain personal data processed in accordance with UK GDPR and Data Protection Act 2018.
Unauthorized disclosure or distribution is prohibited.
`;

export const GDPR_STATEMENT = `
Personal data in this report is processed lawfully under Article 6(1)(f) GDPR (legitimate interests)
for workplace health and safety management and legal compliance purposes.

Data will be retained in accordance with the organization's data retention policy and UK legal requirements.
Individuals have rights of access, rectification, and erasure subject to legal obligations.
`;
