# 🧾 OPOS Resident Billing System - Wireframe (FINAL)

## 📌 Overview

This UI is designed for a **single-admin accounting system**.

Focus:
- Ledger-based accounting (OPOS)
- Monthly charge tracking
- Payment allocation
- Clear outstanding visibility

⚠️ No invoice system  
⚠️ No multi-user system  

---

# 🧭 Global Layout

--------------------------------------------------
| Sidebar        | Topbar                        |
|----------------|------------------------------|
| Dashboard      | Page Title                  |
| Residents      |------------------------------|
| Bank           | Main Content Area           |
| Payments       |                              |
| Reminders      |                              |
| Reports        |                              |
| Settings       |                              |
--------------------------------------------------

---

# 🏠 Dashboard

--------------------------------------------------
| Dashboard                                      |
--------------------------------------------------

[Card] Total Outstanding  
[Card] Monthly Received  
[Card] Overdue Residents  

--------------------------------------------------

[Chart: Monthly Charges vs Payments]

--------------------------------------------------

[Recent Activity]
- Alice paid €1200
- Bob charged €1500

--------------------------------------------------

[Quick Actions]
[+ Add Resident]   [+ Record Payment]

---

# 👤 Residents List

--------------------------------------------------
| Residents                          [+ Add]      |
--------------------------------------------------

[Search 🔍]   [Filter: House ▼]

--------------------------------------------------
| Name | House | Monthly | Balance | Status | ⋮ |
--------------------------------------------------
| Alice| A1    | 1200    | 200     | Partial|   |
--------------------------------------------------

[Pagination]

---

# 📄 Resident Detail (CORE SCREEN 🔥)

--------------------------------------------------
| ← Back | Resident Name                         |
--------------------------------------------------

[Profile]
Name | House | Start Date

--------------------------------------------------

[Summary]
Total Charged | Total Paid | Outstanding

--------------------------------------------------

[Tabs]
[Ledger] [Payments]

---

## 📊 Ledger (MAIN SYSTEM)

### Month Grouping

#### April 2026

| Date | Type | Item       | Amount | Paid | Balance | Status |
----------------------------------------------------------------
| 01   | Charge | Rent     | 1200   | 1200 | 0       | Paid   |
| 01   | Charge | Care Fee | 300    | 0    | 300     | Unpaid |
| 05   | Payment | Bank    | 1200   | -    | -       | -      |

---

## 🔘 Actions

[+ Record Payment]   [Send Reminder]

---

# 💳 Record Payment (IMPORTANT)

--------------------------------------------------
| Record Payment                                 |
--------------------------------------------------

Resident: [Auto Selected]  
Amount:   [Input]  
Date:     [Date Picker]  
Method:   [Cash / Bank]

--------------------------------------------------

## 🔗 Allocation Section

| Select | Charge | Month | Due | Allocate |
-----------------------------------------------
| ☑      | Rent   | Apr   | 1200| 1200     |
| ☑      | Fee    | Apr   | 300 | 0        |

-----------------------------------------------
Remaining: €0

---

[Cancel]                 [Save Payment]

---

# 🏦 Bank Transactions

--------------------------------------------------
| Bank Transactions                             |
--------------------------------------------------

[Upload CSV]

--------------------------------------------------
| Date | Description | Amount | Status |
--------------------------------------------------
|      |             |        |        |

--------------------------------------------------

## Matching Panel

Transaction Details  
Suggested Resident  

[Confirm Match]   [Change Resident]

👉 After confirm:
→ Payment create  
→ Allocation screen open  

---

# 💰 Payments (Optional Page)

--------------------------------------------------
| Payments                                      |
--------------------------------------------------

| Date | Resident | Amount | Method |
-------------------------------------
|      |          |        |        |

---

# 🔔 Reminders

--------------------------------------------------
| Reminders                                     |
--------------------------------------------------

[Filter: Overdue]

--------------------------------------------------
| Name | Balance | Action |
--------------------------------
|      |         | Send   |

---

[Message Template]

"Dear {Name}, your outstanding balance is {Amount}"

---

[Send Reminder]

---

# 📊 Reports

--------------------------------------------------
| Reports                                       |
--------------------------------------------------

[Select Month ▼]

--------------------------------------------------

[Cards]
Total Charged  
Total Received  
Outstanding  

---

[Chart]

---

[Export CSV]

---

# ⚙️ Settings

--------------------------------------------------
| Settings                                      |
--------------------------------------------------

[Tabs]

- Houses
- Email Config
- Integrations

❌ No Users / Roles

---

# 🧠 UX Rules

- Always show Outstanding clearly  
- Ledger = source of truth  
- Keep actions within 1–2 clicks  
- Use clear status:
  - Paid
  - Partial
  - Unpaid  

---

# 🔄 Core Flow

Dashboard  
→ Residents  
→ Resident Detail (Ledger)  
→ Record Payment  
→ Allocation  
→ Ledger Update  
→ Reminder  

---

# 🚀 Final Goal

System should:

- Show what each resident owes  
- Track payments accurately  
- Map payments to charges  
- Maintain simple accounting flow  