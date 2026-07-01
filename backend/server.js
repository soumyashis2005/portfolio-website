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
// Nodemailer Configuration (Max Reliability for Cloud Deployments)
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,               // SSL Port
  secure: true,            // Must be true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // 🔄 Tell Nodemailer to bypass internal proxy/local security blocks on cloud setups
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionTimeout: 20000, // Give it a bit more breathing room (20 seconds)
  greetingTimeout: 20000,
  socketTimeout: 20000,
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

// Helper function to prevent malicious code/HTML breaking your email layout
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

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

    // Save Message to MongoDB
    const newMessage = new Message({
      name,
      email,
      address,
      phone,
      message,
    });

    await newMessage.save();
    console.log("✅ Message saved to MongoDB.");

    // Mail Options (Sanitized to handle custom formatting strings safely)
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 New Portfolio Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;color:#333;">
          <h2 style="color:#0076ff;">New Contact Form Submission</h2>

          <table cellpadding="8" style="background:#ffffff; width:100%; border-radius:4px;">
            <tr>
              <td><strong>Name:</strong></td>
              <td>${escapeHTML(name)}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${escapeHTML(email)}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>${phone ? escapeHTML(phone) : "Not Provided"}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>${address ? escapeHTML(address) : "Not Provided"}</td>
            </tr>
          </table>

          <hr style="border:0; border-top:1px solid #ddd; margin:20px 0;">

          <h3>Message</h3>

          <div style="
            background:#ffffff;
            padding:15px;
            border-left:4px solid #0076ff;
            white-space: pre-wrap;
          ">
            ${escapeHTML(message)}
          </div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email Sent Successfully");
      console.log(info.response);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully.",
      });
    } catch (mailError) {
      console.error("❌ EMAIL ERROR DETAILS:");
      console.error("Message:", mailError.message);
      console.error("Code:", mailError.code);

      // We explicitly inform the client that data saved to DB but mail dropped
      return res.status(500).json({
        success: false,
        error: "Message archived into database, but system failed notification dispatch.",
      });
    }
  } catch (err) {
    console.error("❌ SERVER ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: "Internal server validation exception occurred.",
    });
  }
});

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.send("Portfolio Backend Running 🚀");
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});