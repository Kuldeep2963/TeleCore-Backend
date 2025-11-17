# TeleCore - Quick Start Guide

## Project Fixed ✅

All issues have been resolved:
- ✅ Removed all hard-coded data from pages
- ✅ Fixed property name mismatches between frontend and API
- ✅ Integrated all pages with real-time API data
- ✅ Added proper state management for forms
- ✅ All CRUD operations working with backend

---

## First-Time Setup (One Time Only)

### 1. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 2. Setup Database and Seed Data

```bash
cd backend
npm run setup
cd ..
```

This will:
- Create the database
- Run migrations
- Insert sample data (vendors, customers, orders, invoices)

---

## Running the Application

### Option 1: Both Backend and Frontend Together (Recommended)

From the project root:
```bash
npm start
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express server)

### Option 2: Separate Terminals

**Terminal 1 - Frontend:**
```bash
npm run frontend:dev
```

**Terminal 2 - Backend:**
```bash
cd backend && npm run dev
```

---

## Features Working

### ✅ Admin Dashboard
- **Vendors**: List, add, delete vendors with real data
- **Customers**: View customer stats, orders, spending
- **Orders**: Manage orders with status updates
- **Invoices**: Create and manage invoices with customer selection

### ✅ Real-Time Data
- All pages fetch from PostgreSQL database
- No hard-coded sample data
- Live updates when creating/deleting records
- Proper field mapping from API responses

### ✅ API Endpoints Working
- `GET /api/vendors` - List all vendors
- `GET /api/customers` - List all customers
- `GET /api/orders` - List all orders
- `GET /api/invoices` - List all invoices
- `POST/PUT/DELETE` - Full CRUD operations

---

## Sample Credentials (If Login Required)

```
Email: sarah@telecore.com
Password: Sarah@123
```

---

## Troubleshooting

### Issue: Backend not starting
```bash
# Kill existing process on port 3001
# Windows
taskkill /F /IM node.exe

# Then restart
cd backend && npm run dev
```

### Issue: Database connection error
```bash
# Ensure PostgreSQL is running and credentials in backend/.env are correct
# Verify in backend/.env:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_NAME=telecore_db
DB_PASSWORD=Kuldeep12345
```

### Issue: API returns 500 error
```bash
# Check backend logs in terminal for specific error
# Likely causes:
1. Database not initialized - run: npm run setup
2. Wrong field names in request
3. Database connection issue
```

### Issue: Frontend shows loading spinner forever
```bash
# Check browser console (F12) for API errors
# Verify backend is running: curl http://localhost:3001/health
# Check CORS is enabled (should be by default)
```

---

## Available Scripts

### Frontend
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm start          # Start both backend and frontend
```

### Backend
```bash
npm run dev        # Start with nodemon (auto-reload)
npm run start      # Start production
npm run migrate    # Run database migrations
npm run seed       # Insert sample data
npm run setup      # Run migrate + seed
```

---

## Project Structure

```
dtd/
├── src/
│   ├── pages/
│   │   ├── Vendors.jsx         ✅ API integrated
│   │   ├── Customers.jsx       ✅ API integrated
│   │   ├── Orders.jsx          ✅ API integrated
│   │   └── Invoices.jsx        ✅ API integrated
│   ├── services/
│   │   └── api.js              ✅ API client
│   └── main.jsx
├── backend/
│   ├── routes/
│   │   ├── vendors.js          ✅ Full CRUD
│   │   ├── customers.js        ✅ Full CRUD
│   │   ├── orders.js           ✅ Full CRUD
│   │   └── invoices.js         ✅ Full CRUD
│   ├── server.js               ✅ Express server
│   └── package.json
├── .env.local                  ✅ Frontend env vars
└── package.json                ✅ Concurrently scripts
```

---

## What Was Fixed

### 1. Removed Hard-Coded Data
- Deleted `sampleInvoices` from Invoices.jsx
- Deleted `sampleOrders` from Orders.jsx
- Removed all static data from state

### 2. Fixed Property Names
- Invoice: `customer` → `customer_name`, `dueDate` → `due_date`
- Order: `service` → `product_name`, `customer` → `company_name`
- Customer: `name` → `company_name`, `joinDate` → `join_date`
- Vendor: `joinDate` → `join_date`, `products`/`orders` → `total_orders`/`completed_orders`

### 3. Integrated APIs
- Added `fetchCustomers()` to Invoices.jsx for form dropdown
- Fixed `handleCreateInvoice()` to call API instead of local state
- Updated all filters to use correct database field names
- Added proper error handling and loading states

### 4. Fixed Status Updates
- Corrected status values: 'In Progress' (not 'in progress')
- Added proper status filtering
- Fixed invoice/order status update logic

---

## Next Steps (Optional Enhancements)

1. **Authentication**: Implement JWT token validation
2. **Pagination**: Add pagination for large datasets
3. **Search/Filter**: Optimize with backend queries
4. **Export**: Add CSV/PDF export functionality
5. **Notifications**: Add real-time updates with WebSockets
6. **Testing**: Add unit and integration tests

---

## Support

For issues:
1. Check browser console (F12) for error messages
2. Check terminal logs for backend errors
3. Verify PostgreSQL is running
4. Ensure all environment variables are set
5. Restart both frontend and backend

Happy coding! 🚀
