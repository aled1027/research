# Gmail Client Development Notes

## Project Overview
Building a custom Gmail client using the Gmail API with:
- Node.js/Express backend
- Simple HTML frontend with Pico.css
- OAuth2 authentication for Gmail API access

## Progress Log

### Step 1: Project Setup
- Created `gmail-client` folder
- Setting up Node.js project with Express

### Key Decisions
- Using Express for simplicity and wide adoption
- Pico.css for minimal, classless CSS styling
- googleapis npm package for Gmail API interaction
- Session-based auth storage for simplicity

## Technical Notes

### Gmail API Scopes Needed
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/gmail.modify` - Modify emails (mark as read, etc.)

### OAuth2 Flow
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. Google redirects back with authorization code
4. Exchange code for access/refresh tokens
5. Store tokens in session for API calls

### Step 2: Backend Implementation
- Created Express server with session management
- Implemented OAuth2 flow with Google
- Created API endpoints:
  - `GET /api/auth/status` - Check auth status
  - `GET /auth/login` - Start OAuth flow
  - `GET /auth/callback` - Handle OAuth callback
  - `GET /auth/logout` - Logout
  - `GET /api/profile` - Get user profile
  - `GET /api/emails` - List emails with pagination
  - `GET /api/emails/:id` - Get single email
  - `POST /api/emails/send` - Send email
  - `POST /api/emails/:id/read` - Mark as read
  - `DELETE /api/emails/:id` - Delete email

### Step 3: Frontend Implementation
- Created simple HTML page with Pico.css
- Features:
  - Sign in with Google button
  - Email list view with unread indicators
  - Email detail view with HTML support
  - Compose email form
  - Search functionality
  - Pagination for loading more emails

### Challenges & Solutions
1. **Email body extraction**: Gmail API returns nested MIME parts, needed recursive function to extract text/plain or text/html
2. **Base64 encoding for sending**: Gmail API expects URL-safe base64 encoding for raw email
3. **Session management**: Used express-session for storing OAuth tokens
