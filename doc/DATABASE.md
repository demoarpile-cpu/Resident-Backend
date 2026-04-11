# 🧠 Database Design - OPOS Resident Billing System

## 📌 Overview

This database is designed for a single-admin OPOS (Open Item Accounting) system.

System manages:
- Houses (units like A1, A2)
- Residents (tenants)
- Monthly Charges
- Payments
- Bank Transactions

IMPORTANT:
- No users / roles system
- No invoice system
- Only Admin uses this system

---

## 🏗️ Core Accounting Logic

- Charges = money owed (positive)
- Payments = money received (negative)
- Balance = Charges - Payments
- Ledger = Charges + Payments

---

## 🧩 Prisma Models

---

### House

model House {
  id        String   @id @default(uuid())
  name      String   @unique
  type      String?

  residents Resident[]

  createdAt DateTime @default(now())
}

---

### Resident

model Resident {
  id            String   @id @default(uuid())
  name          String
  houseId       String
  house         House    @relation(fields: [houseId], references: [id])

  startDate     DateTime
  creditBalance Float    @default(0)

  chargeDefs    ChargeDefinition[]
  charges       Charge[]
  payments      Payment[]

  createdAt     DateTime @default(now())
}

---

### ChargeDefinition

model ChargeDefinition {
  id         String   @id @default(uuid())
  residentId String
  resident   Resident @relation(fields: [residentId], references: [id])

  type       String   // Rent, Care Fee
  amount     Float
  startDate  DateTime

  createdAt  DateTime @default(now())
}

---

### Charge (Monthly Entry)

model Charge {
  id         String   @id @default(uuid())
  residentId String
  resident   Resident @relation(fields: [residentId], references: [id])

  type       String
  amount     Float
  month      String   // YYYY-MM

  status     String   @default("UNPAID")
  paidAmount Float    @default(0)

  allocations PaymentAllocation[]

  createdAt  DateTime @default(now())

  @@unique([residentId, type, month])
}

---

### Payment

model Payment {
  id         String   @id @default(uuid())
  residentId String
  resident   Resident @relation(fields: [residentId], references: [id])

  amount     Float
  date       DateTime
  method     String

  allocations PaymentAllocation[]

  createdAt  DateTime @default(now())
}

---

### PaymentAllocation (CORE)

model PaymentAllocation {
  id        String   @id @default(uuid())

  paymentId String
  payment   Payment  @relation(fields: [paymentId], references: [id])

  chargeId  String
  charge    Charge   @relation(fields: [chargeId], references: [id])

  amount    Float

  createdAt DateTime @default(now())
}

---

### BankTransaction

model BankTransaction {
  id          String   @id @default(uuid())

  description String
  amount      Float
  date        DateTime

  status      String   @default("UNMATCHED")
  // MATCHED | UNMATCHED | SYSTEM

  createdAt   DateTime @default(now())
}

---

## 🔄 Relationships

House → Resident → ChargeDefinition → Charge → Payment → PaymentAllocation

---

## ⚙️ Business Rules

1. Charges are generated monthly from ChargeDefinition

2. Each charge is unique per:
   (residentId + type + month)

3. Payments:
   - belong to a resident
   - can be split across multiple charges

4. Allocation:
   - maps payment → charge
   - total allocation ≤ payment amount

5. Status Logic:
   - paidAmount = 0 → UNPAID
   - paidAmount < amount → PARTIAL
   - paidAmount ≥ amount → PAID

6. Extra Payment:
   → goes to resident.creditBalance

7. Bank Transactions:
   - raw data only
   - do NOT update ledger directly
   - must be matched first

---

## 🚫 Not Included

- Users
- Roles
- Permissions
- Invoice system

---

## 💡 Final Goal

The database must:
- Track what each resident owes
- Track what they paid
- Map payments correctly
- Keep system simple and accurate