const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// MongoDB Connection
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// =========================
// Message Schema
// =========================
const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  address: String,

  phone: String,

  message: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

// =========================
// Nodemailer
// =========================
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP Connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verification Failed");
    console.error(error);
  } else {
    console.log("✅ SMTP Server is ready to send emails.");
  }
});

// =========================
// Contact Route
// =========================
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, address, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Please fill all required fields.",
      });
    }

    // Save to MongoDB
    const newMessage = new Message({
      name,
      email,
      address,
      phone,
      message,
    });

    await newMessage.save();

    console.log("✅ Message saved to MongoDB.");

    // Email Template
    const mailOptions = {
      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: `📩 New Portfolio Message from ${name}`,

      html: `
      <div style="font-family:Arial;padding:20px;background:#f4f4f4">

        <h2 style="color:#12f7ff">
          New Contact Form Submission
        </h2>

        <hr>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone || "N/A"}</p>

        <p><strong>Address:</strong> ${address || "N/A"}</p>

        <p><strong>Message:</strong></p>

        <div style="
          background:white;
          padding:15px;
          border-left:4px solid #12f7ff;
        ">
          ${message}
        </div>

      </div>
      `,
    };

    // Send Email
    try {
      const info = await transporter.sendMail(mailOptions);

      console.log("✅ Email Sent Successfully");
      console.log(info.response);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully.",
      });
    } catch (mailError) {
      console.error("❌ EMAIL ERROR");
      console.error(mailError);
      console.error("Message:", mailError.message);
      console.error("Code:", mailError.code);
      console.error("Response:", mailError.response);

      return res.status(500).json({
        success: false,
        error: mailError.message,
      });
    }
  } catch (err) {
    console.error("❌ SERVER ERROR");
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// =========================
// Test Route
// =========================
app.get("/", (req, res) => {
  res.send("Portfolio Backend Running 🚀");
});

// =========================
// Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});