import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from 'morgan';
import crypto from 'crypto';

const PORT = 8080;
const app = express();

// Database of users
const database = {};

app.use(cors());
app.use(express.json());
// Middleware for security headers
app.use(helmet());

// Middleware for logging HTTP requests
app.use(morgan('combined'));

// Function to hash data
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Routes

app.get("/user", (req, res) => {
  res.status(200).json({user: database['user']});
});

app.post("/update", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Hash the user data for integrity
  const userData = { name };
  const userHash = hashData(JSON.stringify(userData));

  database['user'] = { ...userData, hash: userHash };
  res.status(201).json({ message: 'User created', user: database['user'] });
});

app.get("/verify", (req, res) => {
  const user = database['user'];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify the integrity of the data
  const currentHash = hashData(JSON.stringify({ name: user.name }));
  if (currentHash !== user.hash) {
    return res.status(500).json({ error: 'Data integrity check failed' });
  }

  res.status(200).json({ user });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
