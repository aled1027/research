# Gmail Client

A simple Gmail client built with Node.js/Express and the Gmail API. Uses Pico.css for a clean, minimal frontend.

## Features

- **OAuth2 Authentication**: Secure sign-in with Google
- **View Emails**: List emails with pagination and search
- **Read Emails**: View full email content (supports HTML emails)
- **Send Emails**: Compose and send new emails
- **Mark as Read**: Automatically marks emails as read when viewed
- **Delete Emails**: Move emails to trash
- **Search**: Search emails using Gmail query syntax

## Project Structure

```
gmail-client/
├── server.js          # Express backend with Gmail API integration
├── public/
│   └── index.html     # Frontend HTML with Pico.css
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
├── notes.md           # Development notes
└── README.md          # This file
```

## Prerequisites

- Node.js 18+ installed
- A Google Cloud project with Gmail API enabled
- OAuth2 credentials configured

## Setup Instructions

### 1. Create Google Cloud OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add `http://localhost:3000/auth/callback` as an Authorized redirect URI
   - Copy the Client ID and Client Secret

### 2. Configure the Application

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   SESSION_SECRET=a-random-secret-string
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm start
```

Open http://localhost:3000 in your browser.

## Usage

1. Click "Sign in with Google"
2. Authorize the application to access your Gmail
3. View your inbox emails
4. Click an email to view its contents
5. Use the "Compose" button to send new emails
6. Search using Gmail query syntax (e.g., `from:someone@example.com`, `subject:meeting`)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/status` | Check authentication status |
| GET | `/auth/login` | Start OAuth flow |
| GET | `/auth/callback` | OAuth callback handler |
| GET | `/auth/logout` | Logout and clear session |
| GET | `/api/profile` | Get user's email address |
| GET | `/api/emails` | List emails (supports `maxResults`, `pageToken`, `q` params) |
| GET | `/api/emails/:id` | Get single email with full body |
| POST | `/api/emails/send` | Send email (`to`, `subject`, `body` in JSON body) |
| POST | `/api/emails/:id/read` | Mark email as read |
| DELETE | `/api/emails/:id` | Move email to trash |

## Gmail Search Syntax

The search bar supports Gmail's query syntax:

- `from:email@example.com` - Emails from specific sender
- `to:email@example.com` - Emails to specific recipient
- `subject:keyword` - Emails with keyword in subject
- `is:unread` - Unread emails only
- `has:attachment` - Emails with attachments
- `after:2024/01/01` - Emails after a date
- `before:2024/12/31` - Emails before a date

## Security Notes

- OAuth tokens are stored in server-side sessions
- Never commit your `.env` file with real credentials
- In production, use HTTPS and set `cookie.secure: true`
- Consider using a production session store (Redis, MongoDB, etc.)

## Dependencies

- **express**: Web framework
- **express-session**: Session management
- **googleapis**: Google APIs client library
- **dotenv**: Environment variable management

## License

MIT
