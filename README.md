# ProntoStack - Premium RBAC SaaS Template

A high-performance, containerized Point of Sale (POS) application featuring a robust Role-Based Access Control (RBAC) system, multi-tenant isolation, and a secure software activation engine.

## 🚀 Quick Start (Docker)

The fastest and most reliable way to run the entire system is using Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/pos.git
   cd pos
   ```
2. **Start the containers**:
   ```bash
   docker-compose up --build
   ```
3. **Access the Application**:
   - **Frontend**: [http://localhost:3001](http://localhost:3001)
   - **Backend API**: [http://localhost:5050/api](http://localhost:5050/api)

---

## 🛡️ Software Activation

ProntoStack features a **Hardened Licensing Engine**. Upon first login, you will see a "System Activation Required" banner. Core features are locked until a valid key is provided.

### Generating a Key
We provide a standalone utility to generate unique keys. 

> [!IMPORTANT]
> **Security Warning**: `keygen.js` is a **Private Developer Tool**. It contains the secret salt used to sign keys. **NEVER ship this file to your buyers.** Keep it on your local machine to generate keys for them manually.

Run this from the project root:
```bash
# Generate a unique key for a buyer
node keygen.js "Buyer_Name"
```

### Activating
1. Log in with the default admin credentials.
2. Navigate to **Settings > System License**.
3. Enter your generated key to unlock the full platform.

---

## 👥 Multi-Tenant Onboarding Flow

ProntoStack has transitioned to a secure **Admin-Led Workspace model**:

1. **Self-Registration**: New users can register their accounts freely. This creates a "System Identity" with no initial access.
2. **Admin Assignment**: An existing **Platform Admin** (Super Admin) must log in, view the new users, and manually assign them to one or more **Organizations** (Workspaces) with specific roles.
3. **Workspace Isolation**: Users only see data and menus for the organizations they have been explicitly invited to.

---

## 🔑 Default Credentials

After running the initial setup, the following master account is created:

- **Email**: `admin@example.com`
- **Password**: `admin123`

> [!CAUTION]
> **Security Warning**: For production environments, please change these credentials immediately after your first login via the **Account Settings** page.

---

## 🛠 Manual Installation (Non-Docker)

If you prefer to run the components directly on your host machine.

### Prerequisites
- [Node.js](https://nodejs.org/en) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v14+) running locally.

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure Environment (`.env`):
   ```env
   JWT_SECRET=your_secure_secret_key
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
4. **Seed the Database**:
   ```bash
   npm run setup
   ```
5. Start the server: `npm run dev`

---

## 🌟 Key Features

- **Layered RBAC Security**: Merged permission engine that combines **Platform Roles** (Saas-wide) and **Workspace Roles** (Tenant-specific).
- **Defense in Depth**: Licensing protection is "entangled" with core business logic. Removing the UI guard alone will not unlock the system.
- **Recursive Hierarchical Sidebar**: Support for multi-level navigation driven entirely by the database.
- **Hybrid Search Architecture**: High-performance local search with automatic server-side fallback.
- **Direct Permission Overrides**: Bypass role standards for fine-grained user control.
- **Soft-Delete Management**: System-wide support for `isActive` flags to hide but preserve data.

---

## 🏗 Tech Stack

- **Frontend**: Next.js 15, Material UI (MUI), Lucide Icons.
- **Backend**: Express.js, Sequelize ORM, JWT, Bcrypt.
- **Database**: PostgreSQL 15.
- **Protection**: HMAC-SHA256 Cryptographic Licensing.

---

## 📦 Project Structure

```text
├── frontend/           # Next.js Application
├── backend/            # Express Server
├── docker-compose.yml  # Orchestration Config
└── keygen.js           # License Generation Tool
```
