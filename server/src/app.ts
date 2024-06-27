import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from 'morgan';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 2000;
const PRIVATE_KEY_PATH = path.join(__dirname, 'private.pem');
const PUBLIC_KEY_PATH = path.join(__dirname, 'public.pem');

// Generate RSA keys if not already present
if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey.export({ type: 'pkcs1', format: 'pem' }));
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey.export({ type: 'spki', format: 'pem' }));
}

// Load RSA keys
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

// CORS
app.use(cors());

// Middleware for security headers
app.use(helmet());

// Middleware for logging HTTP requests
app.use(morgan('combined'));

// Middleware for parsing JSON bodies
app.use(express.json());

// Simulate a simple in-memory database
const database = {user: undefined};

// Function to sign data
const signData = (data) => {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
};

// Function to verify data
const verifyData = (data, signature) => {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
};

// Route to get user data
app.get('/user', (req, res) => {
  if (!database.user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ user: database.user });
});

// Route to update user data
app.post('/update', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userData = JSON.stringify({ name });
  const signature = signData(userData);

  database.user = { name, signature };
  res.status(201).json({ message: 'User updated', user: database.user });
});

// Route to verify user data integrity
app.get('/verify', (req, res) => {
  const user = database.user;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = JSON.stringify({ name: user.name });
  const isValid = verifyData(userData, user.signature);

  if (!isValid) {
    return res.status(500).json({ error: 'Data integrity check failed' });
  }

  res.status(200).json({ user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
