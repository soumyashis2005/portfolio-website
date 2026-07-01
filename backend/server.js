const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware Framework Configuration
app.use(cors()); // Enables cross-origin resource sharing requests from your frontend port
app.use(express.json()); // Parses incoming HTTP bodies containing JSON payloads cleanly

// Connect to MongoDB Database Daemon Instance
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connection established successfully.'))
  .catch(err => console.error('Database connection system failure:', err));

// Define Data Validation Schema Structures
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Setup Nodemailer SMTP Delivery Relay
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Rembember to use your unique 16-character Google App Password here
  }
});

// Primary HTTP POST Contact Data Ingest Route API Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, address, phone, message } = req.body;

    // Direct Parameter Validation Check
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please fulfill all required fields.' });
    }

    // Step 1: Commit submission details straight into MongoDB storage blocks
    const databaseRecord = new Message({ name, email, address, phone, message });
    await databaseRecord.save();

    // Step 2: Build an elegant responsive HTML alert template for your email alert
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Pings the update notification back to your own inbox
      subject: `💼 Portfolio Lead Notification: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; background-color: #f9f9f9; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #12f7ff; background: #250825; padding: 15px; border-radius: 6px; margin-top: 0; text-align: center;">New Client Lead Captured</h2>
          <p style="font-size: 16px;">You have received a new contact submission from your portfolio website:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #12f7ff; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${phone || 'None Provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Address:</td>
              <td style="padding: 8px 0;">${address || 'None Provided'}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
          <p style="font-weight: bold; font-size: 15px; margin-bottom: 10px;">Message Payload:</p>
          <div style="background: #250825; color: #f5f5f5; padding: 20px; border-radius: 6px; border-left: 4px solid #12f7ff; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${message}</div>
          <p style="font-size: 12px; color: #777; text-align: center; margin-top: 25px;">Logged and dispatched via Portfolio Backend System Engine Router.</p>
        </div>
      `
    };

    // Step 3: Trigger async background mail transmission 
    await transporter.sendMail(mailOptions);

    // Return successful verification headers back to client UI runtime environment
    res.status(201).json({ success: true, data: 'Message safely logged and forwarded.' });

  } catch (error) {
    console.error('API Server Route Internal Error Tracking Trace:', error);
    res.status(500).json({ success: false, error: 'Internal system fault. Submission failed.' });
  }
});

// Bind Port Target Listener Contexts
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend service node core actively runtime processing on port ${PORT}`));