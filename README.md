# ⚙️ M.Y.F. - Project Management API

<p align="left">
  <a href="https://dev-flow-back.onrender.com/api/docs" target="_blank">
    <img src="https://img.shields.io/badge/Swagger_API-📖-green?style=for-the-badge&logo=swagger" alt="Swagger">
  </a>
  <a href="https://manage-your-flow.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-🚀-FF5722?style=for-the-badge" alt="Frontend">
  </a>
    <a href="https://github.com/rahilevych/manage-your-flow" target="_blank">
    <img src="https://img.shields.io/badge/Frontend_Repository-⚙️-white?style=for-the-badge" alt="Frontend Repo">
  </a>
</p>

> [!NOTE]
> The API is hosted on a free Render tier. Initial requests may experience a delay of up to 1 minute due to "sleep mode". Please wait a little bit for the server to wake up.

A robust **NestJS** backend for the Manage Your Flow project management system. This API handles complex relationships between users, projects, and tasks while ensuring secure data access.

---

## 🎯 Project Goals
* Implementation of a secure **RBAC (Role-Based Access Control)** system
* Management of complex relational data using **Prisma ORM**
* Secure session handling with **JWT (Access & Refresh tokens)**
* Development of a scalable, modular architecture following NestJS best practices

## 🛠 Tech Stack
* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Security:** Passport.js, JWT Strategy, argon2
* **Documentation:** Swagger 



## 🏗 Modular Structure (`src/`)
- `auth/`: Login, registration, and session management
- `token/`: Logic for JWT generation and refresh token rotation
- `users/`: User profile management and data retrieval
- `projects/`: Project CRUD logic
- `members/`: Ownership logic
- `tasks/`: Task management 
- `database/`: Centralized Prisma Service

## 🔐 Security Features
1. **JWT Dual-Token Strategy:** Short-lived access tokens and persistent refresh tokens.
2. **Refresh Token Rotation:** Prevents replay attacks by invalidating old refresh tokens upon new issuance.
3. **Password Hashing:** Using `argon` 


## 🛣 API Routes Overview

*Detailed documentation is available via [Swagger UI](https://dev-flow-back.onrender.com/api/docs).*

## 🚀 Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="secret"
FRONTEND_URL="[https://manage-your-flow.vercel.app](https://manage-your-flow.vercel.app)"
PORT=3000
