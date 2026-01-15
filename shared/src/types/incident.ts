/**
 * OOH Incident Reporter - Shared Type Definitions
 * 
 * UK HSE & Insurance-Compliant Incident Investigation Types
 * RIDDOR-aligned structure for workplace incident reporting
 * 
 * @module types/incident
 */

/**
 * Incident categories as per UK workplace incident classification
 */
export type IncidentCategory = 
  | 'personal_injury' 
  | 'property_damage' 
  | 'vehicle_incident' 
  | 'public_liability';

/**
 * Injury severity classification aligned with RIDDOR requirements
 */
export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'fatal';

/**
 * Asset condition assessment
 */
export type AssetCondition = 'good' | 'fair' | 'poor' | 'unknown';

/**
 * Yes/No/Unknown response type for investigation questions
 */
export type YesNoUnknown = 'yes' | 'no' | 'unknown';

/**
 * Corrective action status tracking
 */
export type ActionStatus = 'open' | 'in_progress' | 'closed';

/**
 * Role/relationship of person involved in incident
 */
export type PersonRole = 
  | 'employee' 
  | 'contractor' 
  | 'visitor' 
  | 'member_of_public' 
  | 'other';

/**
 * GPS coordinates for incident location
 */
export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

/**
 * Location details for incident
 * Combines GPS data with manual address entry
 */
export interface IncidentLocation {
  gpsCoordinates?: GpsCoordinates;
  manualAddress?: string;
  siteName?: string;
  department?: string;
  area?: string;
  postcode?: string;
}

/**
 * Person reporting the incident
 */
export interface ReportingPerson {
  name: string;
  jobTitle?: string;
  contactNumber?: string;
  email?: string;
  employer?: string;
  department?: string;
}

/**
 * Person present at incident scene
 */
export interface PersonPresent {
  name: string;
  role?: string;
  contactDetails?: string;
}

/**
 * Witness details including statement
 */
export interface Witness {
  name: string;
  contactDetails?: string;
  statement?: string;
  statementDate?: string;
}

/**
 * Training details for person involved
 */
export interface TrainingDetails {
  hasTraining: boolean;
  trainingType?: string;
  dateCompleted?: string;
  expiryDate?: string;
  details?: string;
}

/**
 * Person involved in the incident
 * Used for personal injury and public liability cases
 */
export interface PersonInvolved {
  fullName: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  roleOrRelationship: PersonRole;
  roleOtherDetails?: string;
  employer?: string;
  contactDetails?: string;
  address?: string;
  lengthOfEmploymentMonths?: number;
  relevantTraining?: TrainingDetails;
}

/**
 * PPE (Personal Protective Equipment) usage details
 */
export interface PPEUsage {
  used: boolean;
  types?: string[]; // helmet, gloves, boots, goggles, hi-vis, etc.
  functioningProperly?: boolean;
  defectsNoted?: string;
}

/**
 * First aid treatment details
 */
export interface FirstAidDetails {
  given: boolean;
  treatedBy?: string;
  treatment?: string;
  timeAdministered?: string;
}

/**
 * Hospital visit information
 */
export interface HospitalVisit {
  wentToHospital: boolean;
  hospitalName?: string;
  hospitalAddress?: string;
  timeOfArrival?: string;
  admissionRequired?: boolean;
  treatmentReceived?: string;
  dischargeTime?: string;
}

/**
 * Body parts that can be affected in an injury
 */
export type BodyPart = 
  | 'head' 
  | 'face' 
  | 'eye' 
  | 'ear' 
  | 'neck' 
  | 'shoulder' 
  | 'arm' 
  | 'elbow' 
  | 'wrist' 
  | 'hand' 
  | 'finger' 
  | 'chest' 
  | 'abdomen' 
  | 'back' 
  | 'hip' 
  | 'leg' 
  | 'knee' 
  | 'ankle' 
  | 'foot' 
  | 'toe' 
  | 'multiple' 
  | 'other';

/**
 * Injury details for personal injury incidents
 * Aligned with RIDDOR injury reporting requirements
 */
export interface InjuryDetails {
  natureOfInjury: string; // cut, fracture, sprain, burn, bruise, etc.
  bodyPartsAffected: BodyPart[];
  bodyPartOther?: string;
  severity: InjurySeverity;
  firstAidGiven?: FirstAidDetails;
  hospitalVisit?: HospitalVisit;
  expectedLostTimeDays?: number;
  actualLostTimeDays?: number;
  permanentDisability?: boolean;
  ppeUsed?: PPEUsage;
  workRelatedIllness?: boolean;
}

/**
 * Property damage details
 */
export interface PropertyDamageDetails {
  assetType: string; // building, equipment, tool, vehicle, machinery, other
  assetDescription: string;
  assetIdOrSerial?: string;
  location?: string;
  extentOfDamage: string;
  estimatedCost?: number;
  urgentRepairRequired: boolean;
  conditionBeforeIncident: AssetCondition;
  ownerOfProperty?: string;
  insuranceClaim?: boolean;
  insuranceReferenceNumber?: string;
}

/**
 * Other vehicle involved in incident
 */
export interface OtherVehicle {
  driverName?: string;
  vehicleRegistration?: string;
  makeModel?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  contactDetails?: string;
  address?: string;
}

/**
 * Vehicle incident details
 */
export interface VehicleDetails {
  companyVehicle: boolean;
  registration: string;
  makeModel?: string;
  yearOfManufacture?: number;
  driverName: string;
  driverLicenceNumber?: string;
  driverAddress?: string;
  otherVehicles?: OtherVehicle[];
  policeNotified: boolean;
  policeReferenceNumber?: string;
  policeOfficerName?: string;
  policeStation?: string;
  roadConditions?: string; // dry, wet, icy, snow, uneven, pothole
  weatherConditions?: string; // clear, rain, fog, snow, wind
  visibility?: string; // good, poor, limited
  approximateSpeedKmh?: number;
  speedLimitKmh?: number;
  directionOfTravel?: string;
  trafficConditions?: string;
  vehicleDamage?: string;
  injuriesInVehicle?: boolean;
}

/**
 * Public liability specific details
 */
export interface PublicLiabilityDetails {
  reasonForBeingOnSite: string;
  authorizedVisitor: boolean;
  signedIn: boolean;
  signInTime?: string;
  preExistingConditions?: string;
  refusedTreatment: boolean;
  legalRepresentative?: string;
  legalRepresentativeContact?: string;
  witnessStatements?: string[];
}

/**
 * Detailed incident description and narrative
 */
export interface IncidentDescription {
  whatHappened: string;
  sequenceOfEvents?: string;
  activityAtTime?: string;
  taskBeingPerformed?: string;
  immediateCause?: string;
  unsafeConditions?: string;
  unsafeActs?: string;
  environmentalFactors?: string;
  equipmentFactors?: string;
  breachesOfProcedure?: string;
  supervisionPresent: YesNoUnknown;
  supervisorName?: string;
  areaPreviouslyInspected: YesNoUnknown;
  lastInspectionDate?: string;
  inspectorName?: string;
}

/**
 * Contributing factors to incident
 */
export type ContributingFactor = 
  | 'human_error'
  | 'mechanical_failure'
  | 'poor_housekeeping'
  | 'inadequate_lighting'
  | 'slippery_surfaces'
  | 'inadequate_training'
  | 'fatigue'
  | 'lack_of_ppe'
  | 'time_pressure'
  | 'structural_defects'
  | 'weather_conditions'
  | 'inadequate_supervision'
  | 'communication_breakdown'
  | 'equipment_misuse'
  | 'lack_of_maintenance'
  | 'other';

/**
 * Root cause analysis details
 * Critical for insurance and legal compliance
 */
export interface RootCauseAnalysis {
  directCause?: string;
  indirectCause?: string;
  underlyingRootCause?: string;
  contributingFactors?: ContributingFactor[];
  contributingFactorsOther?: string;
  preventativeMeasures?: string;
  wereControlsAdequate: YesNoUnknown;
  controlsExplanation?: string;
  similarIncidentsPreviously?: boolean;
  similarIncidentsDetails?: string;
}

/**
 * Corrective action item
 */
export interface CorrectiveAction {
  id?: string;
  description: string;
  responsiblePerson?: string;
  responsiblePersonRole?: string;
  dueDate?: string;
  completionDate?: string;
  status: ActionStatus;
  costEstimate?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  verificationMethod?: string;
  completionNotes?: string;
}

/**
 * Attachment/media file
 */
export interface Attachment {
  id?: string;
  uri: string;
  type: 'photo' | 'video' | 'diagram' | 'document';
  caption?: string;
  uploadedAt?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Digital signature
 */
export interface Signature {
  name: string;
  role?: string;
  signedAt: string;
  signatureImageUri?: string; // base64 or file path
  ipAddress?: string;
}

/**
 * Signature collection
 */
export interface Signatures {
  reporter?: Signature;
  investigator?: Signature;
  witness?: Signature;
  manager?: Signature;
}

/**
 * RIDDOR assessment
 * Determines if incident is reportable under RIDDOR 2013
 */
export interface RIDDORAssessment {
  isReportable: boolean;
  reportableReason?: string;
  reportedToHSE: boolean;
  hseReferenceNumber?: string;
  reportedDate?: string;
  reportedBy?: string;
}

/**
 * Main Incident Report structure
 * Complete UK HSE and insurance-compliant investigation report
 */
export interface IncidentReport {
  // Metadata
  id: string;
  referenceCode: string;
  category: IncidentCategory;
  
  // Temporal data
  dateOfIncident: string; // ISO date
  timeOfIncident: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
  
  // Location
  location: IncidentLocation;
  
  // Reporting person
  reportedBy: ReportingPerson;
  
  // People involved
  peoplePresent?: PersonPresent[];
  witnesses?: Witness[];
  personInvolved?: PersonInvolved;
  
  // Category-specific details
  injuryDetails?: InjuryDetails;
  propertyDamageDetails?: PropertyDamageDetails;
  vehicleDetails?: VehicleDetails;
  publicLiabilityDetails?: PublicLiabilityDetails;
  
  // Investigation details
  incidentDescription: IncidentDescription;
  rootCauseAnalysis?: RootCauseAnalysis;
  correctiveActions?: CorrectiveAction[];
  
  // Media and evidence
  attachments?: Attachment[];
  signatures?: Signatures;
  
  // Legal and compliance
  riddorAssessment?: RIDDORAssessment;
  legalNotes?: string;
  internalComments?: string;
  
  // Metadata
  investigatedBy?: string;
  investigationDate?: string;
  reviewedBy?: string;
  reviewDate?: string;
  reportStatus?: 'draft' | 'submitted' | 'under_investigation' | 'closed';
}

/**
 * Personal information stored locally for auto-fill
 */
export interface PersonalInfo {
  fullName: string;
  jobTitle?: string;
  department?: string;
  employer?: string;
  industry?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * App settings
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  locationEnabled: boolean;
  autoFillPersonalInfo: boolean;
  defaultPdfExportType: 'summary' | 'full';
  language: string;
}

/**
 * PDF export options
 */
export interface PdfExportOptions {
  summaryOnly: boolean;
  includePhotos: boolean;
  includeSignatures: boolean;
  includeRootCause: boolean;
  includeCorrectiveActions: boolean;
  includeWitnessStatements: boolean;
  includeAttachments: boolean;
  watermark?: string;
  confidential?: boolean;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}
