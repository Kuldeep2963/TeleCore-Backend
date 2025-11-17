# TeleCore Application - Setup & Integration Guide

## Project Overview
This project has been fully integrated with:
- **Backend**: Node.js/Express API with PostgreSQL database
- **Frontend**: React with Vite, using Chakra UI components
- **API Communication**: Centralized API service utility

## Architecture Changes Made

### 1. Frontend API Service Layer (`src/services/api.js`)
- Created a centralized API service that handles all backend communication
- Configured to use `VITE_API_URL` from environment variables
- Supports all CRUD operations for:
  - **Vendors**: GET, POST, PUT, DELETE
  - **Customers**: GET, POST, PUT, DELETE
  - **Orders**: GET, POST, PUT, PATCH (status), DELETE
  - **Invoices**: GET, POST, PUT, PATCH (status), DELETE
  - **Numbers**: GET
  - **Pricing**: GET

### 2. Backend Route Enhancements
Enhanced all backend routes with full CRUD capabilities:

#### **Vendors Route** (`backend/routes/vendors.js`)
- `GET /api/vendors` - Get all vendors with order statistics
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

#### **Customers Route** (`backend/routes/customers.js`)
- `GET /api/customers` - Get all customers with order/spending stats
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

#### **Orders Route** (`backend/routes/orders.js`)
- `GET /api/orders` - Get all orders with related data
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

#### **Invoices Route** (`backend/routes/invoices.js`)
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

### 3. Frontend Pages Updated
All pages have been converted from hard-coded data to API-driven:

#### **Vendors Page** (`src/pages/Vendors.jsx`)
- ✅ Fetches vendors from backend on mount
- ✅ Displays real database data
- ✅ Delete operation integrates with backend
- ✅ Loading state management

#### **Customers Page** (`src/pages/Customers.jsx`)
- ✅ Fetches customers from backend on mount
- ✅ Displays real database data with order/spending stats
- ✅ Delete operation integrates with backend
- ✅ Loading state management

#### **Orders Page** (`src/pages/Orders.jsx`)
- ✅ Fetches orders from backend on mount
- ✅ Displays real database data with related customer/vendor info
- ✅ Status update integrates with backend
- ✅ Loading state management

#### **Invoices Page** (`src/pages/Invoices.jsx`)
- ✅ Fetches invoices from backend on mount
- ✅ Displays real database data with customer info
- ✅ Status update integrates with backend
- ✅ Loading state management

## Running the Application

### Prerequisites
1. Node.js (v14+)
2. PostgreSQL database running
3. Backend database initialized

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Run migrations (if needed)
npm run migrate

# Start backend server
npm run dev
```
Backend will run on `http://localhost:3001`

### Frontend Setup
```bash
# Install dependencies
npm install

# Create .env.local file (already created)
# VITE_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```
Frontend will run on `http://localhost:5173` (or similar)

## Environment Configuration

### Frontend Environment (`.env.local`)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend Environment (`.env`)
```
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=telecore_db
DB_PASSWORD=password
DB_PORT=5432
NODE_ENV=development
```

## Testing the Integration

### Test Vendors Page
1. Start both backend and frontend
2. Login with credentials: `sarah@telecore.com` / `Sarah@123`
3. Navigate to Internal User Dashboard → Vendors
4. Verify vendors are loaded from database
5. Test delete functionality
6. Check console for any API errors

### Test Customers Page
1. Navigate to Internal User Dashboard → Customers
2. Verify customers are loaded with their stats
3. Test delete functionality
4. Check that order counts and total spending are calculated

### Test Orders Page
1. Navigate to Internal User Dashboard → Orders
2. Verify orders are displayed with proper field mapping
3. Test status update functionality
4. Verify vendor and customer information displays correctly

### Test Invoices Page
1. Navigate to Internal User Dashboard → Invoices
2. Verify invoices are loaded from database
3. Test status update functionality
4. Check invoice statistics calculation

## Common Issues & Solutions

### Issue: API Not Responding
**Solution**: Ensure backend is running and database is connected
```bash
# Check backend is running
curl http://localhost:3001/health
```

### Issue: CORS Errors
**Solution**: Backend CORS is configured for all origins. Check browser console for specific errors.

### Issue: Loading Spinner Never Disappears
**Solution**: Check browser console for API errors. Database might not have data for that resource.

### Issue: Field Mapping Issues
**Solution**: The backend returns snake_case field names. Frontend pages have been updated to use:
- `company_name` (customer)
- `product_name` (service)
- `total_amount` (amount)
- `created_at` (order/issue date)
- `vendor_name` (vendor)
- `customer_name` (customer on invoices)

## Data Flow Diagram

```
User Action (Frontend)
    ↓
React Component (Vendors, Customers, etc.)
    ↓
API Service (src/services/api.js)
    ↓
HTTP Request to Backend
    ↓
Express Route Handler
    ↓
PostgreSQL Database
    ↓
Response with JSON Data
    ↓
Update Component State
    ↓
UI Renders with Real Data
```

## Performance Improvements Made

1. **Centralized API Service**: Single source of truth for all API calls
2. **Loading States**: User feedback while fetching data
3. **Error Handling**: Toast notifications for API errors
4. **Database Aggregations**: Backend calculates stats (total orders, total spent, etc.)
5. **Proper SQL Joins**: Related data fetched efficiently

## Next Steps

### Optional Enhancements
1. Implement pagination for large datasets
2. Add search/filter optimizations with backend queries
3. Implement caching with React Query or SWR
4. Add form validation on both frontend and backend
5. Implement authentication with JWT tokens
6. Add rate limiting improvements
7. Create data export functionality

### Security Improvements
1. Add input validation and sanitization
2. Implement proper authentication
3. Add authorization checks
4. Use HTTPS in production
5. Add API key management

## File Summary

### Created Files
- `src/services/api.js` - API communication layer
- `.env.local` - Frontend environment variables

### Modified Files
- `backend/routes/vendors.js` - Added POST, PUT, DELETE
- `backend/routes/customers.js` - Added POST, PUT, DELETE + aggregations
- `backend/routes/orders.js` - Added GET/:id, POST, PUT, PATCH, DELETE
- `backend/routes/invoices.js` - Added PUT, DELETE
- `src/pages/Vendors.jsx` - Integrated API + loading states
- `src/pages/Customers.jsx` - Integrated API + loading states
- `src/pages/Orders.jsx` - Integrated API + loading states + field mapping
- `src/pages/Invoices.jsx` - Integrated API + loading states + field mapping

## Support

For issues or questions, check:
1. Browser Console (F12) for error messages
2. Backend logs for API errors
3. Database connection status
4. Environment variables configuration
