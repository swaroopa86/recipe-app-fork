# Email Setup Guide

To enable real email invitations in the Smart Pantry app, you need to configure email settings.

## Option 1: Gmail (Recommended for Development)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account → Security → App passwords
- Select "Mail" and your device
- Copy the generated 16-character password

### 3. Set Environment Variables
Create a `.env` file in the `backend` directory:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Install Environment Variables Package
```bash
cd backend
npm install dotenv
```

### 5. Update server.js
Add this line at the top of `backend/server.js`:
```javascript
require('dotenv').config();
```

## Option 2: Other Email Services

### SendGrid
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### AWS SES
```javascript
const transporter = nodemailer.createTransporter({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASS
  }
});
```

## Testing Email Functionality

1. Start the backend server:
```bash
cd backend
node server.js
```

2. Test the invitation endpoint:
```bash
curl -X POST http://localhost:3001/api/invitations \
  -H "Content-Type: application/json" \
  -d '{
    "pantryId": "ABC12345",
    "pantryName": "Test Pantry",
    "invitations": [
      {
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }'
```

## Troubleshooting

### Common Issues:

1. **Authentication failed**: Check your email and app password
2. **Less secure app access**: Use App Passwords instead of regular passwords
3. **Rate limiting**: Gmail has daily sending limits
4. **Spam filters**: Check spam folder for test emails

### For Production:

- Use a professional email service like SendGrid, AWS SES, or Mailgun
- Set up proper SPF, DKIM, and DMARC records
- Monitor email delivery rates
- Implement email templates and tracking

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate app passwords
- Monitor for suspicious email activity 