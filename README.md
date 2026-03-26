# 🏦 Bank Transactions API

A RESTful Node.js backend for managing bank accounts and transactions with JWT authentication and ledger-based balance tracking.

## Tech Stack

- **Node.js** + **Express.js** — Server & routing
- **MongoDB** + **Mongoose** — Database
- **JWT** + **bcrypt** — Auth & security
- **Nodemailer** — Email notifications

## Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
MONGO_URI=mongodb://localhost:27017/bank-transactions
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# 3. Start server
npm run dev        # development
npm start          # production
```

Server runs at `http://localhost:3000`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get token |
| POST | `/api/auth/logout` | Logout and clear token |

### Accounts *(Protected)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts` | Create a new account |
| GET | `/api/accounts` | Get all your accounts |
| GET | `/api/accounts/balance/:accountId` | Get account balance |

### Transactions *(Protected)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Send money between accounts |
| POST | `/api/transactions/system/initial-funds` | Add initial funds *(Admin only)* |

## Authentication

Pass your JWT token in either:
```
Cookie:          token=<your_token>
Authorization:   Bearer <your_token>
```

## Transaction Request Example
```json
POST /api/transactions
{
  "fromAccount": "account_id_1",
  "toAccount": "account_id_2",
  "amount": 500,
  "idempotencyKey": "unique-key-123"
}
```

## Key Features

- **JWT Authentication** — Secure login, logout, and protected routes
- **Multiple Accounts** — Create and manage multiple bank accounts per user
- **Idempotency Keys** — Prevents duplicate transactions
- **Double-Entry Ledger** — Accurate balance tracking via ledger entries
- **MongoDB Sessions** — Atomic operations for data consistency
- **Email Notifications** — Transaction confirmation emails via Nodemailer
- **Balance Validation** — Insufficient balance check before processing
- **Account Status Check** — Only ACTIVE accounts can transact
- **System Admin Funding** — Dedicated endpoint to add initial funds
- **Password Hashing** — Passwords secured with bcrypt
- **Environment Variables** — Sensitive config stored in .env

## Error Responses

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |
