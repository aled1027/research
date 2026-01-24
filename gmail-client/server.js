require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'gmail-client-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

// Helper to get authenticated Gmail client
function getGmailClient(tokens) {
  const authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  );
  authClient.setCredentials(tokens);
  return google.gmail({ version: 'v1', auth: authClient });
}

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!req.session.tokens });
});

// Start OAuth flow
app.get('/auth/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    res.redirect('/');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Get user profile
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json(profile.data);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// List emails
app.get('/api/emails', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const { maxResults = 20, pageToken, q = '' } = req.query;

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults),
      pageToken,
      q
    });

    const messages = response.data.messages || [];

    // Fetch details for each message
    const emailPromises = messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date']
      });

      const headers = detail.data.payload.headers;
      const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

      return {
        id: msg.id,
        threadId: msg.threadId,
        snippet: detail.data.snippet,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        labelIds: detail.data.labelIds,
        isUnread: detail.data.labelIds?.includes('UNREAD')
      };
    });

    const emails = await Promise.all(emailPromises);

    res.json({
      emails,
      nextPageToken: response.data.nextPageToken
    });
  } catch (error) {
    console.error('List emails error:', error);
    res.status(500).json({ error: 'Failed to list emails' });
  }
});

// Get single email
app.get('/api/emails/:id', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const { id } = req.params;

    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full'
    });

    const message = response.data;
    const headers = message.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    // Extract body
    let body = '';

    function extractBody(payload) {
      if (payload.body && payload.body.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.mimeType === 'text/html' && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.parts) {
            const nested = extractBody(part);
            if (nested) return nested;
          }
        }
      }
      return body;
    }

    body = extractBody(message.payload);

    res.json({
      id: message.id,
      threadId: message.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
      labelIds: message.labelIds
    });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to get email' });
  }
});

// Send email
app.post('/api/emails/send', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    // Get sender email
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const from = profile.data.emailAddress;

    // Create email in RFC 2822 format
    const email = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ].join('\r\n');

    const encodedEmail = Buffer.from(email).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    res.json({ success: true, id: response.data.id });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Mark email as read
app.post('/api/emails/:id/read', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const { id } = req.params;

    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Delete email (move to trash)
app.delete('/api/emails/:id', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.session.tokens);
    const { id } = req.params;

    await gmail.users.messages.trash({
      userId: 'me',
      id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Gmail Client running at http://localhost:${PORT}`);

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('\n⚠️  Warning: Google OAuth credentials not configured.');
    console.log('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.');
    console.log('See README.md for setup instructions.\n');
  }
});
