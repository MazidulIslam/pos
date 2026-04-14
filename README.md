# Modern POS System

A high-performance, containerized Point of Sale (POS) application featuring a robust Role-Based Access Control (RBAC) system, dynamic menu management, and a modern React-based frontend.

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

## 🛠 Manual Installation (Non-Docker)

If you prefer to run the components directly on your host machine.

### Prerequisites
- [Node.js](https://nodejs.org/en) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (v14+) running locally.

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment (`.env`):
   ```env
   PORT=5000
   DB_NAME=pos_db
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   JWT_SECRET=your_secure_secret_key
   ```
4. **Seed the Database**:
   ```bash
   npm run setup
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Credentials

After running `npm run setup` (or once Docker starts for the first time), the following initial account is created:

- **Email**: `admin@example.com`
- **Password**: `admin123`

> [!CAUTION]
> **Security Warning**: For production environments, please change these credentials immediately after your first login via the **Account Settings** page.

---

## 🌟 Key Features

- **Advanced RBAC System**: Granular permission management where permissions are tied to menus and actions.
- **Recursive Hierarchical Sidebar**: Support for multi-level navigation (Parent > Child > Grandchild). Folders automatically inject "Overview" links for parent pages.
- **Intelligent Breadcrumbs**: Automated, clickable navigation trails that update dynamically based on your location in the system.
- **Hybrid Search Architecture**: A high-performance "Local-First" search matching strategy with automatic server-side fallback for large datasets.
- **Optimized Server-side Pagination**: Standardized pagination (default 5 records) optimized for data-rich modules like Users, Roles, and Menus.
- **Dynamic Menus**: Sidebars and navigation are driven entirely by database configurations, allowing for real-time UI updates.
- **Direct Permission Overrides**: Assign specific permissions directly to a user, bypassing role standards for fine-grained control.
- **Soft-Delete Management**: System-wide support for `isActive` flags. Inactive records are hidden but discoverable/restorable by Super Admins.
- **Super Admin Protection**: Guardrails against deleting core roles or locking out administrative accounts.
- **Database Backups**: Integrated tools to generate system exports directly from the settings panel.

---

## 🛠 System Guidelines

### Managing User Status
- **Deactivating Users**: Setting a user to `Inactive` in their profile modal will immediately prevent them from logging in. This is a reversible soft-delete.
- **Restoring Access**: Simply navigate to the Users management page and toggle the `Active` switch in the user's edit modal.

### Super Admin Role
- The **Super Admin** role is locked. It possesses all system permissions by default.
- Only an existing Super Admin can assign the Super Admin role to another user. Standard admins cannot escalate their own privileges or those of others to this level.

---

## 🏗 Tech Stack

- **Frontend**: Next.js 15, Material UI (MUI), Lucide Icons, Axios.
- **Backend**: Express.js, Sequelize ORM, JWT, Bcrypt.
- **Database**: PostgreSQL 15.
- **Infrastructure**: Docker & Docker Compose.

---

## 📦 Project Structure

```text
├── frontend/           # Next.js Application
│   ├── src/app/        # Dashboard & Pages
│   └── src/components/ # Reusable UI Components
├── backend/            # Express Server
│   ├── src/models/     # Sequelize Database Models
│   ├── src/controllers/# Business Logic
│   └── src/scripts/    # Seeding & Core Setup
└── docker-compose.yml  # Orchestration Config
```
