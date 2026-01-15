# Quick Start Guide - OOH Incident Reporter

## 🚀 5-Minute Setup

### 1. Install Dependencies

```powershell
# Navigate to project root
cd C:\Users\16kej\incident-reporting-app

# Install all packages
npm install
cd backend ; npm install
cd ..\frontend ; npm install
cd ..\shared ; npm install ; npm run build
```

### 2. Set Up Environment

```powershell
# Backend environment
cd backend
copy .env.example .env
# Edit .env with your database URL
```

### 3. Initialize Database

```powershell
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4. Start Development

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
# Then press 'a' for Android or 'i' for iOS
```

---

## 📝 Common Development Tasks

### Create New Incident

```typescript
import { useIncidentStore } from '@/lib/store/incident-store';

const { createIncident } = useIncidentStore();
createIncident('personal_injury');
```

### Save Incident

```typescript
const { updateCurrentIncident, saveCurrentIncident } = useIncidentStore();

updateCurrentIncident({
  dateOfIncident: '2024-12-04',
  timeOfIncident: '14:30',
  // ... other fields
});

await saveCurrentIncident();
```

### Export PDF

```typescript
import { exportIncidentToPDF } from '@/lib/pdf/pdf-export';

const result = await exportIncidentToPDF(
  incident,
  {
    summaryOnly: false,
    includePhotos: true,
    includeSignatures: true,
    includeRootCause: true,
    includeCorrectiveActions: true,
  }
);

if (result.success) {
  await sharePdf(result.uri);
}
```

### Validate Incident

```typescript
import { validateIncident } from '@ohoh-incident-reporter/shared';

const result = validateIncident(incident);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

---

## 🐛 Troubleshooting

### Backend won't start

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If in use, kill the process
taskkill /PID <PID> /F

# Or change port in .env
NEXT_PUBLIC_PORT=3001
```

### Frontend bundle errors

```powershell
cd frontend
# Clear cache
npx expo start -c
```

### TypeScript errors in shared package

```powershell
cd shared
npm run build
```

### Database connection issues

1. Check DATABASE_URL in .env
2. Ensure PostgreSQL is running
3. Run migrations: `npm run prisma:push`

---

## 📦 Package Scripts

### Root

```powershell
npm run dev              # Start all services
npm run build            # Build all packages
npm run type-check       # Check TypeScript
```

### Backend

```powershell
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
```

### Frontend

```powershell
npm start                # Start Expo dev server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm run web              # Run in browser
npm run type-check       # Check TypeScript
```

### Shared

```powershell
npm run build            # Build TypeScript
npm run dev              # Watch mode
npm run type-check       # Check TypeScript
```

---

## 🔑 Key Files Reference

### Types
- `shared/src/types/incident.ts` - All incident types
- `shared/src/constants/index.ts` - Constants and reference data

### Validation
- `shared/src/validation/index.ts` - All validation logic

### PDF Export
- `backend/lib/pdf/pdf-builder.ts` - PDF generation (Node.js)
- `frontend/lib/pdf/pdf-export.ts` - PDF export (React Native)
- `frontend/lib/pdf/pdf-html-template.ts` - HTML templates

### Storage
- `frontend/lib/storage/index.ts` - Local storage functions

### State Management
- `frontend/lib/store/incident-store.ts` - Zustand store

### Screens
- `frontend/app/index.tsx` - Home screen
- `frontend/app/incidents/index.tsx` - Incidents list
- `frontend/app/incidents/create.tsx` - Create incident
- `frontend/app/incidents/[id].tsx` - Incident detail

---

## 💡 Tips

1. **Auto-save**: Incidents auto-save as drafts every 30 seconds
2. **Validation**: Run validation before saving or exporting
3. **Photos**: Maximum 10 photos per incident
4. **Offline**: App works fully offline; PDFs generated locally
5. **Testing**: Use "draft" status for test incidents

---

## 📱 Test Data

Use this sample incident for testing:

```typescript
{
  category: 'personal_injury',
  dateOfIncident: '2024-12-04',
  timeOfIncident: '14:30',
  location: {
    manualAddress: '123 Safety Street, London, SW1A 1AA',
    siteName: 'Main Workshop',
    department: 'Manufacturing',
  },
  reportedBy: {
    name: 'John Smith',
    jobTitle: 'Safety Manager',
    email: 'john.smith@example.com',
  },
  personInvolved: {
    fullName: 'Jane Doe',
    age: 32,
    roleOrRelationship: 'employee',
    employer: 'ABC Manufacturing Ltd',
  },
  injuryDetails: {
    natureOfInjury: 'Cut',
    bodyPartsAffected: ['hand', 'finger'],
    severity: 'minor',
    firstAidGiven: { given: true, details: 'Cleaned and bandaged' },
    ppeUsed: { used: true, types: ['Safety gloves'], functioningProperly: true },
  },
  incidentDescription: {
    whatHappened: 'Employee cut hand while operating machinery',
    supervisionPresent: 'yes',
    areaPreviouslyInspected: 'yes',
  },
}
```

---

For full documentation, see [README.md](./README.md)
