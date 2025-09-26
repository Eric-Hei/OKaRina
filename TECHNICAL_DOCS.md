# Documentation Technique - OKaRina 🎯

Guide technique complet pour les développeurs travaillant sur OKaRina.

---

## 🏗️ Architecture Générale

### Stack Technologique
```
Frontend: Next.js 15.5.3 + React 19 + TypeScript
Styling: Tailwind CSS + Framer Motion
State: Zustand avec persistance localStorage
Forms: React Hook Form + Zod validation
DnD: @dnd-kit (compatible React 19)
IA: Google Generative AI (Gemini 1.5 Flash)
Export: jsPDF + SheetJS
Deploy: Netlify (export statique)
```

### Architecture des Données
```
Ambitions (multiples)
├── Key Results d'Ambition (multiples par ambition)
├── Objectifs Trimestriels (multiples par ambition)
│   ├── Key Results Trimestriels (multiples par objectif)
│   └── Actions (plan d'actions par objectif)
└── Kanban Unique (toutes les actions par statut)
```

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/                 # Composants UI de base
│   │   ├── Button.tsx      # Bouton avec variants
│   │   ├── Card.tsx        # Conteneur principal
│   │   ├── Badge.tsx       # Étiquettes colorées
│   │   ├── HierarchicalTreeView.tsx  # Vue arborescente
│   │   ├── KanbanBoard.tsx           # Tableau Kanban
│   │   └── PyramidView.tsx           # Vue pyramidale
│   ├── canvas/             # Étapes du Canvas guidé
│   │   ├── AmbitionStep.tsx          # Multi-ambitions
│   │   ├── KeyResultsStep.tsx        # Multi-KR par ambition
│   │   ├── QuarterlyObjectivesStep.tsx # Objectifs trimestriels
│   │   └── ActionsStep.tsx           # Actions
│   ├── forms/              # Formulaires avec validation
│   └── layout/             # Mise en page
├── pages/                  # Pages Next.js
├── services/               # Logique métier
├── store/                  # State management Zustand
├── types/                  # Types TypeScript
├── utils/                  # Utilitaires
└── constants/              # Constantes et exemples
```

---

## 🔧 Services Principaux

### 1. Storage Service (`src/services/storage.ts`)
Gestion de la persistance localStorage avec fallback.

```typescript
class StorageService {
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
}
```

### 2. AI Coach Service (`src/services/ai-coach.ts`)
Service d'IA pour validation et suggestions contextuelles.

```typescript
class AICoachService {
  validateAmbitionAsync(ambition: Partial<Ambition>): Promise<AIValidation>
  validateKeyResultAsync(keyResult: Partial<KeyResult>): Promise<AIValidation>
  validateQuarterlyObjectiveAsync(objective: Partial<QuarterlyObjective>): Promise<AIValidation>
}
```

### 3. Gemini Service (`src/services/gemini.ts`)
Intégration avec Google Generative AI.

```typescript
class GeminiService {
  generateAmbitionAdvice(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): Promise<string>
  generateKeyResultAdvice(keyResult: Partial<KeyResult>, companyProfile?: CompanyProfile): Promise<string>
}
```

### 4. Analytics Service (`src/services/analytics.ts`)
Calculs de métriques et analytics.

```typescript
class AnalyticsService {
  calculateOverallProgress(): number
  calculateAmbitionProgress(ambitionId: string): number
  getProgressByCategory(): CategoryProgress[]
  generateInsights(): AnalyticsInsight[]
}
```

---

## 🗄️ State Management

### Store Principal (`src/store/useAppStore.ts`)
Store Zustand principal avec persistance.

```typescript
interface AppStore {
  // Données
  user: User | null
  ambitions: Ambition[]
  keyResults: KeyResult[]
  quarterlyObjectives: QuarterlyObjective[]
  quarterlyKeyResults: QuarterlyKeyResult[]
  actions: Action[]
  
  // Actions
  addAmbition: (ambition: Ambition) => void
  updateAmbition: (id: string, updates: Partial<Ambition>) => void
  deleteAmbition: (id: string) => void
  
  // Filtres
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
}
```

### Store Canvas (`src/store/useCanvasStore.ts`)
Store dédié au workflow du Canvas guidé.

```typescript
interface CanvasStore {
  currentStep: number
  completedSteps: number[]
  
  // Données temporaires du Canvas
  ambitionsData: AmbitionFormData[]
  keyResultsData: KeyResultFormData[]
  quarterlyObjectivesData: QuarterlyObjectiveFormData[]
  
  // Actions
  completeStep: (step: number) => void
  goToStep: (step: number) => void
  resetCanvas: () => void
}
```

---

## 🎨 Système de Design

### Couleurs Principales
```css
/* Tailwind CSS Custom Colors */
primary: {
  50: '#f0f9ff',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
}

success: {
  50: '#f0fdf4',
  500: '#10b981',
  600: '#059669',
}

warning: {
  50: '#fffbeb',
  500: '#f59e0b',
  600: '#d97706',
}

danger: {
  50: '#fef2f2',
  500: '#ef4444',
  600: '#dc2626',
}
```

### Composants UI

#### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}
```

#### Badge Component
```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}
```

---

## 🔄 Workflow Canvas Guidé

### Étape 1 : Ambitions (`AmbitionStep.tsx`)
```typescript
// Gestion locale des ambitions multiples
const [ambitionsList, setAmbitionsList] = useState<AmbitionFormData[]>([])

// Alerte si > 3 ambitions
{ambitionsList.length > 3 && (
  <AlertMessage type="warning">
    Attention : Plus de 3 ambitions peuvent nuire au focus
  </AlertMessage>
)}

// Sauvegarde finale
const handleFinishStep = () => {
  ambitionsList.forEach(data => {
    const newAmbition = createAmbition(data)
    addAmbition(newAmbition)
  })
  completeStep(1)
}
```

### Étape 2 : Key Results (`KeyResultsStep.tsx`)
```typescript
// Sélection de l'ambition parente
const [selectedAmbitionId, setSelectedAmbitionId] = useState<string>('')

// Gestion des KR multiples par ambition
const [keyResultsList, setKeyResultsList] = useState<KeyResultFormData[]>([])

// Alerte si > 3 KR
{keyResultsList.length > 3 && (
  <AlertMessage type="warning">
    Recommandation : Maximum 3 KR par ambition
  </AlertMessage>
)}
```

### Étape 3 : Objectifs Trimestriels (`QuarterlyObjectivesStep.tsx`)
```typescript
// Objectifs multiples avec rattachement aux ambitions
const [quarterlyObjectivesData, setQuarterlyObjectivesData] = useState<QuarterlyObjectiveFormData[]>([])

// Système d'alerte intégré
{quarterlyObjectivesData.length > 3 && (
  <AlertMessage type="warning">
    Trop d'objectifs trimestriels (>{quarterlyObjectivesData.length})
  </AlertMessage>
)}
```

---

## 🎯 Intégration IA

### Configuration Gemini AI
```typescript
// .env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

// Service Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
```

### Profil d'Entreprise pour Contexte
```typescript
interface CompanyProfile {
  name: string
  sector: string
  size: CompanySize
  mainGoals: string[]
  challenges: string[]
  market: string
}

// Utilisation dans les prompts IA
const buildContextualPrompt = (objective: any, profile: CompanyProfile) => {
  return `En tant qu'expert pour une ${profile.size} dans le secteur ${profile.sector}...`
}
```

### Fallback Gracieux
```typescript
const validateWithAI = async (data: any) => {
  try {
    return await geminiService.validate(data)
  } catch (error) {
    console.warn('IA indisponible, utilisation du fallback')
    return localValidation(data)
  }
}
```

---

## 📊 Gestion des Données

### Types Principaux
```typescript
interface Ambition {
  id: string
  title: string
  description: string
  year: number
  category: AmbitionCategory
  priority: Priority
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface KeyResult {
  id: string
  ambitionId: string
  title: string
  description: string
  target: number        // Nouvelle nomenclature
  current: number       // Nouvelle nomenclature
  unit: string
  deadline: Date
  priority: Priority
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface QuarterlyObjective {
  id: string
  ambitionId: string
  title: string
  description: string
  quarter: Quarter
  year: number
  status: Status
  createdAt: Date
  updatedAt: Date
}

interface Action {
  id: string
  quarterlyObjectiveId: string
  title: string
  description?: string
  status: ActionStatus  // TODO | IN_PROGRESS | DONE
  priority: Priority
  labels: string[]
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Persistance localStorage
```typescript
// Clés de stockage
const STORAGE_KEYS = {
  USER: 'okarina_user',
  AMBITIONS: 'okarina_ambitions',
  KEY_RESULTS: 'okarina_key_results',
  QUARTERLY_OBJECTIVES: 'okarina_quarterly_objectives',
  QUARTERLY_KEY_RESULTS: 'okarina_quarterly_key_results',
  ACTIONS: 'okarina_actions',
  CANVAS_STATE: 'okarina_canvas_state',
}

// Persistance automatique avec Zustand
const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'okarina-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

---

## 🚀 Build et Déploiement

### Configuration Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Scripts de Build
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Déploiement Netlify
```toml
# netlify.toml
[build]
  command = "echo 'Skipping build, using pre-built files'"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🧪 Tests et Qualité

### Configuration Jest
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Exemple de Test
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })
})
```

---

## 🔧 Outils de Développement

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📈 Performance et Optimisation

### Métriques Actuelles
- **First Load JS** : ~114 kB
- **Largest Page** : 554 kB (page rapports)
- **Build Time** : ~4 secondes
- **Deploy Time** : ~10 secondes

### Optimisations Appliquées
- **Code Splitting** : Automatique avec Next.js
- **Tree Shaking** : Suppression du code mort
- **Bundle Analysis** : Monitoring de la taille
- **Static Export** : Performance maximale

### Monitoring
```bash
# Analyse du bundle
npm run build
npx @next/bundle-analyzer

# Performance audit
npm run lighthouse
```

---

*Documentation mise à jour le : 26 décembre 2024*
