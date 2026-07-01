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
// Nodemailer Configuration
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  family: 4, // Force IPv4

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
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

    // Save Message
    const newMessage = new Message({
      name,
      email,
      address,
      phone,
      message,
    });

    await newMessage.save();

    console.log("✅ Message saved to MongoDB.");

    // Mail Options
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 New Portfolio Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;">
          <h2 style="color:#12f7ff;">New Contact Form Submission</h2>

          <table cellpadding="8">
            <tr>
              <td><strong>Name:</strong></td>
              <td>${name}</td>
            </tr>

            <tr>
              <td><strong>Email:</strong></td>
              <td>${email}</td>
            </tr>

            <tr>
              <td><strong>Phone:</strong></td>
              <td>${phone || "Not Provided"}</td>
            </tr>

            <tr>
              <td><strong>Address:</strong></td>
              <td>${address || "Not Provided"}</td>
            </tr>
          </table>

          <hr>

          <h3>Message</h3>

          <div style="
            background:#ffffff;
            padding:15px;
            border-left:4px solid #12f7ff;
          ">
            ${message}
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
