const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for prototype
let messages = [
  { id: 1, author: 'System', text: 'Welcome to the Team Board!', timestamp: new Date() }
];

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Author and text are required' });
  }
  const newMessage = {
    id: Date.now(),
    author,
    text,
    timestamp: new Date()
  };
  messages.unshift(newMessage);
  // keep only last 50
  if (messages.length > 50) messages.pop();
  
  res.status(201).json(newMessage);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
