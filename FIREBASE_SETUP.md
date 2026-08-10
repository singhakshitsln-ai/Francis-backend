# Francis — Firebase Authentication Setup

## 1. Firebase
Create a Firebase project and add a **Web app**.

In **Authentication → Sign-in method**, enable:
- Email/Password
- Google
- GitHub

For GitHub, create an OAuth app and use the Firebase-provided callback URL.

Copy the Web app configuration into `firebase-config.js`, replacing the `YOUR_*` values.

Add your deployed site domain (for example `ai.akshit.gamer.gd`) to:
**Authentication → Settings → Authorized domains**.

## 2. Backend
Install dependencies:

```bash
npm install
```

Set these environment variables on Render (or wherever the backend runs):

```text
PORT=3000
FRONTEND_URL=https://ai.akshit.gamer.gd
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY
-----END PRIVATE KEY-----
"
```

The Firebase Admin credentials come from a Firebase/Google service-account key. **Never put those credentials in the frontend or Git repository.**

Start:

```bash
npm start
```

## 3. What was fixed
- Removed the login modal from `index.html`.
- Login button now opens `login.html`.
- Added Firebase Email/Password, Google, GitHub, account creation and password reset.
- Notes API now accepts and verifies Firebase ID tokens.
- Repaired the corrupted `server.js`.
- Fixed the service-worker filename mismatch.
- Added `icon.svg` and favicon support.
- Fixed broken 404/admin relative paths and malformed HTML.
- Updated the PWA manifest and service worker.
