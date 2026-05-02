const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Logging } = require('@google-cloud/logging');

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// Google Cloud Services Integration
// ==========================================
const logging = new Logging();
const log = logging.log('team-board-log');

/**
 * Helper to write structured logs to Google Cloud Logging
 * @param {string} message - The log message
 * @param {string} severity - Log severity (INFO, WARNING, ERROR)
 */
async function writeLog(message, severity = 'INFO') {
    try {
        const metadata = { resource: { type: 'global' }, severity };
        const entry = log.entry(metadata, message);
        await log.write(entry);
    } catch (err) {
        // Fallback for local development if ADC isn't configured
        console.error(`[${severity}] ${message}`);
    }
}

// ==========================================
// Security & Efficiency Middlewares
// ==========================================
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Gzip compression for efficient asset delivery
app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store (for prototype efficiency)
let messages = [
  { id: 1, author: 'System', text: 'Welcome to the Team Board!', timestamp: new Date() }
];

// ==========================================
// API Routes
// ==========================================
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    writeLog(`Failed post attempt by ${author || 'Unknown'}`, 'WARNING');
    return res.status(400).json({ error: 'Author and text are required' });
  }
  
  const newMessage = {
    id: Date.now(),
    author: String(author).trim(),
    text: String(text).trim(),
    timestamp: new Date()
  };
  
  messages.unshift(newMessage);
  if (messages.length > 50) messages.pop(); // Keep memory usage low
  
  writeLog(`New message posted by ${author}`, 'INFO');
  res.status(201).json(newMessage);
});

// Export app for testing purposes
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        writeLog(`Server started on port ${PORT}`, 'INFO');
    });
}
