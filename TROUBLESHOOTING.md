# 🔧 Troubleshooting Guide

## ⚠️ Common Issues & Solutions

---

## 1. "Invalid email or password" for ALL users

### Problem
Can't login with any test user

### Possible Causes
- [ ] Database setup wasn't run
- [ ] Password hashes weren't created properly
- [ ] Backend is not running

### Solution
```bash
# 1. Stop everything (Ctrl+C)

# 2. Run setup
cd backend
npm run setup

# 3. Check output - you should see:
# ✓ Created/Updated user: admin@telecore.com
# ✓ Created/Updated user: internal@telecore.com
# ... (6 users total)

# 4. Start backend
npm start

# 5. Try login again
```

### Verify
```bash
# Check if users exist with proper hashes
psql -U postgres -d telecore_db -c "SELECT email, password_hash FROM users;"

# Should see bcrypt hashes like: $2b$10$...
# NOT: $2b$10$dummy.hash.for.demo
```

---

## 2. "Failed to place order: Internal Server Error"

### Problem
Order creation fails at backend

### Check These (In Order)

#### Step 1: Verify Backend is Running
```bash
# In backend terminal, you should see:
# TeleCore Backend server is running on port 3001
```

#### Step 2: Check Backend Error
Look at the **backend console** for error message:
```
Create order error: Error message here...
```

**Common error messages**:
- `"invalid UUID"` → product_id or country_id is not a valid UUID
- `"violates foreign key"` → customer_id doesn't exist
- `"violates not-null constraint"` → missing required field

#### Step 3: Verify Customer Record Exists
```bash
# Login to database
psql -U postgres -d telecore_db

# Check if customer exists for your user
SELECT * FROM customers WHERE email = 'your-email@example.com';

# Should return a row with customer_id
```

If no row:
```javascript
// Manually create customer (use correct user_id)
INSERT INTO customers (user_id, company_name, email, status)
VALUES ('your-user-id', 'Your Company', 'your-email@example.com', 'Active');
```

#### Step 4: Check Cart Item Data
In browser console (F12):
```javascript
// Look for this log before order is placed:
// "Sending order data:" 
// It should show: productId, countryId, totalAmount, etc.
```

If any of these are **null** or **missing**, the cart item wasn't created properly.

---

## 3. "Customer not found" Error

### Problem
When placing order: `api.customers.getMe()` fails

### Causes
- [ ] User exists but no customer record created
- [ ] Customer created with wrong user_id

### Solution

#### Option A: Auto-create Customer (Automatic)
Already implemented! When you place order, it auto-creates customer if missing.

#### Option B: Manual Creation
```bash
# 1. Get your user_id
psql -U postgres -d telecore_db
SELECT id, email, first_name FROM users WHERE email = 'sarah@telecore.com';

# Note the UUID

# 2. Create customer record
INSERT INTO customers (user_id, company_name, contact_person, email, status)
VALUES ('your-user-id-here', 'Your Company Name', 'Your Name', 'sarah@telecore.com', 'Active');

# 3. Verify
SELECT id, user_id, email FROM customers WHERE email = 'sarah@telecore.com';
```

---

## 4. Database Connection Error

### Problem
Backend won't start: `connect ECONNREFUSED 127.0.0.1:5432`

### Causes
- [ ] PostgreSQL server not running
- [ ] Wrong database credentials in `.env`
- [ ] Wrong database name in `.env`

### Solution

#### Step 1: Check PostgreSQL is Running
```bash
# macOS/Linux
sudo systemctl status postgresql

# Windows
# Check Services app or:
psql --version
```

If not running:
```bash
# Start PostgreSQL
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Open Services → PostgreSQL → Start
```

#### Step 2: Verify .env File
```bash
cat backend/.env

# Should show:
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=telecore_db
# DB_PASSWORD=your_password
# DB_PORT=5432
```

#### Step 3: Test Connection
```bash
psql -U postgres -h localhost -d telecore_db -c "SELECT 1;"

# Should return: 1
```

---

## 5. "Cannot INSERT users - email already exists"

### Problem
Running `npm run setup` fails with email conflict

### Cause
Database has partial data from previous run

### Solution
```bash
# Complete reset
cd backend
npm run migrate  # Drops and recreates database

# Then seed
npm run seed

# Verify
npm start
```

---

## 6. Order Created But Data Missing

### Problem
Order appears in database but without product_id or country_id

### Causes
- [ ] Cart item didn't include these IDs
- [ ] Product/country lookup failed

### Check
```bash
psql -U postgres -d telecore_db
SELECT id, order_number, product_id, country_id FROM orders ORDER BY created_at DESC LIMIT 1;

# If product_id or country_id is NULL → something went wrong
```

### Debug Steps
1. Check browser console (F12) when creating cart item
2. Look for logs about product/country lookup
3. Verify availableProducts has items
4. Verify countries has items

---

## 7. Frontend Can't Connect to Backend

### Problem
Frontend shows: `API Error: Failed to fetch`

### Causes
- [ ] Backend not running on port 3001
- [ ] CORS issues
- [ ] Firewall blocking port

### Check
```bash
# 1. Verify backend is running
curl http://localhost:3001/api/

# Should return: {"message":"TeleCore Backend API","version":"1.0.0"}

# 2. Check frontend .env
cat .env

# Should NOT have a backend URL (uses relative paths)

# 3. Check backend .env
cat backend/.env

# Should have proper DB settings
```

### Solution
```bash
# 1. Kill any process on 3001
lsof -i :3001  # Find process
kill -9 <PID>  # Kill it

# 2. Start fresh
cd backend
npm start
```

---

## 8. Order Placed But Status is NULL

### Problem
Order created but status is NULL or 'In Progress' is wrong

### Cause
Database schema validation issue

### Check
```bash
psql -U postgres -d telecore_db
SELECT id, order_number, status FROM orders LIMIT 1;

# Status should be: 'In Progress'
```

### Solution
Check if status was passed correctly:
```javascript
// In backend, console should show:
// Sending order data: {..., status: 'In Progress', ...}
```

---

## 9. "User not found" After Login

### Problem
Login succeeds but profile loading fails

### Causes
- [ ] JWT token invalid
- [ ] User session expired
- [ ] Missing Bearer token header

### Debug
```javascript
// In browser console
sessionStorage.getItem('authToken')
// Should return a long JWT token string

sessionStorage.getItem('isAuthenticated')
// Should return 'true'
```

### Solution
```bash
# 1. Clear session storage
# Browser → F12 → Application → Session Storage → Clear All

# 2. Logout
# Click logout in app

# 3. Login again
# Should work now
```

---

## 10. "Password verification failed" During Seed

### Problem
Running `npm run seed` fails with bcrypt error

### Causes
- [ ] Node version too old (bcrypt needs Node 10+)
- [ ] bcryptjs not installed

### Solution
```bash
# Check Node version
node --version  # Should be v12 or higher

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Try seed again
npm run seed
```

---

## 🔍 Debug Checklist

When something doesn't work, check in this order:

- [ ] Is backend running? (port 3001)
- [ ] Is PostgreSQL running?
- [ ] Did you run `npm run setup`?
- [ ] Check browser console (F12) for errors
- [ ] Check backend terminal for error logs
- [ ] Is the user logged in?
- [ ] Did you select country + product type?
- [ ] Check email/password format

---

## 📝 Useful Commands

### Check System Status
```bash
# Backend running?
curl http://localhost:3001/health

# Database available?
psql -U postgres -d telecore_db -c "SELECT COUNT(*) FROM users;"

# Users created?
psql -U postgres -d telecore_db -c "SELECT email FROM users;"

# Orders in database?
psql -U postgres -d telecore_db -c "SELECT id, order_number, status FROM orders;"
```

### Reset Everything
```bash
cd backend
npm run migrate && npm run seed
npm start
```

### View Live Logs
```bash
# Backend errors in real-time
npm run dev  # Uses nodemon for auto-restart on changes

# Frontend errors
# Open browser → F12 → Console tab
```

---

## 🆘 Still Not Working?

### Collect This Information

1. **Error message** (exact text)
2. **Browser console** (F12 → Console tab)
3. **Backend console** (terminal output)
4. **Steps to reproduce** (what exactly did you do?)
5. **Database state**:
   ```bash
   psql -U postgres -d telecore_db << EOF
   SELECT COUNT(*) as user_count FROM users;
   SELECT COUNT(*) as customer_count FROM customers;
   SELECT COUNT(*) as order_count FROM orders;
   \q
   EOF
   ```

### Then Check
- [ ] Read `QUICK_START.md` for basic setup
- [ ] Read `AUTHENTICATION_FIX_SUMMARY.md` for details
- [ ] Read `backend/SETUP.md` for setup issues
- [ ] Check email/password spelling (case-sensitive)
- [ ] Check ports (3001 for backend, 3000 for frontend)

---

## ✅ Verification Tests

Run these to verify everything works:

### Test 1: Database
```bash
psql -U postgres -d telecore_db -c "SELECT COUNT(*) FROM users WHERE email LIKE '%@telecore.com%';"
# Should return: 3 (admin + internal + sarah)
```

### Test 2: Authentication
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@telecore.com","password":"Sarah@123"}'
# Should return: {"success":true,"data":{"token":"...","user":{...}}}
```

### Test 3: Frontend Login
1. Open frontend
2. Click "Client Login" button
3. Should autofill: sarah@telecore.com / Sarah@123
4. Click Login
5. Should navigate to dashboard

### Test 4: Order Placement
1. Go to Order Numbers → New Number
2. Select USA / DID / 212 / Quantity 1
3. Click through workflow
4. Click "Place Order"
5. Should show success message

---

If all tests pass: ✅ Everything is working!
