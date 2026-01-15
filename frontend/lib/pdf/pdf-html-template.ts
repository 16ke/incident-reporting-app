/**
 * PDF HTML Template Generator
 * 
 * Generates print-ready HTML for PDF conversion
 * UK HSE-compliant styling
 */

import type {
  IncidentReport,
  PdfExportOptions,
} from '@/shared';
import {
  formatDateUK,
  formatTimeUK,
  getCategoryLabel,
} from '@/shared';
import { LEGAL_DISCLAIMER, GDPR_STATEMENT } from '@/shared';

/**
 * Generate complete HTML document for PDF export
 */
export function generatePdfHtml(
  incident: IncidentReport,
  options: PdfExportOptions
): string {
  const title = options.summaryOnly ? 'Incident Summary Report' : 'Full Incident Investigation Report';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${incident.referenceCode}</title>
  <style>
    ${getStyles()}
  </style>
</head>
<body>
  ${generateHeader(incident, title)}
  ${generateBasicInfo(incident)}
  ${generateReporterInfo(incident)}
  ${generatePersonInvolvedSection(incident)}
  ${generateCategorySpecificSections(incident, options)}
  ${generateIncidentDescription(incident)}
  ${generateWitnessesSection(incident)}
  ${generateRootCauseSection(incident, options)}
  ${generateCorrectiveActionsSection(incident, options)}
  ${generateSignaturesSection(incident, options)}
  ${generateLegalFooter()}
</body>
</html>
  `.trim();
}

/**
 * Generate CSS styles for PDF
 */
function getStyles(): string {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
    }

    .header {
      border-bottom: 3px solid #003366;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 24pt;
      font-weight: bold;
      color: #003366;
      margin-bottom: 10px;
    }

    .report-title {
      font-size: 18pt;
      color: #333;
      margin-bottom: 10px;
    }

    .header-info {
      font-size: 9pt;
      color: #666;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #003366;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #FFB81C;
    }

    .field {
      margin-bottom: 12px;
      padding-left: 10px;
    }

    .field-label {
      font-weight: bold;
      color: #555;
      display: inline-block;
      width: 180px;
      vertical-align: top;
    }

    .field-value {
      display: inline-block;
      width: calc(100% - 190px);
      color: #333;
    }

    .long-text {
      margin-left: 10px;
      padding: 10px;
      background-color: #f5f5f5;
      border-left: 3px solid #003366;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    thead {
      background-color: #003366;
      color: white;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
    }

    tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .signature-box {
      width: 45%;
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 20px;
    }

    .signature-name {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .signature-role {
      color: #666;
      font-size: 9pt;
      margin-bottom: 10px;
    }

    .signature-image {
      height: 60px;
      border-bottom: 1px solid #333;
      margin-bottom: 5px;
    }

    .signature-date {
      font-size: 8pt;
      color: #666;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ccc;
      font-size: 8pt;
      color: #666;
    }

    .confidential-banner {
      background-color: #D32F2F;
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .warning-box {
      background-color: #FFF3CD;
      border-left: 4px solid #FFB81C;
      padding: 15px;
      margin: 20px 0;
    }

    @media print {
      .page-break {
        page-break-before: always;
      }
    }
  `;
}

/**
 * Generate header section
 */
function generateHeader(incident: IncidentReport, title: string): string {
  return `
    <div class="confidential-banner">
      CONFIDENTIAL - Internal Incident Investigation Report
    </div>
    <div class="header">
      <div class="logo">OhOh! Incident Reporter</div>
      <div class="report-title">${title}</div>
      <div class="header-info">
        <strong>Reference:</strong> ${incident.referenceCode} |
        <strong>Category:</strong> ${getCategoryLabel(incident.category)} |
        <strong>Exported:</strong> ${formatDateUK(new Date())}
      </div>
    </div>
  `;
}

/**
 * Generate basic incident information section
 */
function generateBasicInfo(incident: IncidentReport): string {
  const location = incident.location.manualAddress || 
    (incident.location.gpsCoordinates ? 
      `GPS: ${incident.location.gpsCoordinates.latitude.toFixed(6)}, ${incident.location.gpsCoordinates.longitude.toFixed(6)}` : 
      'Not specified');

  return `
    <div class="section">
      <div class="section-title">Incident Information</div>
      ${renderField('Incident Reference', incident.referenceCode)}
      ${renderField('Category', getCategoryLabel(incident.category))}
      ${renderField('Date of Incident', formatDateUK(incident.dateOfIncident))}
      ${renderField('Time of Incident', formatTimeUK(incident.timeOfIncident))}
      ${renderField('Location', location)}
      ${renderField('Site Name', incident.location.siteName || 'N/A')}
      ${renderField('Department', incident.location.department || 'N/A')}
      ${renderField('Area', incident.location.area || 'N/A')}
    </div>
  `;
}

/**
 * Generate reporter information section
 */
function generateReporterInfo(incident: IncidentReport): string {
  return `
    <div class="section">
      <div class="section-title">Reported By</div>
      ${renderField('Name', incident.reportedBy.name)}
      ${renderField('Job Title', incident.reportedBy.jobTitle || 'N/A')}
      ${renderField('Contact Number', incident.reportedBy.contactNumber || 'N/A')}
      ${renderField('Email', incident.reportedBy.email || 'N/A')}
      ${renderField('Employer', incident.reportedBy.employer || 'N/A')}
    </div>
  `;
}

/**
 * Generate person involved section
 */
function generatePersonInvolvedSection(incident: IncidentReport): string {
  if (!incident.personInvolved) return '';

  const person = incident.personInvolved;
  
  return `
    <div class="section">
      <div class="section-title">Person Involved</div>
      ${renderField('Full Name', person.fullName)}
      ${renderField('Age', person.age?.toString() || 'N/A')}
      ${renderField('Role/Relationship', person.roleOrRelationship || 'N/A')}
      ${renderField('Employer', person.employer || 'N/A')}
      ${renderField('Contact Details', person.contactDetails || 'N/A')}
      ${renderField('Length of Employment (months)', person.lengthOfEmploymentMonths?.toString() || 'N/A')}
      ${renderField('Relevant Training', person.relevantTraining?.hasTraining ? 'Yes' : 'No')}
      ${person.relevantTraining?.details ? renderField('Training Details', person.relevantTraining.details) : ''}
    </div>
  `;
}

/**
 * Generate category-specific sections
 */
function generateCategorySpecificSections(incident: IncidentReport, options: PdfExportOptions): string {
  let html = '';

  if (incident.category === 'personal_injury' && incident.injuryDetails) {
    html += generateInjuryDetailsSection(incident);
  }

  if (incident.category === 'property_damage' && incident.propertyDamageDetails) {
    html += generatePropertyDamageSection(incident);
  }

  if (incident.category === 'vehicle_incident' && incident.vehicleDetails) {
    html += generateVehicleDetailsSection(incident);
  }

  if (incident.category === 'public_liability' && incident.publicLiabilityDetails) {
    html += generatePublicLiabilitySection(incident);
  }

  return html;
}

/**
 * Generate injury details section
 */
function generateInjuryDetailsSection(incident: IncidentReport): string {
  const injury = incident.injuryDetails!;
  
  return `
    <div class="section">
      <div class="section-title">Injury Details</div>
      ${renderField('Nature of Injury', injury.natureOfInjury)}
      ${renderField('Body Parts Affected', injury.bodyPartsAffected.join(', '))}
      ${renderField('Severity', injury.severity.toUpperCase())}
      ${renderField('First Aid Given', injury.firstAidGiven?.given ? 'Yes' : 'No')}
      ${injury.firstAidGiven?.treatment ? renderField('First Aid Details', injury.firstAidGiven.treatment) : ''}
      ${renderField('Hospital Visit', injury.hospitalVisit?.wentToHospital ? 'Yes' : 'No')}
      ${injury.hospitalVisit?.hospitalName ? renderField('Hospital Name', injury.hospitalVisit.hospitalName) : ''}
      ${renderField('Expected Lost Time (days)', injury.expectedLostTimeDays?.toString() || 'N/A')}
      ${renderField('PPE Used', injury.ppeUsed?.used ? 'Yes' : 'No')}
      ${injury.ppeUsed?.types ? renderField('PPE Types', injury.ppeUsed.types.join(', ')) : ''}
      ${injury.ppeUsed?.functioningProperly !== undefined ? renderField('PPE Functioning Properly', injury.ppeUsed.functioningProperly ? 'Yes' : 'No') : ''}
    </div>
  `;
}

/**
 * Generate property damage section
 */
function generatePropertyDamageSection(incident: IncidentReport): string {
  const damage = incident.propertyDamageDetails!;
  
  return `
    <div class="section">
      <div class="section-title">Property Damage Details</div>
      ${renderField('Asset Type', damage.assetType)}
      ${renderField('Description', damage.assetDescription)}
      ${renderField('Asset ID/Serial', damage.assetIdOrSerial || 'N/A')}
      ${renderField('Extent of Damage', damage.extentOfDamage)}
      ${renderField('Estimated Cost', damage.estimatedCost ? `£${damage.estimatedCost.toFixed(2)}` : 'N/A')}
      ${renderField('Urgent Repair Required', damage.urgentRepairRequired ? 'Yes' : 'No')}
      ${renderField('Condition Before Incident', damage.conditionBeforeIncident)}
    </div>
  `;
}

/**
 * Generate vehicle details section
 */
function generateVehicleDetailsSection(incident: IncidentReport): string {
  const vehicle = incident.vehicleDetails!;
  
  return `
    <div class="section">
      <div class="section-title">Vehicle Incident Details</div>
      ${renderField('Vehicle Registration', vehicle.registration)}
      ${renderField('Make/Model', vehicle.makeModel || 'N/A')}
      ${renderField('Company Vehicle', vehicle.companyVehicle ? 'Yes' : 'No')}
      ${renderField('Driver Name', vehicle.driverName)}
      ${renderField('Driver Licence Number', vehicle.driverLicenceNumber || 'N/A')}
      ${renderField('Police Notified', vehicle.policeNotified ? 'Yes' : 'No')}
      ${renderField('Police Reference', vehicle.policeReferenceNumber || 'N/A')}
      ${renderField('Road Conditions', vehicle.roadConditions || 'N/A')}
      ${renderField('Weather Conditions', vehicle.weatherConditions || 'N/A')}
      ${renderField('Approximate Speed', vehicle.approximateSpeedKmh ? `${vehicle.approximateSpeedKmh} km/h` : 'N/A')}
    </div>
  `;
}

/**
 * Generate public liability section
 */
function generatePublicLiabilitySection(incident: IncidentReport): string {
  const liability = incident.publicLiabilityDetails!;
  
  return `
    <div class="section">
      <div class="section-title">Public Liability Details</div>
      ${renderField('Reason for Being On Site', liability.reasonForBeingOnSite)}
      ${renderField('Authorized Visitor', liability.authorizedVisitor ? 'Yes' : 'No')}
      ${renderField('Signed In', liability.signedIn ? 'Yes' : 'No')}
      ${renderField('Pre-existing Conditions', liability.preExistingConditions || 'None reported')}
      ${renderField('Refused Treatment', liability.refusedTreatment ? 'Yes' : 'No')}
    </div>
  `;
}

/**
 * Generate incident description section
 */
function generateIncidentDescription(incident: IncidentReport): string {
  const desc = incident.incidentDescription;
  
  return `
    <div class="section">
      <div class="section-title">Incident Description</div>
      <div class="field">
        <div class="field-label">What Happened:</div>
        <div class="long-text">${escapeHtml(desc.whatHappened)}</div>
      </div>
      ${desc.sequenceOfEvents ? `
        <div class="field">
          <div class="field-label">Sequence of Events:</div>
          <div class="long-text">${escapeHtml(desc.sequenceOfEvents)}</div>
        </div>
      ` : ''}
      ${renderField('Activity at Time', desc.activityAtTime || 'N/A')}
      ${renderField('Immediate Cause', desc.immediateCause || 'N/A')}
      ${renderField('Unsafe Conditions', desc.unsafeConditions || 'N/A')}
      ${renderField('Unsafe Acts', desc.unsafeActs || 'N/A')}
      ${renderField('Environmental Factors', desc.environmentalFactors || 'N/A')}
      ${renderField('Equipment Factors', desc.equipmentFactors || 'N/A')}
      ${renderField('Supervision Present', desc.supervisionPresent)}
      ${renderField('Area Previously Inspected', desc.areaPreviouslyInspected)}
    </div>
  `;
}

/**
 * Generate witnesses section
 */
function generateWitnessesSection(incident: IncidentReport): string {
  if (!incident.witnesses || incident.witnesses.length === 0) return '';

  let witnessHtml = '';
  incident.witnesses.forEach((witness, index) => {
    witnessHtml += `
      <div style="margin-bottom: 20px;">
        ${renderField(`Witness ${index + 1} Name`, witness.name)}
        ${renderField(`Contact Details`, witness.contactDetails || 'N/A')}
        ${witness.statement ? `
          <div class="field">
            <div class="field-label">Statement:</div>
            <div class="long-text">${escapeHtml(witness.statement)}</div>
          </div>
        ` : ''}
      </div>
    `;
  });

  return `
    <div class="section">
      <div class="section-title">Witness Information</div>
      ${witnessHtml}
    </div>
  `;
}

/**
 * Generate root cause analysis section
 */
function generateRootCauseSection(incident: IncidentReport, options: PdfExportOptions): string {
  if (options.summaryOnly || !incident.rootCauseAnalysis) return '';

  const rca = incident.rootCauseAnalysis;
  
  return `
    <div class="section page-break">
      <div class="section-title">Root Cause Analysis</div>
      ${renderField('Direct Cause', rca.directCause || 'N/A')}
      ${renderField('Indirect Cause', rca.indirectCause || 'N/A')}
      ${renderField('Underlying Root Cause', rca.underlyingRootCause || 'N/A')}
      ${renderField('Contributing Factors', rca.contributingFactors?.join(', ') || 'N/A')}
      ${rca.preventativeMeasures ? `
        <div class="field">
          <div class="field-label">Preventative Measures:</div>
          <div class="long-text">${escapeHtml(rca.preventativeMeasures)}</div>
        </div>
      ` : ''}
      ${renderField('Were Controls Adequate', rca.wereControlsAdequate)}
      ${rca.controlsExplanation ? renderField('Controls Explanation', rca.controlsExplanation) : ''}
    </div>
  `;
}

/**
 * Generate corrective actions section
 */
function generateCorrectiveActionsSection(incident: IncidentReport, options: PdfExportOptions): string {
  if (options.summaryOnly || !incident.correctiveActions || incident.correctiveActions.length === 0) return '';

  const rows = incident.correctiveActions.map(action => `
    <tr>
      <td>${escapeHtml(action.description)}</td>
      <td>${escapeHtml(action.responsiblePerson || 'Unassigned')}</td>
      <td>${action.dueDate ? formatDateUK(action.dueDate) : 'N/A'}</td>
      <td>${action.status.toUpperCase()}</td>
    </tr>
  `).join('');

  return `
    <div class="section">
      <div class="section-title">Corrective Actions</div>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Responsible Person</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate signatures section
 */
function generateSignaturesSection(incident: IncidentReport, options: PdfExportOptions): string {
  if (!options.includeSignatures || !incident.signatures) return '';

  const signatures = [];

  if (incident.signatures.reporter) {
    signatures.push(incident.signatures.reporter);
  }
  if (incident.signatures.investigator) {
    signatures.push(incident.signatures.investigator);
  }
  if (incident.signatures.witness) {
    signatures.push(incident.signatures.witness);
  }

  if (signatures.length === 0) return '';

  const signatureBoxes = signatures.map(sig => `
    <div class="signature-box">
      <div class="signature-name">${escapeHtml(sig.name)}</div>
      <div class="signature-role">${escapeHtml(sig.role || 'N/A')}</div>
      <div class="signature-image"></div>
      <div class="signature-date">Signed: ${formatDateUK(sig.signedAt)}</div>
    </div>
  `).join('');

  return `
    <div class="section page-break">
      <div class="section-title">Signatures</div>
      <div class="signatures">
        ${signatureBoxes}
      </div>
    </div>
  `;
}

/**
 * Generate legal footer
 */
function generateLegalFooter(): string {
  return `
    <div class="footer">
      <div class="warning-box">
        <strong>Important Legal Notice:</strong><br>
        This incident report is an internal document prepared for workplace health and safety management purposes.
        It does not constitute a statutory notification to the Health and Safety Executive (HSE) under RIDDOR 2013.
        <br><br>
        Reportable incidents must be notified to the HSE separately through the official RIDDOR reporting system.
      </div>
      <p><strong>Data Protection:</strong> Personal data in this report is processed in accordance with UK GDPR and Data Protection Act 2018.</p>
      <p style="text-align: center; margin-top: 20px; font-size: 8pt;">
        Generated by OhOh! Safety Business Suite | © ${new Date().getFullYear()}
      </p>
    </div>
  `;
}

/**
 * Render a field row
 */
function renderField(label: string, value: string): string {
  return `
    <div class="field">
      <span class="field-label">${escapeHtml(label)}:</span>
      <span class="field-value">${escapeHtml(value)}</span>
    </div>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
