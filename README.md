# Trip Splitter — Frontend Developer Assignment

A React and Redux Toolkit expense splitting application built with strict TypeScript for **Section C** of the Recruiterflow Take-Home Assignment.

---

## 1. How to Run It & Status

### Prerequisites
- Node.js (v18 or newer)
- npm (v9+)

### Installation & Development
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Typechecks and compiles production assets into `dist/`.
- `npm run typecheck`: Runs strict TypeScript checking (`tsc --noEmit`) with zero errors.
- `npm run lint`: Runs ESLint with `typescript-eslint`.
- `npm run test`: Executes unit and integration test suite using Vitest.

### Completion Status
Everything requested in the brief is **100% complete and verified**:
- Navbar with visibly marked links (`/` and `/expenses/new`) and custom 404 page.
- Member balances ("gets back ₹X", "owes ₹X", "settled up") mathematically guaranteed to sum to ₹0.00.
- Category filter and live expense totals.
- Confirmation modal before deleting expenses with immediate balance re-calculation.
- Add Expense form with all validation edge cases and 3 split strategies (Equal, Exact, Percent).
- LocalStorage persistence with graceful fallback to `sample-data.json`.
- Zero-loss paisa distribution rule (extra remainder paise distributed deterministically to first members).
- Indian numbering format (`₹1,00,000.00`) across all currency outputs.
- Comprehensive test coverage with 23 passing tests.

---

## 2. Three Architecture Decisions & Why

### Decision 1: Pure Logic Isolated Outside React Components
All money parsing, paisa arithmetic, zero-loss split calculations, and form validation reside in pure TypeScript modules (`src/logic/`). Components only handle DOM rendering and event dispatches. This decoupling allows thorough, lightning-fast testing with Vitest without mounting React components and guarantees business logic cannot be accidentally coupled to UI lifecycle.

### Decision 2: Redux Toolkit for Shared State & LocalStorage Synchronization
Global shared state (`members`, `expenses`, `selectedCategory`, `notification`) lives in Redux Toolkit. LocalStorage reads occur during initial state hydration with an automated fallback to canonical sample data. When mutations occur (`addExpense`, `deleteExpense`), synchronous persistence triggers within the reducer. Form input state remains component-local until submission to avoid unnecessary global re-renders.

### Decision 3: Deterministic Zero-Loss Paisa Distribution & Paise-Integer Domain
All financial values are stored internally as integer paise (e.g. `125050` = `₹1,250.50`), preventing JavaScript floating-point inaccuracies. For equal splits (e.g. ₹100 split 3 ways: 10000 paise / 3 = 3333 with 1 remainder paisa), our explicit rule awards the remainder paisa to the first `remainder` members in array order (`Aarav` gets 3334 paise, others 3333). This ensures balances strictly sum to ₹0.00 across the group.

---

## 3. What I Would Improve With Another Day
1. **Interactive Multi-Currency Support**: Add live currency conversion for international trips with custom exchange rates.
2. **Receipt Image Attachment**: Support uploading receipt images stored in IndexedDB or object storage.
3. **Export to CSV / PDF**: Allow one-click export of expense summaries and debt settlement instructions.

---

## 4. Note on AI Usage
AI was used to brainstorm edge-case test vectors for fractional percentage distributions and rapidly verify the regex for Indian numbering formats. All domain logic, Redux slices, pure validation functions, and CSS styling were designed, implemented, and tested by me.
