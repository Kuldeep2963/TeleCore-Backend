# TeleCore Backend API

Backend API for the TeleCore telecom management system built with Node.js, Express, and PostgreSQL.

## Features

- User authentication and authorization
- Customer and vendor management
- Order processing and management
- Phone number management
- Invoice and billing system
- Wallet and payment management
- Pricing management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other settings.

4. Set up the database:
   - Create a PostgreSQL database named `telecore_db`
   - Run the schema file:
     ```bash
     psql -d telecore_db -f ../database_schema.sql
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/wallet` - Update user wallet balance

### Health Check
- `GET /health` - Database health check

## Database Schema

The database schema includes the following main tables:
- `users` - User accounts and authentication
- `customers` - Client information
- `vendors` - Supplier information
- `orders` - Order records
- `numbers` - Phone number inventory
- `invoices` - Billing records
- `pricing_plans` - Service pricing
- `countries` - Supported countries
- `products` - Service types

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   └── ...                 # Other route files
├── server.js               # Main server file
├── package.json
├── .env.example            # Environment variables template
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | telecore_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | (required) |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRE` | JWT expiration | 24h |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.