# Developer Guide - OOH Incident Reporter

## 🎯 Project Architecture Overview

This application follows a **monorepo workspace structure** with three main packages:

1. **Backend** (Next.js 15) - API server, PDF generation, database
2. **Frontend** (React Native/Expo) - Mobile app, UI, local storage
3. **Shared** - Common types, validation, utilities

All packages use **TypeScript in strict mode** with full end-to-end type safety.

---

## 📐 Type System Architecture

### Type Flow

```
Database (Prisma) → Backend Types → Shared Types → Frontend Types
                                          ↓
                                    PDF Generation
                                          ↓
                                     Validation
```

### Core Type: `IncidentReport`

This is the central type that flows through the entire system:

```typescript
export interface IncidentReport {
  // Identity
  id: string;
  referenceCode: string;
  category: IncidentCategory;
  
  // Time
  dateOfIncident: string;      // ISO date: "2024-12-04"
  timeOfIncident: string;      // 24-hour: "14:30"
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
  
  // Required for all
  location: IncidentLocation;
  reportedBy: ReportingPerson;
  incidentDescription: IncidentDescription;
  
  // Optional based on category
  personInvolved?: PersonInvolved;
  injuryDetails?: InjuryDetails;
  propertyDamageDetails?: PropertyDamageDetails;
  vehicleDetails?: VehicleDetails;
  publicLiabilityDetails?: PublicLiabilityDetails;
  
  // Investigation
  rootCauseAnalysis?: RootCauseAnalysis;
  correctiveActions?: CorrectiveAction[];
  
  // Evidence
  witnesses?: Witness[];
  attachments?: Attachment[];
  signatures?: Signatures;
  
  // Status
  reportStatus?: 'draft' | 'submitted' | 'under_investigation' | 'closed';
}
```

### Type Design Principles

1. **Strict Types**: No `any` types allowed
2. **Optional Fields**: Use `?` for truly optional fields
3. **Enums**: Use union types for fixed sets of values
4. **Nested Objects**: Group related fields
5. **Arrays**: Always typed (e.g., `BodyPart[]`)

---

## 🔄 Data Flow

### 1. Create New Incident

```typescript
// Frontend: User initiates
useIncidentStore.createIncident('personal_injury')
  ↓
// Storage: Generate scaffold
createNewIncident(category)
  ↓
// State: Load into store
currentIncident = { id, referenceCode, category, ... }
```

### 2. User Fills Form

```typescript
// Frontend: User types
<TextInput onChangeText={(text) => 
  updateCurrentIncident({ 'reportedBy.name': text })
} />
  ↓
// Store: Update state
updateCurrentIncident(updates)
  ↓
// State: Merge with current
currentIncident = { ...current, ...updates }
```

### 3. Auto-Save (Every 30s)

```typescript
// Frontend: Auto-save timer
setInterval(() => {
  if (isDirty) saveCurrentIncident()
}, 30000)
  ↓
// Store: Validate
validateCurrentIncident()
  ↓
// Storage: Save to AsyncStorage
saveIncident(currentIncident)
```

### 4. Export PDF

```typescript
// Frontend: User clicks export
exportIncidentToPDF(incident, options)
  ↓
// Validation: Pre-export check
validateIncidentForPDF(incident, options)
  ↓
// Template: Generate HTML
generatePdfHtml(incident, options)
  ↓
// API: Send to backend (or local conversion)
POST /api/pdf/generate
  ↓
// Backend: Build PDF
buildPdfDocument(pdfModel, options)
  ↓
// Return: PDF file
response.blob() → save to device → share
```

---

## 🏗️ Component Architecture

### Screen Hierarchy

```
App
├── DrawerNavigator
│   ├── Home Screen
│   ├── Incidents Stack
│   │   ├── List Screen
│   │   ├── Create Screen
│   │   └── Detail Screen
│   ├── Personal Info Screen
│   └── Settings Screen
```

### Component Patterns

#### 1. Screen Components (`app/*.tsx`)

```typescript
export default function HomeScreen() {
  // Hooks
  const router = useRouter();
  const { incidents, loadIncidents } = useIncidentStore();
  
  // Effects
  useEffect(() => {
    loadIncidents();
  }, []);
  
  // Handlers
  const handlePress = (id: string) => {
    router.push(`/incidents/${id}`);
  };
  
  // Render
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
}
```

#### 2. Form Components (`components/forms/*.tsx`)

```typescript
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
}

export function FormField({ label, value, onChangeText, required, error }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
```

#### 3. List Item Components (`components/incident/*.tsx`)

```typescript
interface IncidentCardProps {
  incident: IncidentReport;
  onPress: (id: string) => void;
}

export function IncidentCard({ incident, onPress }: IncidentCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(incident.id)}
    >
      <Text style={styles.reference}>{incident.referenceCode}</Text>
      <Text style={styles.date}>{formatDateUK(incident.dateOfIncident)}</Text>
      {/* More fields */}
    </TouchableOpacity>
  );
}
```

---

## 📦 State Management Strategy

### Zustand Store (Global State)

Used for:
- Current incident being edited
- List of all incidents
- Loading/error states
- Validation results

```typescript
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
  updateCurrentIncident: (updates: Partial<IncidentReport>) => void;
  saveCurrentIncident: () => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  validateCurrentIncident: () => ValidationResult;
}
```

### Local Component State

Used for:
- UI-only state (modals, dropdowns)
- Form field focus
- Temporary values
- Animation states

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

### AsyncStorage (Persistent Storage)

Used for:
- Saved incidents
- Personal information
- App settings
- Drafts

```typescript
const KEYS = {
  INCIDENTS: '@incidents',
  PERSONAL_INFO: '@personal_info',
  APP_SETTINGS: '@app_settings',
};
```

---

## 🎨 Styling Architecture

### NativeWind (Tailwind CSS)

Primary styling method:

```typescript
<View className="flex-1 bg-gray-100 p-4">
  <Text className="text-2xl font-bold text-primary">Title</Text>
</View>
```

### StyleSheet (React Native)

Used for complex or dynamic styles:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### Theme Colors

```typescript
export const COLORS = {
  primary: '#003366',      // Dark blue
  secondary: '#FFB81C',    // Amber
  danger: '#D32F2F',       // Red
  success: '#2E7D32',      // Green
  warning: '#F57C00',      // Orange
  background: '#F5F5F5',   // Light gray
  text: '#333333',         // Dark gray
  textLight: '#666666',    // Medium gray
};
```

---

## 🧪 Testing Strategy

### Unit Tests

Test individual functions and components:

```typescript
// shared/src/validation/index.test.ts
describe('validateIncident', () => {
  it('should validate basic fields', () => {
    const incident = createTestIncident();
    const result = validateIncident(incident);
    expect(result.valid).toBe(true);
  });
  
  it('should require dateOfIncident', () => {
    const incident = { ...createTestIncident(), dateOfIncident: '' };
    const result = validateIncident(incident);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'dateOfIncident',
      message: 'Date of incident is required',
    });
  });
});
```

### Integration Tests

Test data flow between components:

```typescript
// frontend/lib/storage/index.test.ts
describe('incident storage', () => {
  it('should save and retrieve incident', async () => {
    const incident = createTestIncident();
    await saveIncident(incident);
    
    const retrieved = await getIncidentById(incident.id);
    expect(retrieved).toEqual(incident);
  });
});
```

### E2E Tests (Manual)

1. Create incident for each category
2. Fill all required fields
3. Add photos and signatures
4. Save incident
5. Export both PDF types
6. Verify PDF content
7. Delete incident

---

## 🔒 Security Considerations

### Data Protection

1. **Local Storage**: All data stored on device only
2. **No Cloud Sync**: User controls all data
3. **GDPR Compliance**: Data processed lawfully
4. **Encryption**: Consider encrypting AsyncStorage

### API Security (if using backend)

1. **HTTPS Only**: Enforce SSL/TLS
2. **API Keys**: Rotate regularly
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Validate all inputs

### File Security

1. **File Size Limits**: 10MB per file
2. **File Type Validation**: Images only for photos
3. **Sanitization**: Escape HTML in PDFs
4. **Access Control**: Private file storage

---

## 🚀 Performance Optimization

### Frontend Optimization

1. **Lazy Loading**: Load screens on demand
2. **Memoization**: Use `useMemo` for expensive computations
3. **Debouncing**: Debounce auto-save and search
4. **Image Optimization**: Compress photos before saving
5. **List Virtualization**: Use `FlatList` for long lists

```typescript
// Memoize expensive calculations
const validationResult = useMemo(
  () => validateIncident(currentIncident),
  [currentIncident]
);

// Debounce auto-save
const debouncedSave = useMemo(
  () => debounce(saveCurrentIncident, 30000),
  []
);
```

### Backend Optimization

1. **PDF Streaming**: Stream PDF generation
2. **Caching**: Cache static assets
3. **Database Indexing**: Index frequently queried fields
4. **Connection Pooling**: Reuse database connections

---

## 📝 Code Style Guide

### TypeScript

```typescript
// ✅ Good: Explicit types
function calculateDays(startDate: string, endDate: string): number {
  return daysBetween(startDate, endDate);
}

// ❌ Bad: Implicit any
function calculateDays(startDate, endDate) {
  return daysBetween(startDate, endDate);
}
```

### React Components

```typescript
// ✅ Good: Typed props
interface Props {
  incident: IncidentReport;
  onSave: (incident: IncidentReport) => void;
}

export function IncidentForm({ incident, onSave }: Props) {
  // ...
}

// ❌ Bad: Untyped props
export function IncidentForm({ incident, onSave }) {
  // ...
}
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

```typescript
// Files
incident-form.tsx
pdf-export.ts

// Components
export function IncidentForm() {}

// Functions
function validateIncident() {}

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Types
interface IncidentReport {}
```

---

## 🐛 Debugging Tips

### React Native Debugging

```typescript
// Enable console logs
console.log('Incident:', incident);

// Use React DevTools
// In Chrome: chrome://inspect

// Debug async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
const keys = await AsyncStorage.getAllKeys();
console.log('Storage keys:', keys);
```

### Backend Debugging

```typescript
// Enable debug mode in Next.js
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Log API requests
console.log('PDF generation request:', req.body);
```

### Common Issues

**Issue**: TypeScript errors in shared package
**Solution**: Run `cd shared && npm run build`

**Issue**: Frontend can't find shared types
**Solution**: Check `node_modules/@ohoh-incident-reporter/shared` exists

**Issue**: AsyncStorage not persisting
**Solution**: Clear cache with `npx expo start -c`

**Issue**: PDF generation fails
**Solution**: Check all required fields are present

---

## 📚 Additional Resources

### UK HSE Resources
- [HSE Guidance](https://www.hse.gov.uk/guidance/)
- [RIDDOR Reporting](https://www.hse.gov.uk/riddor/)
- [Accident Investigation](https://www.hse.gov.uk/pubns/hsg245.htm)

### Technical Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [PDFKit Docs](https://pdfkit.org/docs/getting_started.html)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## 🤝 Contributing

### Before Submitting PR

1. Run TypeScript checks: `npm run type-check`
2. Run tests: `npm test`
3. Update documentation if needed
4. Follow commit message convention

### Commit Message Format

```
feat: add signature capture functionality
fix: correct date validation for future dates
docs: update API documentation
refactor: simplify validation logic
test: add tests for PDF generation
```

---

**Happy Coding!** 🚀

For questions, refer to [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md)
