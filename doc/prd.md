# 🧾 OPOS - Resident Billing System (FINAL PRD)

## 📌 Overview

The OPOS Resident Billing System is a lightweight accounting CRM used by a **single administrator** to manage rental properties, residents, monthly charges, payments, and bank reconciliation.

It follows **Open Item Accounting (OPOS)** principles where:
- Charges (positive) represent money owed
- Payments (negative) represent money received
- The ledger is the single source of truth

⚠️ IMPORTANT:
- No multi-user system
- No tenant login
- No invoice system
- Only Admin uses the application

---

## 🎯 Goals

- Simple and fast accounting tool
- Clear visibility of outstanding balances
- Minimal manual work using smart matching
- Accurate charge-based payment tracking

---

## 🧠 Core Principles (LOCKED)

1. Charges = Positive entries
2. Payments = Negative entries
3. No invoice abstraction — only ledger
4. Allocation = Charge-specific (not generic)
5. Balance = Sum(Charges - Payments)

---

## 🧩 Core Modules

---

### 1. Dashboard

- Total Outstanding
- Monthly Collections
- Overdue Residents
- Quick Actions (Unmatched transactions, pending reminders)

---

### 2. Houses

- Create and manage units (A1, A2, B1…)
- Assign residents
- Track occupancy status

---

### 3. Residents

- List all residents
- Resident Detail View:
  - Profile
  - Ledger (charges + payments)
  - Credit balance

---

### 4. Monthly Charges (CRITICAL MODULE)

Each resident has recurring charge definitions:

#### Charge Definition:
- Type (Rent / Care Fee / Maintenance)
- Amount
- Start Date
- Frequency (Monthly)

#### System Behavior:
- Auto-generate charges every month
- Example:
  - April 2026 Rent → €1200
  - May 2026 Rent → €1200

---

### 5. Ledger (CORE SYSTEM)

Each resident has a month-grouped ledger:

Example:

April 2026:
- Rent → €1200 (PAID)
- Care Fee → €300 (UNPAID)
- Payment → €1200

#### Status:
- UNPAID
- PARTIAL
- PAID

---

### 6. Payments

#### Two Sources:

1. Manual Entry (Record Payment)
2. Bank Import (CSV)

#### Rules:

- Payment MUST be assigned to:
  → Resident + Specific Charge

- Behavior:
  - Full → PAID
  - Partial → PARTIAL
  - Excess → Credit Balance

---

### 7. Bank Transactions (SMART MATCHING)

- Import CSV bank statements
- Show raw transactions

#### Transaction States:
- MATCHED
- UNMATCHED
- SYSTEM (bank fees)

#### Matching Logic:

- Name detection
- House detection (A1, A2)
- Amount matching
- Past mapping (future feature)

#### Actions:
- Auto Match
- Suggest (Confirm / Change)
- Manual Select

---

### 8. Reminders

- Detect overdue charges
- Send reminders (email / print)
- Template support:
  - {Name}
  - {Amount}
- Logo customization

---

### 9. Reports

- Resident-wise ledger
- Monthly totals
- Outstanding balances
- Export (CSV / PDF)

---

## 🔄 System Flow (VERY IMPORTANT)

1. Create House
2. Add Resident
3. Define Monthly Charges
4. System auto-generates charges
5. Payment received (manual / bank)
6. Match transaction
7. Allocate payment to charge
8. Update ledger
9. Track outstanding
10. Send reminder if unpaid

---

## ⚙️ Technical Constraints

- Frontend-first system (React + localStorage)
- Later upgrade → Node.js + DB
- Fast UI (no heavy backend dependency initially)

---

## 🚫 What NOT to Build

- No role-based access (Admin/Manager/Staff)
- No multi-user system
- No tenant login portal
- No complex invoice engine
- No unnecessary enterprise features

---

## 🚀 Future Enhancements (Phase 2)

- PDF import for invoices
- Smart payer mapping (Anna → Marie)
- Bank API integration
- Automation workflows

---

## 💡 Final Goal

Build a system that:

- Clearly shows what each resident owes
- Tracks payments accurately
- Minimizes manual work
- Provides a clean and reliable accounting experience