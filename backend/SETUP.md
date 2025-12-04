# TeleCore Backend Setup Guide

## Problem Fixed: Authentication with Database Users

### The Issue
The application had a critical authentication bug:
- Database schema seeded test users with **dummy password hashes** (`$2b$10$dummy.hash.for.demo`)
- These dummy hashes don't work with bcrypt verification
- Only hardcoded credentials in `App.jsx` would "work" (by bypassing the API)
- All other database users would fail authentication at the backend

### Root Cause
1. **database_schema.sql**: Inserted users with invalid/dummy password hashes
2. **Backend auth**: Tried to verify passwords using bcrypt.compare() which failed
3. **No auto-setup**: The seed script wasn't running automatically, leaving dummy hashes in place

### Solution Implemented
1. **Removed dummy hashes** from database_schema.sql
2. **Updated seed-data.js** to:
   - Create users with proper bcrypt-hashed passwords
   - Create customer records for all test users automatically
   - Display all available credentials after seeding
3. **Fixed customer creation** so all users can place orders immediately

---

## Initial Setup Instructions

### 1. Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=telecore_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=3001
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
NODE_ENV=development
```

### 2. Run Full Setup
```bash
cd backend
npm run setup
```

This command will:
- ✅ Run migrations (create database + tables)
- ✅ Run seed script (create users + customers with proper passwords)
- ✅ Display all test user credentials

### 3. Start the Backend
```bash
npm start
# or for development with auto-reload:
npm run dev
```

---

## Available Test User Credentials

After running `npm run setup`, use these credentials to login:

### Admin Account
- **Email**: admin@telecore.com
- **Password**: Admin@123
- **Role**: Admin

### Internal Account
- **Email**: internal@telecore.com
- **Password**: Internal@123
- **Role**: Internal

### Client Accounts
| Email | Password | Company |
|-------|----------|---------|
| sarah@telecore.com | Sarah@123 | Johnson Enterprises |
| john.smith@email.com | John@123 | Smith Consulting |
| mike.chen@email.com | Mike@123 | Chen Tech Solutions |
| emma.davis@email.com | Emma@123 | Davis Industries |

---

## Authentication Flow

### How It Works Now

1. **User enters credentials** in frontend login form
2. **Frontend calls** `api.auth.login()` with email + password
3. **Backend route** `/api/auth/login`:
   - Queries database for user by email
   - Uses bcrypt.compare() to verify password
   - If valid, returns JWT token + user info
4. **Frontend stores** token in sessionStorage
5. **All subsequent requests** include Bearer token in Authorization header
6. **Backend middleware** authenticates token on protected routes

### Password Hashing
- All test passwords are hashed using **bcrypt** with 10 salt rounds
- Each password hash is unique (bcrypt includes salt)
- Hashes cannot be reversed; they're cryptographically secure

---

## Troubleshooting

### "Invalid email or password" for database users

**Problem**: You can't login with any user credentials

**Solution**: Run the seed script to regenerate users with proper hashes:
```bash
npm run seed
```

### "Cannot INSERT users - email already exists"

**Solution**: Drop and recreate the database:
```bash
npm run migrate  # This drops and recreates the database
npm run seed     # This seeds proper data
```

### "Customer not found" error when placing orders

**Problem**: User account exists but no customer record

**Solution**: This is now automatically created by the seed script. If you manually added users, run:
```bash
npm run seed
```

---

## Manual User Management

### To create a new user manually with proper password:

```javascript
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function createUser(email, password, firstName, lastName, role) {
  const hash = await bcrypt.hash(password, 10);
  
  const result = await query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role, status)
    VALUES ($1, $2, $3, $4, $5, 'Active')
    RETURNING id, email, role
  `, [email, hash, firstName, lastName, role]);
  
  return result.rows[0];
}

// Then run:
// createUser('newuser@telecore.com', 'NewUser@123', 'New', 'User', 'Client');
```

### To create a customer record:

```javascript
const { query } = require('./config/database');

async function createCustomer(userId, companyName, email) {
  const result = await query(`
    INSERT INTO customers (user_id, company_name, contact_person, email, status)
    VALUES ($1, $2, $2, $3, 'Active')
    RETURNING id, company_name
  `, [userId, companyName, email]);
  
  return result.rows[0];
}
```

---

## Files Modified

- ✅ `backend/database_schema.sql` - Removed dummy user inserts
- ✅ `backend/seed-data.js` - Enhanced to create users + customers with proper hashes
- ✅ `backend/update-password-hashes.js` - Created for manual password updates (if needed)
- ✅ `backend/SETUP.md` - This guide

---

## Next Steps

1. Run `npm run setup` to initialize the database
2. Start the frontend and backend
3. Login with test credentials
4. All users should now authenticate correctly
5. All users can place orders (customer records auto-created)

For questions, check the auth flow in:
- Frontend: `src/services/api.js` (apiCall function)
- Backend: `backend/routes/auth.js` (login endpoint)
- Backend: `backend/middleware/auth.js` (token verification)
