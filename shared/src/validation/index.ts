/**
 * Incident Report Validation Module
 * 
 * Comprehensive validation for UK HSE-compliant incident reporting
 * Category-specific validation rules
 * PDF export pre-validation
 */

import type {
  IncidentReport,
  ValidationResult,
  ValidationError,
  PdfExportOptions,
} from '../types/incident';
import { isEmpty } from '../utils';

/**
 * Validate basic incident information (required for ALL categories)
 */
function validateBasicInfo(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.category) {
    errors.push({
      field: 'category',
      message: 'Incident category is required',
      section: 'Basic Information',
    });
  }

  if (!incident.dateOfIncident) {
    errors.push({
      field: 'dateOfIncident',
      message: 'Date of incident is required',
      section: 'Basic Information',
    });
  } else {
    // Validate date is not in the future
    const incidentDate = new Date(incident.dateOfIncident);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (incidentDate > today) {
      errors.push({
        field: 'dateOfIncident',
        message: 'Incident date cannot be in the future',
        section: 'Basic Information',
      });
    }
  }

  if (!incident.timeOfIncident) {
    errors.push({
      field: 'timeOfIncident',
      message: 'Time of incident is required',
      section: 'Basic Information',
    });
  } else {
    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(incident.timeOfIncident)) {
      errors.push({
        field: 'timeOfIncident',
        message: 'Time must be in HH:mm format (24-hour)',
        section: 'Basic Information',
      });
    }
  }

  // Location - at least one method required
  if (!incident.location.gpsCoordinates && !incident.location.manualAddress) {
    errors.push({
      field: 'location',
      message: 'Location is required (GPS or manual address)',
      section: 'Basic Information',
    });
  }

  if (!incident.incidentDescription?.whatHappened || incident.incidentDescription.whatHappened.trim() === '') {
    errors.push({
      field: 'incidentDescription.whatHappened',
      message: 'Incident description is required',
      section: 'Incident Description',
    });
  } else if (incident.incidentDescription.whatHappened.length < 20) {
    errors.push({
      field: 'incidentDescription.whatHappened',
      message: 'Incident description must be at least 20 characters',
      section: 'Incident Description',
    });
  }

  if (!incident.reportedBy?.name || incident.reportedBy.name.trim() === '') {
    errors.push({
      field: 'reportedBy.name',
      message: 'Reporter name is required',
      section: 'Basic Information',
    });
  }

  return errors;
}

/**
 * Validate personal injury specific fields
 */
function validatePersonalInjury(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.personInvolved?.fullName || incident.personInvolved.fullName.trim() === '') {
    errors.push({
      field: 'personInvolved.fullName',
      message: 'Injured person\'s name is required',
      section: 'Person Involved',
    });
  }

  if (!incident.injuryDetails?.natureOfInjury || incident.injuryDetails.natureOfInjury.trim() === '') {
    errors.push({
      field: 'injuryDetails.natureOfInjury',
      message: 'Nature of injury is required',
      section: 'Injury Details',
    });
  }

  if (!incident.injuryDetails?.severity) {
    errors.push({
      field: 'injuryDetails.severity',
      message: 'Injury severity is required',
      section: 'Injury Details',
    });
  }

  if (!incident.injuryDetails?.bodyPartsAffected || incident.injuryDetails.bodyPartsAffected.length === 0) {
    errors.push({
      field: 'injuryDetails.bodyPartsAffected',
      message: 'At least one affected body part must be selected',
      section: 'Injury Details',
    });
  }

  // PPE usage validation
  if (incident.injuryDetails?.ppeUsed === undefined) {
    errors.push({
      field: 'injuryDetails.ppeUsed',
      message: 'PPE usage information is required',
      section: 'Injury Details',
    });
  }

  return errors;
}

/**
 * Validate public liability specific fields
 */
function validatePublicLiability(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.personInvolved?.fullName || incident.personInvolved.fullName.trim() === '') {
    errors.push({
      field: 'personInvolved.fullName',
      message: 'Name of public member is required',
      section: 'Person Involved',
    });
  }

  if (!incident.publicLiabilityDetails?.reasonForBeingOnSite || 
      incident.publicLiabilityDetails.reasonForBeingOnSite.trim() === '') {
    errors.push({
      field: 'publicLiabilityDetails.reasonForBeingOnSite',
      message: 'Reason for being on site is required',
      section: 'Public Liability Details',
    });
  }

  // If injury occurred, validate injury details
  if (incident.injuryDetails?.natureOfInjury) {
    if (!incident.injuryDetails.severity) {
      errors.push({
        field: 'injuryDetails.severity',
        message: 'Injury severity is required when injury is reported',
        section: 'Injury Details',
      });
    }
  }

  return errors;
}

/**
 * Validate property damage specific fields
 */
function validatePropertyDamage(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.propertyDamageDetails?.assetDescription || 
      incident.propertyDamageDetails.assetDescription.trim() === '') {
    errors.push({
      field: 'propertyDamageDetails.assetDescription',
      message: 'Description of damaged property is required',
      section: 'Property Damage Details',
    });
  }

  if (!incident.propertyDamageDetails?.extentOfDamage || 
      incident.propertyDamageDetails.extentOfDamage.trim() === '') {
    errors.push({
      field: 'propertyDamageDetails.extentOfDamage',
      message: 'Extent of damage is required',
      section: 'Property Damage Details',
    });
  }

  if (!incident.propertyDamageDetails?.assetType || 
      incident.propertyDamageDetails.assetType.trim() === '') {
    errors.push({
      field: 'propertyDamageDetails.assetType',
      message: 'Asset type is required',
      section: 'Property Damage Details',
    });
  }

  if (incident.propertyDamageDetails?.urgentRepairRequired === undefined) {
    errors.push({
      field: 'propertyDamageDetails.urgentRepairRequired',
      message: 'Please indicate if urgent repair is required',
      section: 'Property Damage Details',
    });
  }

  return errors;
}

/**
 * Validate vehicle incident specific fields
 */
function validateVehicleIncident(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.vehicleDetails?.registration || incident.vehicleDetails.registration.trim() === '') {
    errors.push({
      field: 'vehicleDetails.registration',
      message: 'Vehicle registration is required',
      section: 'Vehicle Details',
    });
  } else {
    // UK registration format validation (basic)
    const ukRegRegex = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$/i;
    if (!ukRegRegex.test(incident.vehicleDetails.registration.replace(/\s/g, ''))) {
      errors.push({
        field: 'vehicleDetails.registration',
        message: 'Please enter a valid UK vehicle registration',
        section: 'Vehicle Details',
      });
    }
  }

  if (!incident.vehicleDetails?.driverName || incident.vehicleDetails.driverName.trim() === '') {
    errors.push({
      field: 'vehicleDetails.driverName',
      message: 'Driver name is required',
      section: 'Vehicle Details',
    });
  }

  if (incident.vehicleDetails?.companyVehicle === undefined) {
    errors.push({
      field: 'vehicleDetails.companyVehicle',
      message: 'Please indicate if this is a company vehicle',
      section: 'Vehicle Details',
    });
  }

  if (incident.vehicleDetails?.policeNotified === undefined) {
    errors.push({
      field: 'vehicleDetails.policeNotified',
      message: 'Please indicate if police were notified',
      section: 'Vehicle Details',
    });
  }

  // If police notified, reference number is recommended
  if (incident.vehicleDetails?.policeNotified && 
      (!incident.vehicleDetails.policeReferenceNumber || 
       incident.vehicleDetails.policeReferenceNumber.trim() === '')) {
    errors.push({
      field: 'vehicleDetails.policeReferenceNumber',
      message: 'Police reference number is strongly recommended when police are notified',
      section: 'Vehicle Details',
    });
  }

  return errors;
}

/**
 * Validate fields required for full investigation PDF
 */
function validateInvestigationFields(incident: IncidentReport): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!incident.rootCauseAnalysis?.directCause || incident.rootCauseAnalysis.directCause.trim() === '') {
    errors.push({
      field: 'rootCauseAnalysis.directCause',
      message: 'Direct cause is required for investigation report',
      section: 'Root Cause Analysis',
    });
  }

  if (!incident.rootCauseAnalysis?.underlyingRootCause || 
      incident.rootCauseAnalysis.underlyingRootCause.trim() === '') {
    errors.push({
      field: 'rootCauseAnalysis.underlyingRootCause',
      message: 'Underlying root cause is required for investigation report',
      section: 'Root Cause Analysis',
    });
  }

  if (!incident.rootCauseAnalysis?.wereControlsAdequate) {
    errors.push({
      field: 'rootCauseAnalysis.wereControlsAdequate',
      message: 'Assessment of existing controls is required',
      section: 'Root Cause Analysis',
    });
  }

  if (!incident.correctiveActions || incident.correctiveActions.length === 0) {
    errors.push({
      field: 'correctiveActions',
      message: 'At least one corrective action is required for investigation report',
      section: 'Corrective Actions',
    });
  } else {
    // Validate each corrective action
    incident.correctiveActions.forEach((action, index) => {
      if (!action.description || action.description.trim() === '') {
        errors.push({
          field: `correctiveActions[${index}].description`,
          message: `Corrective action ${index + 1}: Description is required`,
          section: 'Corrective Actions',
        });
      }

      if (!action.responsiblePerson || action.responsiblePerson.trim() === '') {
        errors.push({
          field: `correctiveActions[${index}].responsiblePerson`,
          message: `Corrective action ${index + 1}: Responsible person is required`,
          section: 'Corrective Actions',
        });
      }
    });
  }

  return errors;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UK phone number format
 */
function isValidUKPhone(phone: string): boolean {
  const ukPhoneRegex = /^(\+44|0)[0-9\s]{10,13}$/;
  return ukPhoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Additional validation checks (warnings, not errors)
 */
function generateWarnings(incident: IncidentReport): ValidationError[] {
  const warnings: ValidationError[] = [];

  // Email validation
  if (incident.reportedBy?.email && !isValidEmail(incident.reportedBy.email)) {
    warnings.push({
      field: 'reportedBy.email',
      message: 'Email format appears invalid',
      section: 'Basic Information',
    });
  }

  // Phone validation
  if (incident.reportedBy?.contactNumber && !isValidUKPhone(incident.reportedBy.contactNumber)) {
    warnings.push({
      field: 'reportedBy.contactNumber',
      message: 'Phone number format appears invalid',
      section: 'Basic Information',
    });
  }

  // Witness statements
  if (incident.witnesses && incident.witnesses.length > 0) {
    incident.witnesses.forEach((witness, index) => {
      if (!witness.statement || witness.statement.trim() === '') {
        warnings.push({
          field: `witnesses[${index}].statement`,
          message: `Witness ${index + 1}: Statement is recommended`,
          section: 'Witnesses',
        });
      }
    });
  }

  // Attachments
  if (!incident.attachments || incident.attachments.length === 0) {
    warnings.push({
      field: 'attachments',
      message: 'Consider adding photos or other evidence',
      section: 'Attachments',
    });
  }

  // RIDDOR assessment for serious injuries
  if (incident.category === 'personal_injury' && 
      incident.injuryDetails?.severity === 'severe' || 
      incident.injuryDetails?.severity === 'fatal') {
    if (!incident.riddorAssessment) {
      warnings.push({
        field: 'riddorAssessment',
        message: 'Serious injury may be RIDDOR reportable - ensure HSE notification is considered',
        section: 'Legal Compliance',
      });
    }
  }

  return warnings;
}

/**
 * Main validation function for incident reports
 */
export function validateIncident(incident: IncidentReport): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic validation (all categories)
  errors.push(...validateBasicInfo(incident));

  // Category-specific validation
  switch (incident.category) {
    case 'personal_injury':
      errors.push(...validatePersonalInjury(incident));
      break;
    case 'public_liability':
      errors.push(...validatePublicLiability(incident));
      break;
    case 'property_damage':
      errors.push(...validatePropertyDamage(incident));
      break;
    case 'vehicle_incident':
      errors.push(...validateVehicleIncident(incident));
      break;
  }

  const warnings = generateWarnings(incident);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate incident for PDF export
 * More stringent validation based on export options
 */
export function validateIncidentForPDF(
  incident: IncidentReport,
  options: PdfExportOptions
): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic validation
  const basicValidation = validateIncident(incident);
  errors.push(...basicValidation.errors);

  // If full investigation PDF requested, validate investigation fields
  if (!options.summaryOnly) {
    errors.push(...validateInvestigationFields(incident));
  }

  // If signatures required, validate signature presence
  if (options.includeSignatures) {
    if (!incident.signatures?.reporter) {
      errors.push({
        field: 'signatures.reporter',
        message: 'Reporter signature is required for PDF export',
        section: 'Signatures',
      });
    }

    if (!options.summaryOnly && !incident.signatures?.investigator) {
      errors.push({
        field: 'signatures.investigator',
        message: 'Investigator signature is required for full investigation PDF',
        section: 'Signatures',
      });
    }
  }

  // If photos required but none present
  if (options.includePhotos && (!incident.attachments || 
      incident.attachments.filter(a => a.type === 'photo').length === 0)) {
    errors.push({
      field: 'attachments',
      message: 'No photos available to include in PDF',
      section: 'Attachments',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: basicValidation.warnings,
  };
}

/**
 * Validate a specific field
 */
export function validateField(
  fieldName: string,
  value: unknown,
  incident: IncidentReport
): ValidationError | null {
  // Run full validation and find the specific field error
  const result = validateIncident(incident);
  const error = result.errors.find(e => e.field === fieldName);
  return error || null;
}

/**
 * Check if incident is complete enough for submission
 */
export function isIncidentComplete(incident: IncidentReport): boolean {
  const result = validateIncident(incident);
  return result.valid;
}

/**
 * Get required fields for a category
 */
export function getRequiredFields(category: string): string[] {
  const baseFields = [
    'category',
    'dateOfIncident',
    'timeOfIncident',
    'location',
    'reportedBy.name',
    'incidentDescription.whatHappened',
  ];

  switch (category) {
    case 'personal_injury':
      return [
        ...baseFields,
        'personInvolved.fullName',
        'injuryDetails.natureOfInjury',
        'injuryDetails.severity',
        'injuryDetails.bodyPartsAffected',
      ];
    case 'public_liability':
      return [
        ...baseFields,
        'personInvolved.fullName',
        'publicLiabilityDetails.reasonForBeingOnSite',
      ];
    case 'property_damage':
      return [
        ...baseFields,
        'propertyDamageDetails.assetDescription',
        'propertyDamageDetails.extentOfDamage',
        'propertyDamageDetails.assetType',
      ];
    case 'vehicle_incident':
      return [
        ...baseFields,
        'vehicleDetails.registration',
        'vehicleDetails.driverName',
      ];
    default:
      return baseFields;
  }
}
