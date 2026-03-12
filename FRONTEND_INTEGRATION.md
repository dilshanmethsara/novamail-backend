# Frontend Integration Guide

This guide shows how to integrate your frontend with the Nova Mail backend API.

## Base URL

All API calls should be made to: `http://localhost:5000/api`

## JavaScript/TypeScript API Client

Here's a complete API client you can use in your frontend:

```javascript
class NovaMailAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Get available domains
  async getDomains() {
    return this.request('/domains');
  }

  // Generate temporary email
  async generateEmail() {
    return this.request('/generate-email', {
      method: 'POST',
    });
  }

  // Get authentication token
  async getToken(email, password) {
    return this.request('/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Get inbox messages
  async getMessages(email, password) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Get single message
  async getMessage(email, password, messageId) {
    return this.request('/message', {
      method: 'POST',
      body: JSON.stringify({ email, password, messageId }),
    });
  }
}

// Export for use in your app
const api = new NovaMailAPI();
export default api;
```

## React Component Example

Here's how to use the API in a React component:

```jsx
import React, { useState, useEffect } from 'react';
import api from './api';

function TempEmailApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate new temporary email
  const generateNewEmail = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.generateEmail();
      setEmail(response.data.email);
      setPassword(response.data.password);
      setMessages([]); // Clear messages when generating new email
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for current email
  const fetchMessages = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.getMessages(email, password);
      setMessages(response.data['hydra:member'] || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single message
  const fetchMessage = async (messageId) => {
    if (!email || !password) return;
    
    try {
      const response = await api.getMessage(email, password, messageId);
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    if (email && password) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [email, password]);

  return (
    <div className="temp-email-app">
      <h1>Nova Mail - Temporary Email Service</h1>
      
      {/* Generate Email Section */}
      <div className="generate-section">
        <button 
          onClick={generateNewEmail} 
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate New Email'}
        </button>
        
        {email && (
          <div className="email-info">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Password:</strong> {password}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Messages Section */}
      {email && (
        <div className="messages-section">
          <h2>Inbox Messages</h2>
          <button onClick={fetchMessages} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Messages'}
          </button>
          
          {messages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            <ul className="messages-list">
              {messages.map((message) => (
                <li key={message.id} className="message-item">
                  <div className="message-header">
                    <strong>From:</strong> {message.from.address}<br />
                    <strong>Subject:</strong> {message.subject}<br />
                    <strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}
                  </div>
                  <div className="message-preview">
                    {message.intro}
                  </div>
                  <button 
                    onClick={() => fetchMessage(message.id)}
                    className="view-message-btn"
                  >
                    View Full Message
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default TempEmailApp;
```

## Vanilla JavaScript Example

```javascript
// Simple API functions for vanilla JS
const API_BASE = 'http://localhost:5000/api';

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Generate email
async function generateEmail() {
  try {
    const result = await apiCall('/generate-email', { method: 'POST' });
    console.log('Generated email:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error generating email:', error);
  }
}

// Get messages
async function getMessages(email, password) {
  try {
    const result = await apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('Messages:', result.data['hydra:member']);
    return result.data['hydra:member'];
  } catch (error) {
    console.error('Error getting messages:', error);
  }
}

// Usage example
document.getElementById('generate-btn').addEventListener('click', async () => {
  const emailData = await generateEmail();
  if (emailData) {
    document.getElementById('email-display').textContent = emailData.email;
    document.getElementById('password-display').textContent = emailData.password;
  }
});
```

## Testing Endpoints

You can test all endpoints using these curl commands:

```bash
# Health check
curl http://localhost:5000/api/health

# Get domains
curl http://localhost:5000/api/domains

# Generate email
curl -X POST http://localhost:5000/api/generate-email

# Get token (replace with actual email/password)
curl -X POST http://localhost:5000/api/token \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@domain.com","password":"your-password"}'

# Get messages (replace with actual email/password)
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@domain.com","password":"your-password"}'

# Get single message (replace with actual data)
curl -X POST http://localhost:5000/api/message \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@domain.com","password":"your-password","messageId":"/messages/123"}'
```

## Error Handling

Always handle errors in your frontend:

```javascript
try {
  const result = await api.generateEmail();
  // Handle success
} catch (error) {
  // Handle error - show user-friendly message
  console.error('API Error:', error);
  alert(`Error: ${error.message}`);
}
```

## Common Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message"
}
```

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error details",
  "message": "User-friendly error message"
}
```

## CORS Configuration

The backend allows all origins by default. For production, you may want to restrict this in `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```
