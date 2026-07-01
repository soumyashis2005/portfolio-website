const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();

// ============================================================================
// Middleware Configurations
// ============================================================================
app.use(cors());
app.use(express.json());

// ============================================================================
// MongoDB Cluster Connection
// ============================================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================================================================
// SendGrid Mail API Key Handshake
// ============================================================================
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================================================================
// Database Message Schema
// ============================================================================
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

// Helper function to escape basic HTML strings to prevent cross-site scripting
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ============================================================================
// Portfolio Contact API Route
// ============================================================================
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, address, phone, message } = req.body;

    // 1. Core Field Validations
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Please fill all required fields.",
      });
    }

    // 2. Persist Message Data inside MongoDB Atlas Cluster
    const newMessage = new Message({
      name,
      email,
      address,
      phone,
      message,
    });

    await newMessage.save();
    console.log("✅ Message saved to MongoDB storage pipeline.");

    // 3. Compile SendGrid Web API Configuration Layout Options
    const mailOptions = {
      to: process.env.FROM_EMAIL,       // Receives the form notification dispatch
      from: process.env.FROM_EMAIL,     // Must exactly match your verified SendGrid single sender
      replyTo: email,                   // Tying direct email replies back to the sender
      subject: `📩 New Portfolio Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;color:#333;">
          <h2 style="color:#12f7ff;">New Contact Form Submission</h2>

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

          <h3>Message Content</h3>

          <div style="
            background:#ffffff;
            padding:15px;
            border-left:4px solid #12f7ff;
            white-space: pre-wrap;
          ">
            ${escapeHTML(message)}
          </div>
        </div>
      `,
    };

    // 4. Secure HTTPS Transmission via SendGrid Mail Delivery Engines
    try {
      await sgMail.send(mailOptions);
      console.log("✅ Email dispatched securely via SendGrid Web API engine endpoints.");

      return res.status(201).json({
        success: true,
        message: "Message processed and sent successfully.",
      });
    } catch (mailError) {
      console.error("❌ SendGrid Delivery Handshake Failure:");
      console.error(mailError.response ? mailError.response.body : mailError.message);

      // Graceful degraded state handling response
      return res.status(500).json({
        success: false,
        error: "Message archived into database, but system failed notification dispatch.",
      });
    }
  } catch (err) {
    console.error("❌ CRITICAL SERVER ERROR EXCEPTION TRACE:", err.message);
    return res.status(500).json({
      success: false,
      error: "Internal application processing block exception.",
    });
  }
});

// ============================================================================
// Service Check Root Endpoint Route
// ============================================================================
app.get("/", (req, res) => {
  res.send("Portfolio Backend Running Successfully 🚀");
});

// ============================================================================
// Bind Host Listener Thread Environment Configuration
// ============================================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server processing layout engine active on network port: ${PORT}`);
});