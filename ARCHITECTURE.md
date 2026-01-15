# System Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                       │
│                    (React Native Mobile App)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Home Screen  │  │ Incident     │  │ Settings     │         │
│  │ (Category    │→ │ Form Screen  │  │ Screen       │         │
│  │  Selection)  │  │ (Dynamic)    │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                  ↓                  ↓                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Previous     │  │ Incident     │  │ Personal     │         │
│  │ Incidents    │  │ Detail       │  │ Info Screen  │         │
│  │ List         │  │ Screen       │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │           Zustand Store (Global State)             │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  - incidents: IncidentReport[]               │ │         │
│  │  │  - currentIncident: Partial<IncidentReport>  │ │         │
│  │  │  - validationResult: ValidationResult        │ │         │
│  │  │  - isLoading: boolean                        │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │         AsyncStorage (Local Persistence)           │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │  @incidents        → IncidentReport[]        │ │         │
│  │  │  @personal_info    → PersonalInfo            │ │         │
│  │  │  @app_settings     → AppSettings             │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED BUSINESS LOGIC                         │
│                   (@ohoh-incident-reporter/shared)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Types      │  │  Validation  │  │  Constants   │         │
│  │              │  │              │  │              │         │
│  │ • Incident   │  │ • validate   │  │ • Categories │         │
│  │   Report     │  │   Incident   │  │ • Body Parts │         │
│  │ • Person     │  │ • validate   │  │ • PPE Types  │         │
│  │   Involved   │  │   ForPDF     │  │ • Injury     │         │
│  │ • Injury     │  │ • Field      │  │   Types      │         │
│  │   Details    │  │   Rules      │  │ • Legal      │         │
│  │ • Vehicle    │  │              │  │   Text       │         │
│  │   Details    │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │                   Utilities                        │         │
│  │  • formatDateUK()                                  │         │
│  │  • generateIncidentReference()                     │         │
│  │  • getCategoryLabel()                              │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PDF EXPORT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend (React Native)          Backend (Node.js)             │
│  ┌────────────────────┐           ┌────────────────────┐       │
│  │ pdf-export.ts      │           │ pdf-builder.ts     │       │
│  │                    │    HTTP   │                    │       │
│  │ • Export to PDF    │───────────→│ • Build PDF Doc   │       │
│  │ • Generate HTML    │    POST   │ • Add Sections    │       │
│  │ • Share PDF        │   /api/   │ • Add Tables      │       │
│  │                    │   pdf/    │ • Add Signatures  │       │
│  └────────────────────┘  generate └────────────────────┘       │
│           ↓                                  ↓                  │
│  ┌────────────────────┐           ┌────────────────────┐       │
│  │ pdf-html-template  │           │ PDFKit Library     │       │
│  │ • Generate HTML    │           │ • Page Layout      │       │
│  │ • Apply Styles     │           │ • Text Rendering   │       │
│  │ • Format Sections  │           │ • Image Embedding  │       │
│  └────────────────────┘           └────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                             │
│                      (Next.js 15)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │            API Routes (/app/api)                   │         │
│  │                                                     │         │
│  │  POST /api/pdf/generate                            │         │
│  │  ├─ Body: { incident, options }                    │         │
│  │  └─ Response: PDF file (blob)                      │         │
│  │                                                     │         │
│  │  POST /api/incidents/validate                      │         │
│  │  ├─ Body: { incident }                             │         │
│  │  └─ Response: ValidationResult                     │         │
│  │                                                     │         │
│  └────────────────────────────────────────────────────┘         │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │           Database Layer (Optional)                │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │         PostgreSQL (via Prisma ORM)          │ │         │
│  │  │  ┌────────────────────────────────────────┐ │ │         │
│  │  │  │  • Incident Table                      │ │ │         │
│  │  │  │  • PersonalInfo Table                  │ │ │         │
│  │  │  │  • AppSettings Table                   │ │ │         │
│  │  │  └────────────────────────────────────────┘ │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Create Incident

```
User
 │
 │ 1. Taps "Personal Injury"
 ↓
Home Screen
 │
 │ 2. router.push('/incidents/create?category=personal_injury')
 ↓
Incident Form Screen
 │
 │ 3. useIncidentStore.createIncident('personal_injury')
 ↓
Zustand Store
 │
 │ 4. createNewIncident(category)
 ↓
Storage Utilities
 │
 │ 5. Returns scaffold:
 │    { id, referenceCode, category, dateOfIncident, ... }
 ↓
Zustand Store
 │
 │ 6. Sets currentIncident
 ↓
Incident Form Screen
 │
 │ 7. Renders form fields
 │    User fills in data
 │
 │ 8. updateCurrentIncident({ field: value })
 ↓
Zustand Store
 │
 │ 9. Auto-save after 30s
 │    saveCurrentIncident()
 ↓
Validation
 │
 │ 10. validateIncident(incident)
 │     Returns: { valid: true/false, errors: [...] }
 ↓
AsyncStorage
 │
 │ 11. saveIncident(incident)
 │     Stores in @incidents key
 ↓
Success
```

## Data Flow - Export PDF

```
User
 │
 │ 1. Taps "Export Full PDF"
 ↓
Incident Detail Screen
 │
 │ 2. exportIncidentToPDF(incident, options)
 ↓
PDF Export Module
 │
 │ 3. validateIncidentForPDF(incident, options)
 ↓
Validation
 │
 │ 4. Returns: { valid: true, errors: [] }
 ↓
PDF Export Module
 │
 │ 5. generatePdfHtml(incident, options)
 ↓
HTML Template Generator
 │
 │ 6. Returns complete HTML with styles
 ↓
PDF Export Module
 │
 │ 7. POST /api/pdf/generate
 │    Body: { incident, options }
 ↓
Backend API
 │
 │ 8. mapIncidentToPdfModel(incident, options)
 ↓
PDF Builder
 │
 │ 9. buildPdfDocument(pdfModel, options)
 │    - Add header
 │    - Add sections
 │    - Add tables
 │    - Add signatures
 │    - Add legal footer
 ↓
PDFKit
 │
 │ 10. Returns PDF buffer
 ↓
Backend API
 │
 │ 11. Response: PDF file (application/pdf)
 ↓
Frontend
 │
 │ 12. Save to device file system
 │     FileSystem.writeAsStringAsync()
 ↓
Share Module
 │
 │ 13. sharePdf(uri)
 │     Opens native share sheet
 ↓
User
 │
 │ 14. Shares via email/WhatsApp/etc.
 └
```

## Type Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   TYPE DEFINITIONS                           │
│              (shared/src/types/incident.ts)                  │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ↓                 ↓                 ↓
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│   Frontend    │  │   Backend    │  │  Validation  │
│               │  │              │  │              │
│ • Components  │  │ • API Routes │  │ • Rules      │
│ • Screens     │  │ • Services   │  │ • Schemas    │
│ • Stores      │  │ • PDF Gen    │  │ • Checks     │
└───────────────┘  └──────────────┘  └──────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ↓
                  ┌─────────────────┐
                  │  IncidentReport │
                  │   (single type  │
                  │   everywhere)   │
                  └─────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Framework:      React Native + Expo SDK 51+                │
│  Language:       TypeScript 5.3+ (strict mode)              │
│  Routing:        Expo Router (file-based)                   │
│  State:          Zustand + React Context                    │
│  Styling:        NativeWind (Tailwind CSS)                  │
│  Storage:        AsyncStorage                               │
│  UI Components:  Custom + React Native                      │
│  Icons:          Lucide React Native                        │
│  Maps:           React Native Maps                          │
│  Camera:         Expo Camera + Image Picker                 │
│  Sharing:        Expo Sharing                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Framework:      Next.js 15 (App Router)                    │
│  Language:       TypeScript 5.3+ (strict mode)              │
│  Database:       PostgreSQL                                 │
│  ORM:            Prisma                                     │
│  PDF:            PDFKit                                     │
│  Storage:        AWS S3 (optional)                          │
│  Auth:           NextAuth.js (optional)                     │
│  Hosting:        Vercel                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        SHARED                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Language:       TypeScript 5.3+                            │
│  Validation:     Zod + Custom logic                         │
│  Package:        NPM workspace package                      │
│  Distribution:   CommonJS + ESM                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │
│  Mobile Devices  │         │   iOS Devices    │
│   (Android)      │         │   (iPhone/iPad)  │
│                  │         │                  │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         └────────────┬───────────────┘
                      │
              ┌───────▼────────┐
              │                │
              │  React Native  │
              │  App (Expo)    │
              │                │
              └───────┬────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ↓            ↓            ↓
┌────────────┐  ┌──────────┐  ┌────────────┐
│ Local      │  │ Backend  │  │ PDF        │
│ Storage    │  │ API      │  │ Generation │
│(AsyncStore)│  │(Vercel)  │  │ API        │
└────────────┘  └────┬─────┘  └────────────┘
                     │
                ┌────▼─────┐
                │          │
                │PostgreSQL│
                │  (Neon)  │
                │          │
                └──────────┘
```

---

For detailed implementation, see:
- **README.md** - Complete documentation
- **DEVELOPER_GUIDE.md** - Development details
- **QUICKSTART.md** - Setup instructions
