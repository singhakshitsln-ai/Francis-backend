require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ai.akshit.gamer.gd";

function initFirebaseAdmin() {
  if (admin.apps.length) return true;
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn("Firebase Admin credentials are not configured. Protected routes will return 503.");
    return false;
  }
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
  return true;
}
const firebaseReady = initFirebaseAdmin();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const DB_FILE = path.join(__dirname, "notes-db.json");
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return {}; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function requireFirebaseUser(req, res, next) {
  if (!firebaseReady) return res.status(503).json({ error: "Firebase Admin is not configured on the server." });
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Not logged in" });
  try {
    const token = header.slice(7);
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired Firebase token" });
  }
}

function publicUser(user) {
  return {
    id: user.uid,
    name: user.name || user.displayName || user.email || "Account",
    email: user.email || "",
    avatar: user.picture || "",
    provider: user.firebase?.sign_in_provider || "firebase"
  };
}

app.get("/api/ping", (req, res) => {
  res.json({ message: "Francis backend is alive!" });
});

app.get("/api/auth/user", requireFirebaseUser, (req, res) => {
  res.json(publicUser(req.user));
});

// Firebase handles sign-out on the client. This endpoint remains for compatibility.
app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

app.get("/api/notes", requireFirebaseUser, (req, res) => {
  const db = readDB();
  res.json({ notes: db[req.user.uid]?.notes || "" });
});

app.post("/api/notes", requireFirebaseUser, (req, res) => {
  const db = readDB();
  db[req.user.uid] = { notes: String(req.body.notes || "") };
  writeDB(db);
  res.json({ message: "Saved" });
});

app.listen(PORT, () => console.log(`Francis backend running on port ${PORT}`));
