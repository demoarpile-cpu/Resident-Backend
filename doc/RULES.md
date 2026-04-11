# ⚙️ System Rules - OPOS Resident Billing System

## 📌 Overview

This document defines how the system should behave and how development should be implemented.

Goal:
- Maintain correct accounting flow
- Ensure clean architecture
- Keep system simple and reliable

---

## 🧠 System Structure

This is a single-admin system.

The system manages:
- Houses
- Residents
- Monthly Charges
- Payments
- Bank Transactions

All features must align with this structure.

---

## 🏗️ Architecture Flow

The system follows a layered architecture:

Route → Controller → Service → Database

### Responsibilities:

- Routes:
  - Define API endpoints

- Controllers:
  - Handle request and response
  - Call services

- Services:
  - Contain all business logic
  - Manage system behavior

- Database (Prisma):
  - Store and retrieve data

---

## 🔄 Core System Flow

The system must follow this sequence:

1. Create House  
2. Add Resident  
3. Define Monthly Charges  
4. Generate Charges (monthly)  
5. Receive Payment  
6. Match Bank Transaction  
7. Create Payment  
8. Allocate Payment  
9. Update Charges  
10. Update Ledger  

This flow defines the system behavior.

---

## 💸 Payment Flow

Payments are handled in a structured way:

1. Payment is created for a resident  
2. Payment is allocated to one or more charges  
3. Each allocation updates the respective charge  

---

## 🔗 Allocation Logic

Allocation connects payments to charges.

- A payment can be distributed across multiple charges  
- Each allocation defines how much amount is applied  
- Total allocation should align with payment amount  

---

## 📅 Charge Logic

Charges are generated based on recurring definitions:

- Each resident has charge definitions  
- Charges are created monthly  
- Each charge belongs to a specific month  

---

## 📊 Charge Status Logic

Each charge updates automatically based on payment:

- No payment → UNPAID  
- Partial payment → PARTIAL  
- Full payment → PAID  

---

## 💰 Credit Handling

If payment exceeds required amount:

- Extra amount is stored as resident credit  
- Credit can be used in future allocations  

---

## 🏦 Bank Transaction Flow

Bank transactions act as input data:

1. Import transaction  
2. Identify resident  
3. Confirm match  
4. Create payment  
5. Allocate payment  

---

## 🔌 API Behavior

APIs should follow defined structure:

- Each module has clear endpoints  
- APIs align with system flow  
- Data moves consistently across modules  

---

## 🧩 Database Behavior

Database reflects system flow:

- Residents are linked to houses  
- Charges are linked to residents  
- Payments are linked to residents  
- Allocations connect payments to charges  

---

## 🔄 Development Approach

Development should follow:

- Modular structure  
- Reusable services  
- Clear separation of logic  
- Consistent data flow  

---

## ⚙️ Code Guidelines

- Use async/await  
- Keep functions small and focused  
- Use meaningful naming  
- Maintain clean structure  

---

## 🎯 System Goal

The system should:

- Clearly track what each resident owes  
- Track what they have paid  
- Map payments accurately to charges  
- Maintain a clean and reliable accounting flow  