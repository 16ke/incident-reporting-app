/**
 * PDF Builder - Core PDF Generation Module
 * 
 * UK HSE-compliant incident investigation PDF export
 * Generates both summary and full investigation reports
 * 
 * Uses PDFKit for Node.js backend PDF generation
 */

import PDFDocument from 'pdfkit';
import type {
  IncidentReport,
  PdfExportOptions,
} from '@ohoh-incident-reporter/shared';
import {
  formatDateUK,
  formatTimeUK,
  getCategoryLabel,
} from '@ohoh-incident-reporter/shared';
import { LEGAL_DISCLAIMER, GDPR_STATEMENT } from '@ohoh-incident-reporter/shared';

/**
 * PDF page dimensions and margins (A4)
 */
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

/**
 * Colors (UK HSE compliant branding)
 */
const COLORS = {
  primary: '#003366',      // Dark blue
  secondary: '#FFB81C',    // Amber/warning yellow
  text: '#333333',
  lightGray: '#CCCCCC',
  background: '#F5F5F5',
  danger: '#D32F2F',
};

/**
 * Font sizes
 */
const FONTS = {
  title: 24,
  heading1: 18,
  heading2: 14,
  heading3: 12,
  body: 10,
  small: 8,
};

/**
 * PDF Model - simplified structure for PDF generation
 */
export interface PdfIncidentModel {
  title: string;
  referenceCode: string;
  categoryLabel: string;
  exportDate: string;
  headerFields: Record<string, string>;
  sections: PdfSection[];
  rootCauseSection?: PdfSection;
  correctiveActionsSection?: PdfTableSection;
  attachmentsSection?: PdfAttachmentSection;
  signaturesSection?: PdfSignatureSection;
}

export interface PdfSection {
  title: string;
  rows: Array<{ label: string; value: string }>;
}

export interface PdfTableSection {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface PdfAttachmentSection {
  title: string;
  attachments: Array<{ uri: string; caption?: string }>;
}

export interface PdfSignatureSection {
  title: string;
  signatures: Array<{
    name: string;
    role?: string;
    signedAt: string;
    imageUri?: string;
  }>;
}

/**
 * Map IncidentReport to PdfIncidentModel
 */
export function mapIncidentToPdfModel(
  incident: IncidentReport,
  options: PdfExportOptions
): PdfIncidentModel {
  const sections: PdfSection[] = [];

  // Basic incident information
  sections.push({
    title: 'Incident Information',
    rows: [
      { label: 'Incident Reference', value: incident.referenceCode },
      { label: 'Category', value: getCategoryLabel(incident.category) },
      { label: 'Date of Incident', value: formatDateUK(incident.dateOfIncident) },
      { label: 'Time of Incident', value: formatTimeUK(incident.timeOfIncident) },
      { label: 'Location', value: formatLocation(incident) },
      { label: 'Site Name', value: incident.location.siteName || 'N/A' },
      { label: 'Department', value: incident.location.department || 'N/A' },
      { label: 'Area', value: incident.location.area || 'N/A' },
    ],
  });

  // Reported by
  sections.push({
    title: 'Reported By',
    rows: [
      { label: 'Name', value: incident.reportedBy.name },
      { label: 'Job Title', value: incident.reportedBy.jobTitle || 'N/A' },
      { label: 'Contact Number', value: incident.reportedBy.contactNumber || 'N/A' },
      { label: 'Email', value: incident.reportedBy.email || 'N/A' },
      { label: 'Employer', value: incident.reportedBy.employer || 'N/A' },
    ],
  });

  // Person involved (if applicable)
  if (incident.personInvolved) {
    sections.push({
      title: 'Person Involved',
      rows: [
        { label: 'Full Name', value: incident.personInvolved.fullName },
        { label: 'Age', value: incident.personInvolved.age?.toString() || 'N/A' },
        { label: 'Role/Relationship', value: incident.personInvolved.roleOrRelationship || 'N/A' },
        { label: 'Employer', value: incident.personInvolved.employer || 'N/A' },
        { label: 'Contact Details', value: incident.personInvolved.contactDetails || 'N/A' },
        { 
          label: 'Relevant Training', 
          value: incident.personInvolved.relevantTraining?.hasTraining ? 'Yes' : 'No' 
        },
      ],
    });
  }

  // Category-specific sections
  if (incident.category === 'personal_injury' && incident.injuryDetails) {
    sections.push(buildInjuryDetailsSection(incident));
  }

  if (incident.category === 'property_damage' && incident.propertyDamageDetails) {
    sections.push(buildPropertyDamageSection(incident));
  }

  if (incident.category === 'vehicle_incident' && incident.vehicleDetails) {
    sections.push(buildVehicleDetailsSection(incident));
  }

  if (incident.category === 'public_liability' && incident.publicLiabilityDetails) {
    sections.push(buildPublicLiabilitySection(incident));
  }

  // Incident description
  sections.push(buildIncidentDescriptionSection(incident));

  // Witnesses (if any)
  if (incident.witnesses && incident.witnesses.length > 0) {
    sections.push(buildWitnessesSection(incident));
  }

  // Build model
  const model: PdfIncidentModel = {
    title: options.summaryOnly ? 'Incident Summary Report' : 'Full Incident Investigation Report',
    referenceCode: incident.referenceCode,
    categoryLabel: getCategoryLabel(incident.category),
    exportDate: formatDateUK(new Date()),
    headerFields: {
      reference: incident.referenceCode,
      date: formatDateUK(incident.dateOfIncident),
      category: getCategoryLabel(incident.category),
    },
    sections,
  };

  // Root cause analysis (full report only)
  if (!options.summaryOnly && options.includeRootCause && incident.rootCauseAnalysis) {
    model.rootCauseSection = buildRootCauseSection(incident);
  }

  // Corrective actions (full report only)
  if (!options.summaryOnly && options.includeCorrectiveActions && incident.correctiveActions) {
    model.correctiveActionsSection = buildCorrectiveActionsTable(incident);
  }

  // Attachments
  if (options.includeAttachments && incident.attachments && incident.attachments.length > 0) {
    model.attachmentsSection = {
      title: 'Attachments',
      attachments: incident.attachments.map(a => ({ uri: a.uri, caption: a.caption })),
    };
  }

  // Signatures
  if (options.includeSignatures && incident.signatures) {
    model.signaturesSection = buildSignaturesSection(incident);
  }

  return model;
}

/**
 * Build injury details section
 */
function buildInjuryDetailsSection(incident: IncidentReport): PdfSection {
  const injury = incident.injuryDetails!;
  return {
    title: 'Injury Details',
    rows: [
      { label: 'Nature of Injury', value: injury.natureOfInjury },
      { label: 'Body Parts Affected', value: injury.bodyPartsAffected.join(', ') },
      { label: 'Severity', value: injury.severity.toUpperCase() },
      { label: 'First Aid Given', value: injury.firstAidGiven?.given ? 'Yes' : 'No' },
      { 
        label: 'First Aid Details', 
        value: injury.firstAidGiven?.treatment || 'N/A' 
      },
      { label: 'Hospital Visit', value: injury.hospitalVisit?.wentToHospital ? 'Yes' : 'No' },
      { 
        label: 'Hospital Name', 
        value: injury.hospitalVisit?.hospitalName || 'N/A' 
      },
      { 
        label: 'Expected Lost Time (days)', 
        value: injury.expectedLostTimeDays?.toString() || 'N/A' 
      },
      { label: 'PPE Used', value: injury.ppeUsed?.used ? 'Yes' : 'No' },
      { 
        label: 'PPE Types', 
        value: injury.ppeUsed?.types?.join(', ') || 'N/A' 
      },
      { 
        label: 'PPE Functioning Properly', 
        value: injury.ppeUsed?.functioningProperly ? 'Yes' : 'No' 
      },
    ],
  };
}

/**
 * Build property damage section
 */
function buildPropertyDamageSection(incident: IncidentReport): PdfSection {
  const damage = incident.propertyDamageDetails!;
  return {
    title: 'Property Damage Details',
    rows: [
      { label: 'Asset Type', value: damage.assetType },
      { label: 'Description', value: damage.assetDescription },
      { label: 'Asset ID/Serial', value: damage.assetIdOrSerial || 'N/A' },
      { label: 'Extent of Damage', value: damage.extentOfDamage },
      { 
        label: 'Estimated Cost', 
        value: damage.estimatedCost ? `£${damage.estimatedCost.toFixed(2)}` : 'N/A' 
      },
      { label: 'Urgent Repair Required', value: damage.urgentRepairRequired ? 'Yes' : 'No' },
      { label: 'Condition Before Incident', value: damage.conditionBeforeIncident },
    ],
  };
}

/**
 * Build vehicle details section
 */
function buildVehicleDetailsSection(incident: IncidentReport): PdfSection {
  const vehicle = incident.vehicleDetails!;
  return {
    title: 'Vehicle Incident Details',
    rows: [
      { label: 'Vehicle Registration', value: vehicle.registration },
      { label: 'Make/Model', value: vehicle.makeModel || 'N/A' },
      { label: 'Company Vehicle', value: vehicle.companyVehicle ? 'Yes' : 'No' },
      { label: 'Driver Name', value: vehicle.driverName },
      { label: 'Driver Licence Number', value: vehicle.driverLicenceNumber || 'N/A' },
      { label: 'Police Notified', value: vehicle.policeNotified ? 'Yes' : 'No' },
      { label: 'Police Reference', value: vehicle.policeReferenceNumber || 'N/A' },
      { label: 'Road Conditions', value: vehicle.roadConditions || 'N/A' },
      { label: 'Weather Conditions', value: vehicle.weatherConditions || 'N/A' },
      { label: 'Approximate Speed', value: vehicle.approximateSpeedKmh ? `${vehicle.approximateSpeedKmh} km/h` : 'N/A' },
    ],
  };
}

/**
 * Build public liability section
 */
function buildPublicLiabilitySection(incident: IncidentReport): PdfSection {
  const liability = incident.publicLiabilityDetails!;
  return {
    title: 'Public Liability Details',
    rows: [
      { label: 'Reason for Being On Site', value: liability.reasonForBeingOnSite },
      { label: 'Authorized Visitor', value: liability.authorizedVisitor ? 'Yes' : 'No' },
      { label: 'Signed In', value: liability.signedIn ? 'Yes' : 'No' },
      { label: 'Pre-existing Conditions', value: liability.preExistingConditions || 'None reported' },
      { label: 'Refused Treatment', value: liability.refusedTreatment ? 'Yes' : 'No' },
    ],
  };
}

/**
 * Build incident description section
 */
function buildIncidentDescriptionSection(incident: IncidentReport): PdfSection {
  const desc = incident.incidentDescription;
  return {
    title: 'Incident Description',
    rows: [
      { label: 'What Happened', value: desc.whatHappened },
      { label: 'Sequence of Events', value: desc.sequenceOfEvents || 'N/A' },
      { label: 'Activity at Time', value: desc.activityAtTime || 'N/A' },
      { label: 'Immediate Cause', value: desc.immediateCause || 'N/A' },
      { label: 'Unsafe Conditions', value: desc.unsafeConditions || 'N/A' },
      { label: 'Unsafe Acts', value: desc.unsafeActs || 'N/A' },
      { label: 'Environmental Factors', value: desc.environmentalFactors || 'N/A' },
      { label: 'Equipment Factors', value: desc.equipmentFactors || 'N/A' },
      { label: 'Supervision Present', value: desc.supervisionPresent },
      { label: 'Area Previously Inspected', value: desc.areaPreviouslyInspected },
    ],
  };
}

/**
 * Build root cause section
 */
function buildRootCauseSection(incident: IncidentReport): PdfSection {
  const rca = incident.rootCauseAnalysis!;
  return {
    title: 'Root Cause Analysis',
    rows: [
      { label: 'Direct Cause', value: rca.directCause || 'N/A' },
      { label: 'Indirect Cause', value: rca.indirectCause || 'N/A' },
      { label: 'Underlying Root Cause', value: rca.underlyingRootCause || 'N/A' },
      { 
        label: 'Contributing Factors', 
        value: rca.contributingFactors?.join(', ') || 'N/A' 
      },
      { label: 'Preventative Measures', value: rca.preventativeMeasures || 'N/A' },
      { label: 'Were Controls Adequate', value: rca.wereControlsAdequate },
      { label: 'Controls Explanation', value: rca.controlsExplanation || 'N/A' },
    ],
  };
}

/**
 * Build witnesses section
 */
function buildWitnessesSection(incident: IncidentReport): PdfSection {
  const witnessRows: Array<{ label: string; value: string }> = [];
  
  incident.witnesses!.forEach((witness, index) => {
    witnessRows.push(
      { label: `Witness ${index + 1} Name`, value: witness.name },
      { label: `Witness ${index + 1} Contact`, value: witness.contactDetails || 'N/A' },
      { label: `Witness ${index + 1} Statement`, value: witness.statement || 'No statement provided' }
    );
  });

  return {
    title: 'Witness Information',
    rows: witnessRows,
  };
}

/**
 * Build corrective actions table
 */
function buildCorrectiveActionsTable(incident: IncidentReport): PdfTableSection {
  const headers = ['Action', 'Responsible Person', 'Due Date', 'Status'];
  const rows = incident.correctiveActions!.map(action => [
    action.description,
    action.responsiblePerson || 'Unassigned',
    action.dueDate ? formatDateUK(action.dueDate) : 'N/A',
    action.status.toUpperCase(),
  ]);

  return {
    title: 'Corrective Actions',
    headers,
    rows,
  };
}

/**
 * Build signatures section
 */
function buildSignaturesSection(incident: IncidentReport): PdfSignatureSection {
  const sigs = incident.signatures!;
  const signatures: Array<{ name: string; role?: string; signedAt: string; imageUri?: string }> = [];

  if (sigs.reporter) {
    signatures.push({
      name: sigs.reporter.name,
      role: sigs.reporter.role || 'Reporter',
      signedAt: formatDateUK(sigs.reporter.signedAt),
      imageUri: sigs.reporter.signatureImageUri,
    });
  }

  if (sigs.investigator) {
    signatures.push({
      name: sigs.investigator.name,
      role: sigs.investigator.role || 'Investigator',
      signedAt: formatDateUK(sigs.investigator.signedAt),
      imageUri: sigs.investigator.signatureImageUri,
    });
  }

  if (sigs.witness) {
    signatures.push({
      name: sigs.witness.name,
      role: 'Witness',
      signedAt: formatDateUK(sigs.witness.signedAt),
      imageUri: sigs.witness.signatureImageUri,
    });
  }

  return {
    title: 'Signatures',
    signatures,
  };
}

/**
 * Format location for display
 */
function formatLocation(incident: IncidentReport): string {
  if (incident.location.manualAddress) {
    return incident.location.manualAddress;
  }
  if (incident.location.gpsCoordinates) {
    return `GPS: ${incident.location.gpsCoordinates.latitude.toFixed(6)}, ${incident.location.gpsCoordinates.longitude.toFixed(6)}`;
  }
  return 'Not specified';
}

/**
 * Generate PDF document
 */
export async function buildPdfDocument(
  model: PdfIncidentModel,
  options: PdfExportOptions
): Promise<InstanceType<typeof PDFDocument>> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: MARGIN_TOP,
      bottom: MARGIN_BOTTOM,
      left: MARGIN_LEFT,
      right: MARGIN_RIGHT,
    },
    info: {
      Title: `${model.title} - ${model.referenceCode}`,
      Author: 'OhOh! Safety Business Suite',
      Subject: 'Incident Investigation Report',
      Keywords: 'incident, investigation, health and safety, UK HSE',
    },
  });

  // Add header
  addHeader(doc, model);

  // Add sections
  let yPos = MARGIN_TOP + 100;
  
  for (const section of model.sections) {
    yPos = addSection(doc, section, yPos);
  }

  // Add root cause section
  if (model.rootCauseSection) {
    yPos = addSection(doc, model.rootCauseSection, yPos);
  }

  // Add corrective actions table
  if (model.correctiveActionsSection) {
    yPos = addTable(doc, model.correctiveActionsSection, yPos);
  }

  // Add signatures
  if (model.signaturesSection) {
    yPos = addSignatures(doc, model.signaturesSection, yPos);
  }

  // Add legal footer
  addLegalFooter(doc);

  // Add page numbers
  addPageNumbers(doc);

  return doc;
}

/**
 * Add header to PDF
 */
function addHeader(doc: InstanceType<typeof PDFDocument>, model: PdfIncidentModel): void {
  doc.fontSize(FONTS.title)
    .fillColor(COLORS.primary)
    .text('OhOh! Incident Reporter', MARGIN_LEFT, MARGIN_TOP, { align: 'left' });

  doc.fontSize(FONTS.heading2)
    .fillColor(COLORS.text)
    .text(model.title, MARGIN_LEFT, MARGIN_TOP + 30);

  doc.fontSize(FONTS.body)
    .text(`Reference: ${model.referenceCode}`, MARGIN_LEFT, MARGIN_TOP + 50)
    .text(`Exported: ${model.exportDate}`, MARGIN_LEFT, MARGIN_TOP + 65);

  doc.moveTo(MARGIN_LEFT, MARGIN_TOP + 85)
    .lineTo(PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP + 85)
    .stroke(COLORS.lightGray);
}

/**
 * Add section to PDF
 */
function addSection(doc: InstanceType<typeof PDFDocument>, section: PdfSection, yPos: number): number {
  // Check if we need a new page
  if (yPos > PAGE_HEIGHT - MARGIN_BOTTOM - 100) {
    doc.addPage();
    yPos = MARGIN_TOP;
  }

  // Section title
  doc.fontSize(FONTS.heading2)
    .fillColor(COLORS.primary)
    .text(section.title, MARGIN_LEFT, yPos);
  
  yPos += 25;

  // Section rows
  for (const row of section.rows) {
    // Check if we need a new page
    if (yPos > PAGE_HEIGHT - MARGIN_BOTTOM - 50) {
      doc.addPage();
      yPos = MARGIN_TOP;
    }

    doc.fontSize(FONTS.body)
      .fillColor(COLORS.text)
      .font('Helvetica-Bold')
      .text(row.label + ':', MARGIN_LEFT, yPos, { continued: false });

    doc.font('Helvetica')
      .text(row.value, MARGIN_LEFT + 150, yPos, { 
        width: CONTENT_WIDTH - 150,
        align: 'left',
      });

    yPos += 20;
  }

  yPos += 15;
  return yPos;
}

/**
 * Add table to PDF
 */
function addTable(doc: InstanceType<typeof PDFDocument>, table: PdfTableSection, yPos: number): number {
  // Check if we need a new page
  if (yPos > PAGE_HEIGHT - MARGIN_BOTTOM - 150) {
    doc.addPage();
    yPos = MARGIN_TOP;
  }

  // Table title
  doc.fontSize(FONTS.heading2)
    .fillColor(COLORS.primary)
    .text(table.title, MARGIN_LEFT, yPos);
  
  yPos += 25;

  // Table headers
  const colWidth = CONTENT_WIDTH / table.headers.length;
  let xPos = MARGIN_LEFT;

  doc.fontSize(FONTS.body)
    .fillColor(COLORS.primary)
    .font('Helvetica-Bold');

  table.headers.forEach(header => {
    doc.text(header, xPos, yPos, { width: colWidth, align: 'left' });
    xPos += colWidth;
  });

  yPos += 20;

  // Table rows
  doc.font('Helvetica')
    .fillColor(COLORS.text);

  for (const row of table.rows) {
    // Check if we need a new page
    if (yPos > PAGE_HEIGHT - MARGIN_BOTTOM - 30) {
      doc.addPage();
      yPos = MARGIN_TOP;
    }

    xPos = MARGIN_LEFT;
    row.forEach(cell => {
      doc.text(cell, xPos, yPos, { width: colWidth - 5, align: 'left' });
      xPos += colWidth;
    });

    yPos += 25;
  }

  yPos += 15;
  return yPos;
}

/**
 * Add signatures to PDF
 */
function addSignatures(doc: InstanceType<typeof PDFDocument>, signatures: PdfSignatureSection, yPos: number): number {
  // Check if we need a new page
  if (yPos > PAGE_HEIGHT - MARGIN_BOTTOM - 200) {
    doc.addPage();
    yPos = MARGIN_TOP;
  }

  // Section title
  doc.fontSize(FONTS.heading2)
    .fillColor(COLORS.primary)
    .text(signatures.title, MARGIN_LEFT, yPos);
  
  yPos += 25;

  for (const sig of signatures.signatures) {
    doc.fontSize(FONTS.body)
      .fillColor(COLORS.text)
      .font('Helvetica-Bold')
      .text(sig.name, MARGIN_LEFT, yPos)
      .font('Helvetica')
      .text(`${sig.role} - Signed: ${sig.signedAt}`, MARGIN_LEFT, yPos + 15);

    // TODO: Add signature image if available
    // if (sig.imageUri) {
    //   doc.image(sig.imageUri, MARGIN_LEFT, yPos + 35, { width: 150, height: 50 });
    // }

    yPos += 80;
  }

  return yPos;
}

/**
 * Add legal footer to all pages
 */
function addLegalFooter(doc: InstanceType<typeof PDFDocument>): void {
  const pages = doc.bufferedPageRange();
  
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(FONTS.small)
      .fillColor(COLORS.text)
      .text(
        'CONFIDENTIAL - Internal Incident Investigation Report',
        MARGIN_LEFT,
        PAGE_HEIGHT - MARGIN_BOTTOM + 20,
        { align: 'center', width: CONTENT_WIDTH }
      );
  }
}

/**
 * Add page numbers to all pages
 */
function addPageNumbers(doc: InstanceType<typeof PDFDocument>): void {
  const pages = doc.bufferedPageRange();
  
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(FONTS.small)
      .fillColor(COLORS.text)
      .text(
        `Page ${i + 1} of ${pages.count}`,
        MARGIN_LEFT,
        PAGE_HEIGHT - MARGIN_BOTTOM + 35,
        { align: 'center', width: CONTENT_WIDTH }
      );
  }
}
