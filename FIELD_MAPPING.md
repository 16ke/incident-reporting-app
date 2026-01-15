# Field Mapping Guide

## UK HSE Compliance - Required Fields by Category

### ALL CATEGORIES (Mandatory)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `category` | Dropdown | Required | personal_injury, property_damage, vehicle_incident, public_liability |
| `dateOfIncident` | Date | Required, not future | Date picker |
| `timeOfIncident` | Time | Required, HH:mm | Time picker (24-hour) |
| `location` | Object | At least GPS or manual | GPS + manual entry option |
| `reportedBy.name` | Text | Required, min 2 chars | Auto-fill from personal info |
| `incidentDescription.whatHappened` | Textarea | Required, min 20 chars | Multi-line, 500 char limit |

### PERSONAL INJURY (Additional Required)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `personInvolved.fullName` | Text | Required | Injured person's name |
| `injuryDetails.natureOfInjury` | Text/Select | Required | Cut, fracture, burn, etc. |
| `injuryDetails.severity` | Dropdown | Required | minor, moderate, severe, fatal |
| `injuryDetails.bodyPartsAffected` | Multi-select | Required (≥1) | Array of body parts |
| `injuryDetails.ppeUsed.used` | Boolean | Required | Yes/No |

### PROPERTY DAMAGE (Additional Required)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `propertyDamageDetails.assetType` | Text | Required | Building, equipment, vehicle, etc. |
| `propertyDamageDetails.assetDescription` | Textarea | Required | Detailed description |
| `propertyDamageDetails.extentOfDamage` | Textarea | Required | Full damage description |
| `propertyDamageDetails.urgentRepairRequired` | Boolean | Required | Yes/No |

### VEHICLE INCIDENT (Additional Required)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `vehicleDetails.registration` | Text | Required, UK format | AA00 AAA or A000 AAA |
| `vehicleDetails.driverName` | Text | Required | Full name |
| `vehicleDetails.companyVehicle` | Boolean | Required | Yes/No |
| `vehicleDetails.policeNotified` | Boolean | Required | Yes/No |
| `vehicleDetails.policeReferenceNumber` | Text | Recommended if police notified | Reference number |

### PUBLIC LIABILITY (Additional Required)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `personInvolved.fullName` | Text | Required | Public member's name |
| `publicLiabilityDetails.reasonForBeingOnSite` | Textarea | Required | Why on premises |
| `injuryDetails` | Object | If injury occurred | Same as personal injury |

### FULL INVESTIGATION PDF (Additional Required)

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `rootCauseAnalysis.directCause` | Textarea | Required | Immediate cause |
| `rootCauseAnalysis.underlyingRootCause` | Textarea | Required | Root cause |
| `rootCauseAnalysis.wereControlsAdequate` | Dropdown | Required | yes, no, unknown |
| `correctiveActions[]` | Array | Required (≥1) | At least one action |
| `correctiveActions[].description` | Textarea | Required | Action description |
| `correctiveActions[].responsiblePerson` | Text | Required | Person assigned |

---

## Optional but Recommended Fields

### Location Details
- `location.siteName` - Site/facility name
- `location.department` - Department/area
- `location.area` - Specific location
- `location.postcode` - UK postcode

### Person Involved
- `personInvolved.age` - Age in years
- `personInvolved.gender` - male, female, other, prefer_not_to_say
- `personInvolved.contactDetails` - Phone/email
- `personInvolved.lengthOfEmploymentMonths` - Employment duration
- `personInvolved.relevantTraining` - Training details

### Injury Details (Personal Injury)
- `injuryDetails.firstAidGiven.details` - Treatment details
- `injuryDetails.hospitalVisit.hospitalName` - Hospital name
- `injuryDetails.expectedLostTimeDays` - Days off work
- `injuryDetails.ppeUsed.types[]` - PPE types used
- `injuryDetails.ppeUsed.functioningProperly` - PPE condition

### Incident Description
- `incidentDescription.sequenceOfEvents` - Timeline
- `incidentDescription.activityAtTime` - What was being done
- `incidentDescription.immediateCause` - Direct cause
- `incidentDescription.unsafeConditions` - Environmental factors
- `incidentDescription.unsafeActs` - Behavioral factors
- `incidentDescription.supervisionPresent` - yes, no, unknown
- `incidentDescription.areaPreviouslyInspected` - yes, no, unknown

### Root Cause Analysis
- `rootCauseAnalysis.indirectCause` - Contributing causes
- `rootCauseAnalysis.contributingFactors[]` - Array of factors
- `rootCauseAnalysis.preventativeMeasures` - Prevention suggestions
- `rootCauseAnalysis.controlsExplanation` - Why controls failed

### Witnesses
- `witnesses[].name` - Witness name
- `witnesses[].contactDetails` - Contact info
- `witnesses[].statement` - Witness statement

### Corrective Actions
- `correctiveActions[].dueDate` - ISO date
- `correctiveActions[].status` - open, in_progress, closed
- `correctiveActions[].priority` - low, medium, high, critical

### Attachments
- `attachments[].uri` - File path/URL
- `attachments[].type` - photo, video, diagram, document
- `attachments[].caption` - Description

### Signatures
- `signatures.reporter` - Reporter signature
- `signatures.investigator` - Investigator signature
- `signatures.witness` - Witness signature

---

## Form Field UI Recommendations

### Section 1: Basic Information
```
┌─────────────────────────────────┐
│ Incident Category *             │
│ [Personal Injury ▼]             │
│                                 │
│ Date of Incident *              │
│ [04/12/2024 📅]                 │
│                                 │
│ Time of Incident *              │
│ [14:30 🕐]                      │
│                                 │
│ Location *                      │
│ [Use Current Location 📍]       │
│ [Manual Address]                │
│ ├─ Site Name                    │
│ ├─ Department                   │
│ └─ Area                         │
└─────────────────────────────────┘
```

### Section 2: Reporter Information
```
┌─────────────────────────────────┐
│ Reporter Name *                 │
│ [John Smith]                    │
│                                 │
│ Job Title                       │
│ [Safety Manager]                │
│                                 │
│ Contact Number                  │
│ [07700 900000]                  │
│                                 │
│ Email                           │
│ [john.smith@example.com]        │
└─────────────────────────────────┘
```

### Section 3: Person Involved (if applicable)
```
┌─────────────────────────────────┐
│ Full Name *                     │
│ [Jane Doe]                      │
│                                 │
│ Age                             │
│ [32]                            │
│                                 │
│ Role/Relationship *             │
│ [Employee ▼]                    │
│                                 │
│ Employer                        │
│ [ABC Manufacturing Ltd]         │
└─────────────────────────────────┘
```

### Section 4: Injury Details (Personal Injury)
```
┌─────────────────────────────────┐
│ Nature of Injury *              │
│ [Cut ▼] or [Free text]          │
│                                 │
│ Body Parts Affected *           │
│ ☑ Hand   ☑ Finger               │
│ ☐ Arm    ☐ Leg                  │
│ [+ More...]                     │
│                                 │
│ Severity *                      │
│ ⚫ Minor                         │
│ ○ Moderate                      │
│ ○ Severe                        │
│ ○ Fatal                         │
│                                 │
│ First Aid Given? *              │
│ ⚫ Yes  ○ No                     │
│ └─ Details: [Cleaned, bandaged] │
│                                 │
│ PPE Used? *                     │
│ ⚫ Yes  ○ No                     │
│ └─ Types: ☑ Gloves ☐ Helmet     │
└─────────────────────────────────┘
```

### Section 5: Incident Description
```
┌─────────────────────────────────┐
│ What Happened? *                │
│ [Multi-line text area]          │
│ [Minimum 20 characters]         │
│ [500 character limit]           │
│                                 │
│ Sequence of Events              │
│ [Multi-line text area]          │
│                                 │
│ Unsafe Conditions               │
│ [Multi-line text area]          │
└─────────────────────────────────┘
```

### Section 6: Root Cause Analysis (Full Report)
```
┌─────────────────────────────────┐
│ Direct Cause *                  │
│ [Text area]                     │
│                                 │
│ Underlying Root Cause *         │
│ [Text area]                     │
│                                 │
│ Contributing Factors            │
│ ☐ Human error                   │
│ ☐ Equipment failure             │
│ ☐ Poor housekeeping             │
│ [+ More...]                     │
└─────────────────────────────────┘
```

### Section 7: Corrective Actions
```
┌─────────────────────────────────┐
│ Action 1                        │
│ ├─ Description *                │
│ │  [Provide additional training]│
│ ├─ Responsible *                │
│ │  [Sarah Johnson]              │
│ ├─ Due Date                     │
│ │  [31/12/2024 📅]              │
│ └─ Status                       │
│    [Open ▼]                     │
│                                 │
│ [+ Add Action]                  │
└─────────────────────────────────┘
```

### Section 8: Attachments
```
┌─────────────────────────────────┐
│ Photos (0/10)                   │
│ ┌───┬───┬───┐                   │
│ │📷 │📷 │📷 │                   │
│ └───┴───┴───┘                   │
│ [+ Add Photo] [+ Take Photo]    │
└─────────────────────────────────┘
```

### Section 9: Signatures
```
┌─────────────────────────────────┐
│ Reporter Signature *            │
│ ┌─────────────────────┐         │
│ │  [Signature canvas] │         │
│ └─────────────────────┘         │
│ [Clear] [Save]                  │
│                                 │
│ Investigator Signature          │
│ ┌─────────────────────┐         │
│ │  [Signature canvas] │         │
│ └─────────────────────┘         │
└─────────────────────────────────┘
```

---

## Validation Error Messages

### Standard Messages

```typescript
const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  invalidDate: 'Please enter a valid date',
  futureDate: 'Date cannot be in the future',
  invalidTime: 'Please enter time in HH:mm format',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid UK phone number',
  invalidPostcode: 'Please enter a valid UK postcode',
  invalidVehicleReg: 'Please enter a valid UK vehicle registration',
  selectAtLeastOne: 'Please select at least one option',
};
```

---

## PDF Field Mapping

### Header Section
- Logo: "OOH Incident Reporter"
- Title: "Incident Summary Report" or "Full Incident Investigation Report"
- Reference: `incident.referenceCode`
- Export Date: Current date (UK format)

### Body Sections (order)
1. Incident Information
2. Reported By
3. Person Involved (if applicable)
4. Category-Specific Details
5. Incident Description
6. Witnesses (if any)
7. Root Cause Analysis (full report only)
8. Corrective Actions (full report only)
9. Attachments (if included)
10. Signatures (if included)

### Footer
- Legal disclaimer
- GDPR statement
- Page numbers
- "CONFIDENTIAL" banner

---

For implementation details, see the main [README.md](./README.md)
