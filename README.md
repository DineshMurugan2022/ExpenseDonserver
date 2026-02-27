# Expense Tracker - Backend

Robust API server for the Expense Tracker application, built with Node.js and Supabase.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Security**: JWT Authentication, Bcrypt.js
- **Logging**: Morgan

## 🚀 Local Setup

### 1. Installation
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server` directory and fill in your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/updateprofile` - Update user profile

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add a new transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Features
- Support for **Budgets**, **Recurring Transactions**, and **Debt Tracking**.
