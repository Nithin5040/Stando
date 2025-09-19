
const db = require('../config/db');

// @desc    Get all messages for a booking from the JSON column
// @route   GET /api/chat/:bookingId
// @access  Public
const getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const [rows] = await db.query('SELECT chat_history FROM bookings WHERE id = ?', [bookingId]);
        
        if (rows.length === 0) {
            return res.json([]);
        }
        
        const dbChatHistory = rows[0].chat_history;

        // mysql2/promise driver automatically parses JSON columns.
        // If dbChatHistory is NULL in the DB, it will be null here.
        // If it's a valid JSON array, it will be an array object.
        // We ensure we always return an array to the client.
        if (dbChatHistory && Array.isArray(dbChatHistory)) {
            res.json(dbChatHistory);
        } else {
            // If it's NULL, or somehow not an array, return empty.
            res.json([]);
        }

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Post a new message to a booking's chat history JSON column
// @route   POST /api/chat/:bookingId
// @access  Public
const postMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { sender, message_type, content } = req.body;

        if (!sender || !message_type || !content) {
            return res.status(400).json({ message: 'Missing required message fields' });
        }

        const newMessage = {
            id: Date.now(), // Unique ID for React keys
            sender,
            message_type,
            content,
            createdAt: new Date().toISOString()
        };

        // Atomically append the new message to the JSON array in the database.
        // COALESCE ensures that if chat_history is NULL, it's treated as an empty array '[]'.
        const query = 'UPDATE bookings SET chat_history = JSON_ARRAY_APPEND(COALESCE(chat_history, \'[]\'), \'$\', CAST(? AS JSON)) WHERE id = ?';
        
        // Stringify the newMessage object for the CAST to work correctly in SQL.
        const [result] = await db.query(query, [JSON.stringify(newMessage), bookingId]);

        if (result.affectedRows > 0) {
            res.status(201).json(newMessage); // Return the successfully saved message.
        } else {
            res.status(404).json({ message: 'Booking not found or failed to save message' });
        }

    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    postMessage,
};
