# MockInterview Admin Panel

A separate admin panel for managing the MockInterview platform.

## Features

- **User Management**: View, search, and delete users
- **Question Management**: Add, edit, and delete interview questions by category
- **Analytics Dashboard**: View platform statistics and charts
- **Reported Users**: Manage user reports and moderation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
- Copy `.env.development` for local development
- Copy `.env.production` for production deployment

3. Run locally:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set the environment variable `REACT_APP_API_URL` to your backend URL
3. Deploy

## Admin Access

To make a user admin, run this script on your server:

```bash
node server/scripts/makeAdmin.js user@example.com
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (e.g., https://your-backend.onrender.com)

## Security

- Only users with `role: 'admin'` can access this panel
- Separate authentication token storage (`admin_token`)
- Protected routes and API endpoints