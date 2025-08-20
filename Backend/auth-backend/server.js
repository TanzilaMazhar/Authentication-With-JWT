const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const app = express();

// Allow cookies from frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Secret for JWT (normally in .env)
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "auth_db",
  password: "123456",
  port: 5432,
});

//Sign Up
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashed,
    ]);

    return res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

//Sign In
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "4m" }
    );
    const decoded = jwt.decode(token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 4 * 60 * 1000
    });
    return res.json({
      message: "Login Successfully",
      user: { id: user.id, email: user.email },
      token,
      exp: decoded.exp * 1000
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

//check user SignIn
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query("SELECT id, email FROM users WHERE id=$1", [
      decoded.id,
    ]);
    if (!result.rows[0])
      return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        ...result.rows[0],
        token,
        exp: decoded.exp * 1000,
      }
    });
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

//Forgot password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/auth/forgot", async (req, res) => {
  const { email } = req.body;
  if (!email || email.trim() === "") {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    //check user exists in db
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "No account found with this email" });
    }

    //here token generated and will match the token in link we send
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

    // Reset link
    const resetLink = `http://localhost:5173/resetpassword/?token=${token}`;

    // Email options
    const mailOptions = {
      from: '"Your App" <${process.env.EMAIL_USER}>',
      to: email,
      subject: "Password Reset Link",
      html: `<p>Click this link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };
    //Send email
    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link send Successfully" });
  } catch (err) {
    console.error("Forgot password error:", err); 
    res.status(500).json({ error: "Failed to send reset email." });
  }
});

//Reset Password
app.post("/api/auth/reset", async (req, res) => {
  const { token, password } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in DB
    await pool.query("UPDATE users SET password=$1 WHERE email=$2", [hashedPassword, email]);
    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify Reset Token
app.post("/api/auth/verify-reset-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, email: decoded.email });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

app.listen(5000, () => console.log("Server running on port 5000"));


