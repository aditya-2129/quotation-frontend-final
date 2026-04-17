# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Static export to /out (required before Tauri build)
npm run lint       # Run ESLint
npm run tauri      # Run Tauri desktop app commands (e.g. npm run tauri dev)
```

---

## Critical Constraints (Hybrid Web + Tauri Desktop)

This app runs as both a Next.js web app and a Tauri desktop app. The desktop build requires a static export (SSG), which imposes hard rules:

- **No dynamic route segments** — never create `[id]/page.jsx`. Use search params instead: `/quotations-draft?id=XYZ`
- **No `/api` routes** — all data operations go directly to Appwrite from the client. The only API routes that exist (`/api/admin/create-user`, `/api/admin/reset-password`) are web-only and blocked in Tauri via `window.__TAURI__` detection.
- **No server-side image optimization** — `next/image` must use `unoptimized: true` (already configured in `next.config.mjs`)
- **Admin features (`APPWRITE_API_KEY`)** are web-only; `auth.js` throws if called from a Tauri context
- **`output: 'export'`** is only set in production; dev runs SSR normally so hot-reload works

**next.config.mjs:**
```js
const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';
export default {
  output: isProd ? 'export' : undefined,
  images: { unoptimized: true },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};
```

---

## Environment Variables

```
NEXT_PUBLIC_APPWRITE_PROJECT_ID=machine-shop-quotation
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=Machine Shop Quotation
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_API_KEY=<server-side only, for admin API routes — never expose to client>
TAURI_DEV_HOST=<optional, set by Tauri during mobile dev builds>
```

- All `NEXT_PUBLIC_*` vars are safe for client-side use.
- `APPWRITE_API_KEY` must only be used inside `/api` routes (web-only).

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, static export), React 19 |
| Styling | Tailwind CSS 4 (utility-first), inline `THEME` tokens |
| Server state | TanStack Query 5 (`staleTime: 60s`, `refetchOnWindowFocus: false`) |
| Client state | React Context (`AuthContext`) + `useState` per component |
| Forms | Manual `useState` + `setFormData` — React Hook Form and Zod are installed but not yet used |
| Backend | Appwrite (BaaS) — auth, database, file storage; no custom backend server |
| Desktop | Tauri 2 (wraps the static `/out` export) |
| PDF export | jsPDF + jsPDF-AutoTable |
| Excel export | xlsx-js-style |
| Icons | Lucide React |
| Notifications | react-hot-toast |

> **Note:** Zustand 5 is installed but **not used**. Do not add Zustand stores — all client state lives in `AuthContext` or local `useState`.

### Path Alias

`@/*` resolves to `./src/*`.

---

## Directory Structure (Annotated)

```
src/
├── app/                          # Next.js App Router pages — NO dynamic segments
│   ├── layout.jsx                # Root layout: AuthProvider, QueryClient provider, Toaster
│   ├── page.jsx                  # Dashboard home
│   ├── login/page.jsx
│   ├── forgot-password/page.jsx
│   ├── reset-password/page.jsx   # Uses userId + secret query params
│   ├── quotations-draft/
│   │   ├── page.jsx              # Draft quotations list
│   │   ├── new/page.jsx          # New quotation form
│   │   └── edit/page.jsx         # Edit quotation (id from search params)
│   ├── quotations-approved/page.jsx
│   ├── confirmed-orders/page.jsx
│   ├── customers/page.jsx
│   ├── materials/page.jsx
│   ├── labor-rates/page.jsx
│   ├── bop-library/page.jsx
│   ├── process-&-tooling/page.jsx
│   └── admin/users/page.jsx      # Admin-only
│
├── features/                     # Domain-driven feature modules
│   ├── admin/
│   │   ├── api/useUsers.js       # User CRUD hooks
│   │   └── components/UserModal.jsx
│   ├── customers/
│   │   ├── api/useCustomers.js
│   │   └── components/CustomerModal.jsx
│   ├── dashboard/
│   │   └── api/useDashboard.js   # Stats + recent quotations
│   ├── inventory/
│   │   ├── api/useBOP.js
│   │   ├── api/useLabor.js
│   │   ├── api/useMaterials.js
│   │   └── components/BOPModal.jsx, LaborModal.jsx, MaterialModal.jsx
│   └── quotations/
│       ├── api/
│       │   ├── useQuotations.js          # Draft CRUD
│       │   ├── useApprovedQuotations.js  # Approved list + metrics
│       │   └── usePurchaseOrders.js      # PO list + metrics
│       ├── components/                   # Quotation form sections (see below)
│       └── utils/calculations.js         # Pure cost calculation functions
│
├── services/                     # Appwrite SDK wrappers — one file per collection
│   ├── auth.js
│   ├── users.js
│   ├── customers.js
│   ├── materials.js
│   ├── rates.js                  # laborRateService + bopRateService
│   ├── quotations-draft.js
│   ├── quotations-approved.js
│   ├── purchase-orders.js
│   ├── dashboard.js
│   └── assets.js                 # File upload/download/preview (Appwrite Storage)
│
├── components/
│   ├── layout/
│   │   ├── AuthGuard.jsx         # Route protection + role-based access
│   │   ├── DashboardLayout.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── ui/                       # Shared design system
│   │   ├── ActionButtons.jsx
│   │   ├── DateRangePicker.jsx
│   │   ├── FeaturePanel.jsx
│   │   └── Pagination.jsx
│   ├── AssetPreviewModal.jsx
│   ├── ConfirmationModal.jsx
│   ├── DownloadOptionsModal.jsx
│   ├── LogPoModal.jsx
│   ├── OrderDetailsModal.jsx
│   ├── PdfPreviewModal.jsx
│   ├── QuotationPreviewModal.jsx
│   ├── RejectionModal.jsx
│   ├── SuccessModal.jsx
│   └── ValidationModal.jsx
│
├── context/
│   └── AuthContext.jsx           # App-wide auth state (user, userProfile, isAdmin)
│
├── providers/
│   └── index.jsx                 # TanStack QueryClient provider (staleTime 60s)
│
├── lib/
│   └── appwrite.js               # Appwrite SDK init: client, databases, storage, account
│
├── constants/
│   ├── appwrite.js               # DATABASE_ID, COLLECTIONS.*, BUCKETS.*
│   ├── ui.js                     # THEME object: colors, fonts, spacing, z-indexes
│   └── pdfConstants.js           # COMPANY info, COLORS, numberToWords(), loadImage()
│
├── utils/                        # Pure functions — no React, no side effects
│   ├── format.js                 # formatDecimal(), formatCurrency() (en-IN locale)
│   ├── generateQuotationPDF.js   # Multi-page quotation PDF (jsPDF)
│   ├── generateSinglePagePDF.js  # One-page cost summary PDF
│   ├── generateMaterialListPDF.js
│   ├── generateProcessSheetPDF.js
│   ├── generateBOPListPDF.js
│   └── exportToExcel.js          # XLSX export via xlsx-js-style
│
└── hooks/
    └── useAssets.js              # File upload/delete wrapper around assetService
```

---

## Data Flow

```
AuthContext (login/logout, user profile, isAdmin flag)
  └─ AuthGuard (protects routes, redirects by role)
       └─ DashboardLayout → page components
            └─ TanStack Query hooks  (features/*/api/)
                 └─ services/*.js    (Appwrite SDK calls)
                      └─ Appwrite    (sgp.cloud.appwrite.io)
```

---

## Auth & Route Protection

### AuthContext (`src/context/AuthContext.jsx`)

State managed: `user` (Appwrite auth user), `userProfile` (custom `users` doc), `isLoading`, `isAdmin`.

- `isAdmin` = `userProfile.role === 'admin'`
- `checkSession()` runs on mount: fetches current auth user + profile
- `login(email, password)` creates session then fetches profile
- `logout()` deletes session + clears state
- Access via `useAuth()` hook

### AuthGuard (`src/components/layout/AuthGuard.jsx`)

- Unauthenticated users → redirected to `/login`
- Regular users can only access `USER_ALLOWED_ROUTES`: `/quotations-draft`, `/quotations-approved`, `/customers`, `/materials`, `/labor-rates`, `/bop-library`
- Admins bypass all route checks
- Unauthorized users redirected to `/quotations-draft`
- Route matching: exact path + sub-path wildcard (e.g., `/quotations-draft/new` is covered)

### User Profiles (`users` collection)

Custom user profiles are stored separately from Appwrite auth. Linked via `auth_id` field. Creating a user requires both an Appwrite auth account (via `/api/admin/create-user`) and a profile document — do not do one without the other.

---

## Appwrite Collections

**Database ID:** `machine-shop-database`  
All IDs defined in `src/constants/appwrite.js` as `COLLECTIONS.*` and `BUCKETS.*`.

### `quotation_history`
Stores both draft and approved quotations. Key fields:

```js
{
  quotation_no: string,          // unique, e.g. "QTN-00001"
  status: "Draft" | "Approved" | "Rejected" | "Cancelled" | "Completed",
  supplier_name: string,         // customer name
  contact_person: string,
  contact_phone: string,
  contact_email: string,
  quoting_engineer: string,
  project_name: string,
  quantity: number,
  production_mode: "Prototype" | "Batch" | "Production",
  inquiry_date: string,          // ISO date
  delivery_date: string,
  revision_no: string,
  project_image: object,         // { $id, name, sizeOriginal, mimeType, localPreview }
  inquiry_pdfs: array,
  inquiry_cad_files: array,
  items: array,                  // JSON stringified in Appwrite, parsed in service
  bought_out_items: array,
  packaging_cost: number,
  transportation_cost: number,
  design_cost: number,
  assembly_cost: number,
  markup: number,                // percentage
  total_amount: number,          // used for reports/metrics
  detailed_breakdown: string,    // JSON string of totals object
}
```

### `customers`
```js
{ name, contact_person, email, phone }
```

### `materials_library`
```js
{ name, grade, base_rate, density, shape, form }
```

### `labor_rates`
```js
{ process_name, unit, rate, hourly_rate, setup_time, cycle_time }
```
`unit` values: `"hr"`, `"pcs"`, `"per_hole"`, `"per_rim"`, `"per_tap"`, `"sq_cm"`

### `bop_library`
```js
{ item_name, supplier, rate, unit }
```

### `users`
```js
{ auth_id, name, email, mobile, role }
```
`role` values: `"admin"`, `"user"`

### `purchase_orders`
```js
{ po_number, customer_name, engineer_name, status, total_amount }
```

### Buckets
- `BUCKETS.INQUIRY_FILES` — PDFs, CAD files, and images attached to quotations

---

## Services Reference (`src/services/`)

### `auth.js`
- `login(email, password)` → `account.createEmailPasswordSession`
- `logout()` → `account.deleteSession('current')`
- `getCurrentUser()` → `account.get()`
- `createRecovery(email)`, `updateRecovery(userId, secret, password)`
- `createAuthAccount(email, password, name)` → POSTs to `/api/admin/create-user` (web-only)
- `resetUserPassword(userId, password)` → POSTs to `/api/admin/reset-password` (web-only)
- **Throws** if `window.__TAURI__` detected for admin operations

### `users.js`
- `getUserByAuthId(authId)` — `Query.equal('auth_id', authId)`
- `listUsers(limit, offset)` — ordered by name asc
- `createUser(data)`, `updateUser(documentId, data)`, `deleteUser(documentId)`

### `customers.js`
- `listCustomers(limit, offset, searchQuery)` — `Query.contains` on name, contact_person, email, phone
- `createCustomer`, `getCustomer`, `updateCustomer`, `deleteCustomer`

### `materials.js`
- `listMaterials(limit, offset, search)` — `Query.contains` on name, grade
- Full CRUD

### `rates.js` — exports `laborRateService` and `bopRateService`
- `laborRateService.listRates` — ordered by `process_name`
- `bopRateService.listRates` — ordered by `item_name`
- Both export `createRate`, `updateRate`, `deleteRate`

### `quotations-draft.js`
- `listQuotations(limit, offset, filters)` — excludes Cancelled/Approved; supports search (quotation_no, part_number, supplier_name) and dateRange
- `generateNextQuotationID()` — fetches latest QTN-XXXXX and increments; returns e.g. `"QTN-00042"`
- `createQuotation`, `getQuotation`, `updateQuotation`, `deleteQuotation` (soft delete → `status: 'Cancelled'`)

### `quotations-approved.js`
- `listApprovedQuotations(limit, offset, filters)` — `status='Approved'`; supports search, engineer, dateRange/timePeriod filters
- `getApprovedMetrics(filters)` — aggregates `total_amount` across up to 5000 docs
- `updateStatus(id, status)`

### `purchase-orders.js`
- `listOrders(limit, offset, filters)` — supports search, engineer, status filters
- `getOrderMetrics(filters)` — total, activeCount, averageValue

### `dashboard.js`
- `getDashboardStats()` — parallel `Promise.all` for quotations/customers/materials; computes thisMonth vs lastMonth revenue trend (% change)
- `getRecentQuotations(limit)` — last N docs by `$createdAt`

### `assets.js`
- `uploadFile(file)` → `storage.createFile(BUCKETS.INQUIRY_FILES, ID.unique(), file)`
- `getFilePreview(fileId)`, `getFileView(fileId)`, `getFileDownload(fileId)`
- `deleteFile(fileId)`

---

## TanStack Query Hooks Reference (`src/features/*/api/`)

All hooks follow the same structure: list hooks accept `(limit, offset, filters)`, mutation hooks return `useMutation` with automatic cache invalidation via `queryClient.invalidateQueries`.

**Query client config:** `staleTime: 60000`, `refetchOnWindowFocus: false`

| Hook file | Exports |
|---|---|
| `useQuotations.js` | `useQuotations`, `useQuotation`, `useCreateQuotation`, `useUpdateQuotation`, `useDeleteQuotation` |
| `useApprovedQuotations.js` | `useApprovedQuotations`, `useApprovedMetrics` |
| `usePurchaseOrders.js` | `usePurchaseOrders`, `useOrderMetrics` |
| `useCustomers.js` | `useCustomers`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer` |
| `useMaterials.js` | `useMaterials`, `useCreateMaterial`, `useUpdateMaterial`, `useDeleteMaterial` |
| `useLabor.js` | `useLaborList`, `useCreateLabor`, `useUpdateLabor`, `useDeleteLabor` |
| `useBOP.js` | `useBOPList`, `useCreateBOP`, `useUpdateBOP`, `useDeleteBOP` |
| `useUsers.js` | `useUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useResetPassword` |
| `useDashboard.js` | `useDashboardStats`, `useRecentQuotations` |

---

## Quotation Form Architecture

The form is a multi-panel wizard. Each panel is an independent component under `src/features/quotations/components/`. The parent (`new/page.jsx` and `edit/page.jsx`) holds all state in a single `formData` object and passes down `setFormData`.

### Form Sections (in order)

| Component | Panel | Responsibility |
|---|---|---|
| `ScopeAndIdentity.jsx` | 1 | Customer, engineer, dates, quantity, production mode, file uploads |
| `BOMRegistry.jsx` | 2 | Add/remove parts with name, qty, images, design files |
| `RawMaterial.jsx` | 3 | Per-part material selection, shape, dimensions, allowances, weight calc |
| `MachiningLogic.jsx` | 4 | Per-part manufacturing steps — process, cycle time, setup time, unit rate |
| `BroughtOutParts.jsx` | 5 | Project-wide purchased items from BOP library or manual entry |
| `CommercialAdjustments.jsx` | 6 | Packaging, transportation, design, assembly extra costs |
| `ValuationLedger.jsx` | — | Right sidebar: real-time cost breakdown, markup slider, totals |

### `formData` Shape (top-level)

```js
{
  quotation_no, revision_no, status,
  supplier_name, contact_person, contact_phone, contact_email,
  quoting_engineer, project_name, quantity, production_mode,
  inquiry_date, delivery_date,
  project_image, inquiry_pdfs, inquiry_cad_files,

  items: [
    {
      id,          // timestamp
      part_name, qty,
      part_image, design_files,
      jobType,     // "standard" | "rework" | "labour"
      material: { $id, grade, name, base_rate, density, shape, isManual, category },
      dimensions: { l, w, t, dia, af },
      allowances:  { l, w, t, dia, af },
      material_weight,
      processes: [{ id, process_name, rate, unit, cycle_time, setup_time, dim1, dim2 }],
      treatments: [{ id, treatment_name, cost, per_unit }],
    }
  ],

  bought_out_items: [{ id, item_name, rate, qty, unit, isManual }],

  packaging_cost, transportation_cost, design_cost, assembly_cost,
  markup,          // percentage
  total_amount,
  detailed_breakdown,
}
```

---

## Business Logic — Cost Calculations

**File:** `src/features/quotations/utils/calculations.js`

Keep all cost logic here as pure functions — no React imports, no side effects. The `ValuationLedger` calls `calculateQuotationTotals(formData)` on every render.

### `calculateQuotationTotals(formData)` returns:

```js
{
  materialCost,     // sum of (weight × base_rate) per part × qty
  laborCost,        // sum of all process costs
  bopCost,          // sum of (rate × qty) for bought_out_items
  treatmentCost,    // sum of treatment costs
  engineeringCost,  // design_cost + assembly_cost
  commercialCost,   // packaging_cost + transportation_cost
  totalExtras,      // engineeringCost + commercialCost
  unitSubtotal,     // materialCost + laborCost + bopCost + treatmentCost
  unitFinal,        // unitSubtotal × (1 + markup/100)
  grandTotal,       // unitFinal × quantity + totalExtras
}
```

### Weight Calculation

```
volume = computed from shape + dimensions + allowances
weight (kg) = volume × density / 1,000,000   // dimensions in mm → cm³ → kg
```

### Process Cost Patterns

- `unit: "hr"` → `(setup_time + cycle_time) × hourly_rate`
- `unit: "pcs"` → `rate` (flat per piece)
- `unit: "sq_cm"` → `(dim1 × dim2 / 100) × rate` (wire-cut, grinding)
- `unit: "per_hole"/"per_tap"/"per_rim"` → `count × rate`

---

## PDF Generation

All PDF generators are pure functions in `src/utils/`. They accept a quotation object and options, and either trigger a browser download or return a blob.

| File | Output |
|---|---|
| `generateQuotationPDF.js` | Full multi-page quotation document with company header |
| `generateSinglePagePDF.js` | One-page cost summary |
| `generateMaterialListPDF.js` | Material cost breakdown report |
| `generateProcessSheetPDF.js` | Manufacturing steps per part |
| `generateBOPListPDF.js` | Brought-out parts list |

**Company branding** (header, colors, GSTIN) is centralized in `src/constants/pdfConstants.js`:
- `COMPANY` — name, tagline, address, phone, email, GSTIN, state
- `COLORS` — PRIMARY (green), TEXT_DARK, TEXT_LIGHT, BG_LIGHT, BORDER
- `numberToWords(num)` — converts to Indian words (Crore/Lakh/Thousand)
- `loadImage(src)` — fetch + FileReader + data URL with CORS fallback
- `safeParseItems(raw)`, `safeParseBreakdown(raw)` — JSON parse with fallback

---

## File Upload Pattern

```
useAssets hook (src/hooks/useAssets.js)
  └─ assetService (src/services/assets.js)
       └─ Appwrite Storage (BUCKETS.INQUIRY_FILES)
```

1. `<input type="file" onChange>` triggers upload
2. Local blob URL created via `URL.createObjectURL(file)` for immediate preview
3. File uploaded to Appwrite; response includes `$id`
4. Stored as `{ $id, name, sizeOriginal, mimeType, localPreview }` in `formData`
5. On re-load (edit form), `localPreview` is absent; use `assetService.getFilePreview($id)` instead

---

## Appwrite Query Patterns

```js
// AND conditions — pass array to Query methods
databases.listDocuments(DB, COLLECTION, [
  Query.equal('status', 'Approved'),
  Query.greaterThanEqual('$createdAt', startDate),
  Query.lessThanEqual('$createdAt', endDate),
  Query.limit(25),
  Query.offset(0),
  Query.orderDesc('$createdAt'),
])

// OR conditions
Query.or([Query.contains('name', q), Query.contains('email', q)])
```

- Max documents per request: 5000 (`Query.limit(5000)`) — used in metrics aggregation
- Default pagination: 25 per page

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Pages | kebab-case directory | `quotations-draft/page.jsx` |
| Components | PascalCase | `ScopeAndIdentity.jsx` |
| Hooks (query) | `use` + PascalCase + noun | `useQuotations.js` |
| Services | camelCase | `quotations-draft.js` |
| Utilities | camelCase | `exportToExcel.js` |
| Constants | UPPER_SNAKE_CASE | `COLLECTIONS.QUOTATION_HISTORY` |
| Modals | `XxxModal.jsx` | `ConfirmationModal.jsx` |

---

## Coding Patterns

### Form State
- Form state is a single `formData` object in the page component
- Updates go through `setFormData(prev => ({ ...prev, field: value }))`
- Nested updates use spread: `setFormData(prev => ({ ...prev, items: [...] }))`
- **No React Hook Form** — validation is manual (conditional `className` with red borders)

### Search / Debounce
- `useEffect` + `setTimeout(fn, 400)` + cleanup `clearTimeout`
- Fetch from server only when `search.length >= 2`
- Fall back to local library filter if no server results

### Conditional Styling
```js
className={clsx('border rounded', error && 'border-red-500', active && 'ring-2')}
// or with tailwind-merge for conflicts:
import { twMerge } from 'tailwind-merge'
```

### Styling with THEME Tokens
```js
import { THEME } from '@/constants/ui'
// use inline style for design tokens (color, fontSize, etc.)
<div style={{ color: THEME.colors.primary, fontSize: THEME.fontSize.sm }}>
// use Tailwind for layout/spacing utilities
```

### Error Handling
- Services: `try/catch` with `console.error`; re-throw for consumers
- 401 errors suppressed in `auth.login` (handled gracefully)
- PDF image loading failures return `{ dataUrl: null }` (graceful fallback)

### Dropdown z-index
- Use fixed-position overlay + backdrop to avoid overflow clipping inside scrollable containers
- z-index values are defined in `THEME.zIndex`

---

## Tauri Desktop Configuration

**`src-tauri/tauri.conf.json`:**
- Product name: `"Kaivalya Quotation Maker"`
- Identifier: `"com.krupa.quotation-maker"`
- Window: 800×600px, resizable
- `frontendDist: "../out"` — reads from Next.js static export
- `devUrl: "http://localhost:3000"`
- `beforeDevCommand: "npm run dev"`
- `beforeBuildCommand: "npm run build"`
- CSP: `null` (allows inline scripts for dev flexibility)

**Tauri-specific guards in code:**
```js
// In auth.js — block admin operations in desktop app
if (window.__TAURI__) throw new Error("Admin features not available in desktop app");
```

---

## ESLint

Config: `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals`.

Ignored: `.next/`, `out/`, `build/`, `next-env.d.ts`

Run: `npm run lint`

---

## Key Dependencies (Versions)

```
next@16.2.1
react@19.2.4
appwrite@^23.0.0          # Browser SDK
node-appwrite@^23.0.0     # Server SDK (API routes only)
@tanstack/react-query@^5.96.2
react-hook-form@^7.72.1   # Installed, not yet used
zod@^4.3.6                # Installed, not yet used
zustand@^5.0.12           # Installed, not used — do not add stores
jspdf@^4.2.1
jspdf-autotable@^5.0.7
xlsx-js-style@^1.2.0
date-fns@^4.1.0
react-hot-toast@^2.6.0
lucide-react@^1.7.0
tailwindcss@^4
clsx@^2.1.1
tailwind-merge@^3.5.0
@tauri-apps/cli@^2.10.1
```
