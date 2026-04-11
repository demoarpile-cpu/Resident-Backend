# Frontend Workflow Documentation

## 🧠 Overview

This document explains how users interact with the frontend system step-by-step.

The system is based on:

* Ledger (single source of truth)
* Open item accounting (OPOS)

---

## 🔁 Main User Flow

Resident Creation
→ Monthly Charges Auto Added
→ Ledger Updated
→ Payment Added
→ Allocation Done
→ Balance Updated
→ Reminder Sent
→ Reports Generated

---

## 🏠 Dashboard Flow

1. User logs in
2. Lands on Dashboard
3. Views:

   * Outstanding balance
   * Overdue count
4. Takes action:

   * Add Resident
   * Add Payment

---

## 👤 Resident Flow

### Create Resident

1. Click "Add Resident"
2. Fill:

   * Name
   * House
   * Monthly charge
3. Save

---

### View Resident

1. Click on resident
2. Open detail page

User sees:

* Summary
* Ledger entries
* Outstanding balance

---

## 📜 Ledger Flow

1. Ledger auto-populates from backend
2. Entries include:

   * Charges
   * Payments

Rules:

* Sorted by date
* Oldest dues first

---

## 💳 Payment Flow

### Add Payment

1. Click "Add Payment"
2. Select resident
3. Enter amount

---

### Allocation Step

1. System shows open items
2. User can:

   * Auto allocate
   * Manually adjust

---

### Result

* Ledger updates
* Balance recalculated

---

## 🏦 Bank Flow (Phase 2)

1. Upload CSV
2. Transactions appear
3. System suggests match

User actions:

* Confirm match
* Assign manually

---

## 🔔 Reminder Flow

1. Go to Reminder screen
2. Filter overdue residents
3. Select users
4. Customize message
5. Click Send

---

## 📊 Report Flow

1. Open Reports
2. Select month
3. View summary
4. Export data

---

## ⚙️ Settings Flow

1. Admin opens settings
2. Manage:

   * Users
   * Houses
   * Email config

---

## 🔥 Critical Logic (Frontend Behavior)

### 1. Balance Display

Always show:
Outstanding = Charges - Payments

---

### 2. Status Calculation

* Paid → Balance = 0
* Partial → Balance > 0 (some paid)
* Overdue → Past due + balance

---

### 3. Allocation Priority

Default:
Oldest charges first

---

### 4. No Invoice Handling

Frontend must:

* NEVER show invoice UI
* ONLY show ledger entries

---

## 🚀 MVP Workflow (Phase 1)

Dashboard
→ Residents
→ Resident Detail (Ledger)
→ Add Payment
→ Update Balance

---

## 💡 UX Notes

* Keep flows short (max 2–3 steps)
* Avoid complex forms
* Show real-time feedback
* Highlight errors clearly

---

## 🧭 Navigation Structure

Dashboard
Residents
Payments
Bank (Phase 2)
Reminders
Reports
Settings

---

## ✅ Final Summary

Frontend revolves around:
👉 Resident → Ledger → Payment → Balance

Everything connects back to:
👉 Ledger (OPOS system)

---
