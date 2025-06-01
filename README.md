# Offline Web Application Backend

This is a Node.js backend for an offline web application with user authentication, role-based access control, order management, and chat functionality.

## Features

- User authentication (login/register)
- Role-based access control (superadmin, admin, user)
- Order management
- Chat system
- Completely offline operation using JSON file storage
- Secure password hashing with bcrypt

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/register`
- Body:
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

#### Login
- **POST** `/api/login`
- Body:
```json
{
  "username": "string",
  "password": "string"
}
```

### Admin Management (Superadmin only)

#### Create Admin
- **POST** `/api/admins/create`
- Body:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "admin" | "superadmin"
}
```

#### Delete Admin
- **POST** `/api/admins/delete`
- Body:
```json
{
  "adminId": "string"
}
```

### Orders

#### Get Orders
- **GET** `/api/orders`
- Note: Returns all orders for admins, user-specific orders for regular users

#### Create Order
- **POST** `/api/orders`
- Body:
```json
{
  "products": [
    {
      "id": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number"
}
```

#### Update Order Status (Admin only)
- **POST** `/api/orders/update-status`
- Body:
```json
{
  "orderId": "string",
  "status": "string"
}
```

### Chat

#### Get Conversations
- **POST** `/api/chat/get`
- Body (optional):
```json
{
  "conversationId": "string"
}
```

#### Send Message
- **POST** `/api/chat/send`
- Body:
```json
{
  "conversationId": "string",
  "message": "string"
}
```
or for new conversation:
```json
{
  "recipientId": "string",
  "message": "string"
}
```

## File Structure

```
├── server.js           # Main application file
├── package.json        # Project dependencies
├── data/              # JSON storage directory
│   ├── users.json
│   ├── admins.json
│   ├── orders.json
│   └── conversations.json
└── routes/            # Route handlers
    ├── auth.js        # Authentication routes
    ├── admin.js       # Admin management routes
    ├── orders.js      # Order management routes
    └── chat.js        # Chat functionality routes
```

## Security Notes

1. All passwords are hashed using bcrypt before storage
2. JWT tokens are used for session management
3. Role-based access control is enforced for all protected routes
4. File permissions should be set appropriately on the data directory

## Default Superadmin Account

The system comes with a default superadmin account:
- Username: superadmin
- Password: admin123

**Important:** Change the default superadmin password immediately after first login.

## Development

For development, the project uses nodemon for auto-reloading. Run with:
```bash
npm run dev
```

## License

MIT
