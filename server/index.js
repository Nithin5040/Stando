
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // db is now the pool
const bookingRoutes = require('./routes/bookingRoutes');
const agentRoutes = require('./routes/agentRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Import chat routes

// Load environment variables from server/.env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes); // Use chat routes

// Root endpoint
app.get('/', (req, res) => {
  res.send('Stando Backend is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
