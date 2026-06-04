# ⚡ VelocityAuth Core

> "Keeping hackers unemployed, one refresh token at a time."

A production-grade, highly modular TypeScript authentication and authorization ecosystem built using clean architecture patterns. Featuring stateless token lifecycles, cryptographic session tracking, and real-time fine-grained Role-Based Access Control (RBAC).

---

## 🛠️ The Tech Stack

* **Runtime Environment:** Node.js (v22+) with native ES Modules (`"type": "module"`)
* **Language:** TypeScript (Strict Mode)
* **Framework:** Express.js
* **Database Engine:** PostgreSQL
* **ORM:** Prisma v7 (Connection Pool Optimized)
* **Security & Crypto:** JSON Web Tokens (`jsonwebtoken`), `bcrypt` (12 Salt Rounds), Native `crypto`
* **Validation Layer:** Zod
* **Development Tools:** `tsx`, TypeScript Compiler (`tsc`)

---

## 📐 Structural Architecture

This system rejects sprawling, monolithic design in favor of a **Layered Domain-Driven Architecture**. Every module (`auth`, `admin`) is strictly isolated and divided into four decoupled boundaries:

```text
Incoming Request
       │
       ▼
[ Routing Layer ] ──────► Intercepts endpoints and applies Zod validation masks.
       │
       ▼
[ Controller Layer ] ───► Handles HTTP protocols, reads cookies, extracts payloads.
       │
       ▼
[ Service Layer ] ──────► Brain of the domain. Executes calculations and business rules.
       │
       ▼
[ Repository Layer ] ───► The Warehouse. Executes clean database mutations via Prisma.
```

## 🛡️ The Global Middleware Perimeter

Before a request can touch our core domain services, it passes through a multi-tiered security defense network:

### `validate.middleware`

Halts malformed or malicious payloads at the gate using Zod validation.

### `authentication.middleware (requireAuth)`

Decrypts the HTTP Bearer Token, verifies its integrity, and extracts the user identity.

### `authorization.middleware (requirePermission)`

A higher-order guard that queries database RBAC schemas in real-time to block unauthorized access with a `403 Forbidden` flag.

### `error.middleware`

The central safety net. Intercepts failures, masks engine-level stack traces in production, and standardizes JSON error delivery.

---

## 🛣️ API Reference Manual

All endpoints are prefixed under `/api/v1`.

### 🔑 Authentication Module (`/auth`)

| Endpoint         | Method | Security Gate | Input Payload (JSON) | Description                                                                                                                                                                          |
| ---------------- | ------ | ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/auth/register` | POST   | Public        | `email, password`    | Validates credentials, runs a 12-round bcrypt salt hash, and provisions a new database profile record.                                                                               |
| `/auth/login`    | POST   | Public        | `email, password`    | Verifies credentials, initializes an active tracking database row in the Session table, and sets an httpOnly refresh cookie while returning a short-lived JSON access token.         |
| `/auth/refresh`  | POST   | Secure Cookie | None                 | Refresh Token Rotation (RTR): Automatically consumes the current session cookie, invalidates it to prevent reuse theft, spins up a fresh session layer, and issues a new token pair. |
| `/auth/logout`   | POST   | Secure Cookie | None                 | Coordinated teardown. Instantly flips the database session row to `isRevoked: true` and clears the browser's cookie container.                                                       |

---

### 👑 Administration Module (`/admin`)

| Endpoint                   | Method | Security Gate                                          | Input Payload (JSON) | Description                                                                                                                          |
| -------------------------- | ------ | ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/admin/users/assign-role` | POST   | `requireAuth + requirePermission('MANAGE_USER_ROLES')` | `userId, roleName`   | Elevated control switch. Evaluates the administrator's privileges before altering user role association keys inside the join tables. |

---

## 🔄 Core Lifecycles Under the Hood

### 1. Registration & Security Scaling

Passwords are never stored raw. The service passes inputs into an adaptive hashing loop (`2¹² = 4,096` mathematical iterations). This intentionally slows down login processing by roughly 250ms—making brute-force computing mathematically unfeasible for malicious actors.

### 2. Dual-Token Architecture & XSS Mitigation

#### Access Tokens

* Valid for 15 minutes.
* Delivered directly in the JSON data stream.
* Stored safely inside frontend memory variables where XSS scripts cannot persistently track them.

#### Refresh Tokens

* Valid for 7 days.
* Encapsulated inside an encrypted cookie stamped with `httpOnly`, `secure`, and `sameSite: strict`.
* This completely bars browser JavaScript from accessing the credentials, mitigating token-sniffing attacks.

### 3. Breach Detection Engine

If a hacker manages to hijack a refresh token cookie and attempts to present an old, rotated, or revoked token to the `/refresh` endpoint, the system automatically triggers a security exception.

It flags the entire session history associated with that user ID as compromised, instantly deleting all active connections and forcing a complete global re-authentication.

---

## 🚀 Setup & Database Genesis

### Clone the repository and install dependencies

```bash
npm install
```

### Configure your environment profile (`.env`) matching `src/config/env.config.ts`

### Push schemas and trigger the automated relational seeding script

```bash
npx prisma db push
npx prisma db seed
```

### Fire up the high-speed live reload development server

```bash
npm run dev
```
