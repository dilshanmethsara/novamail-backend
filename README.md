# Nova Mail Backend

A Node.js + Express backend for the Nova Mail temporary email service. This backend connects to the Mail.tm API to provide temporary email functionality.

## Features

- ✅ Get available Mail.tm domains
- ✅ Generate random temporary email accounts
- ✅ Authenticate with Mail.tm API
- ✅ Fetch inbox messages
- ✅ Fetch individual messages
- ✅ Error handling and proper HTTP status codes
- ✅ Clean, organized code structure
- ✅ Beginner-friendly with detailed comments

## Project Structure

```
backend/
├── package.json          # Dependencies and scripts
├── server.js             # Main server file
├── .env.example          # Environment variables example
├── README.md             # This file
├── controllers/
│   └── mailController.js # Route controllers
├── routes/
│   └── mailRoutes.js     # API routes
└── utils/
    └── mailtmAPI.js      # Mail.tm API utilities
```

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Run the server:**
   ```bash
   # For development (with auto-restart)
   npm run dev
   
   # For production
   npm start
   ```

The server will start on port 5000 by default.

## API Endpoints

### Health Check
- **URL:** `GET /api/health`
- **Description:** Check if the backend is running
- **Response:**
  ```json
  {
    "success": true,
    "message": "Nova Mail Backend is running",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
  ```

### Get Available Domains
- **URL:** `GET /api/domains`
- **Description:** Get list of available domains from Mail.tm
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "hydra:member": [
        {
          "id": "/domains/1",
          "domain": "example.com",
          "isActive": true
        }
      ]
    },
    "message": "Domains retrieved successfully"
  }
  ```

### Generate Temporary Email
- **URL:** `POST /api/generate-email`
- **Description:** Create a new temporary email account
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "email": "abc123@example.com",
      "password": "def456ghi789",
      "accountId": "/accounts/123"
    },
    "message": "Temporary email account created successfully"
  }
  ```

### Get Authentication Token
- **URL:** `POST /api/token`
- **Description:** Get JWT token for an existing account
- **Request Body:**
  ```json
  {
    "email": "abc123@example.com",
    "password": "def456ghi789"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2024-01-01T13:00:00.000Z"
    },
    "message": "Authentication token retrieved successfully"
  }
  ```

### Get Inbox Messages
- **URL:** `POST /api/messages`
- **Description:** Get all messages in the inbox
- **Request Body:**
  ```json
  {
    "email": "abc123@example.com",
    "password": "def456ghi789"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "hydra:member": [
        {
          "id": "/messages/123",
          "from": {
            "address": "sender@example.com",
            "name": "Sender Name"
          },
          "to": [
            {
              "address": "abc123@example.com",
              "name": ""
            }
          ],
          "subject": "Test Email",
          "intro": "This is a test email...",
          "seen": false,
          "isDeleted": false,
          "hasAttachments": false,
          "downloadUrl": "https://api.mail.tm/messages/123/download",
          "createdAt": "2024-01-01T12:30:00.000Z",
          "updatedAt": "2024-01-01T12:30:00.000Z"
        }
      ]
    },
    "message": "Inbox messages retrieved successfully"
  }
  ```

### Get Single Message
- **URL:** `POST /api/message`
- **Description:** Get full details of a specific message
- **Request Body:**
  ```json
  {
    "email": "abc123@example.com",
    "password": "def456ghi789",
    "messageId": "/messages/123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "/messages/123",
      "from": {
        "address": "sender@example.com",
        "name": "Sender Name"
      },
      "to": [
        {
          "address": "abc123@example.com",
          "name": ""
        }
      ],
      "subject": "Test Email",
      "text": "Full email content here...",
      "html": "<p>Full email HTML content here...</p>",
      "seen": false,
      "isDeleted": false,
      "hasAttachments": false,
      "attachments": [],
      "createdAt": "2024-01-01T12:30:00.000Z",
      "updatedAt": "2024-01-01T12:30:00.000Z"
    },
    "message": "Message retrieved successfully"
  }
  ```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly error message"
}
```

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

### Test with curl

1. **Health check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Generate email:**
   ```bash
   curl -X POST http://localhost:5000/api/generate-email
   ```

3. **Get messages (replace with your email and password):**
   ```bash
   curl -X POST http://localhost:5000/api/messages \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com","password":"your-password"}'
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Mail.tm API Configuration
MAILTM_API_BASE_URL=https://api.mail.tm
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing middleware
- **axios**: HTTP client for API requests
- **dotenv**: Environment variable management
- **nodemon**: Development auto-restart (dev dependency)

## Common Issues

1. **Port already in use:** Change the PORT in your `.env` file
2. **Mail.tm API errors:** Check your internet connection and Mail.tm service status
3. **CORS issues:** The backend allows all origins by default, but you may need to configure this for production

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Configure proper CORS origins
4. Set up logging and monitoring
5. Use environment variables for sensitive data

## License

MIT License
