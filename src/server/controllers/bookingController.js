
const db = require('../config/db');

const BASE_FARE = 49; // Base fare in rupees
const PER_MINUTE_RATE_STANDARD = 2; // Rate per minute for the first 45 mins
const PER_MINUTE_RATE_EXTENDED = 3; // Rate per minute after 45 mins
const STANDARD_DURATION_LIMIT = 45; // in minutes


// Helper function to format booking data from SQL results
const formatBooking = (bookingData) => {
    if (!bookingData) return null;
    return {
        id: bookingData.id,
        customer: bookingData.customer,
        customer_id: bookingData.customer_id,
        customerPhone: bookingData.customerPhone,
        service: bookingData.service,
        location: bookingData.location,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
        instructions: bookingData.instructions,
        status: bookingData.status,
        locationVerified: !!bookingData.locationVerified,
        queuePosition: bookingData.queuePosition,
        totalInQueue: bookingData.totalInQueue,
        progress: bookingData.progress,
        estimatedCost: bookingData.estimatedCost ? parseFloat(bookingData.estimatedCost) : null,
        finalCost: bookingData.finalCost ? parseFloat(bookingData.finalCost) : null,
        durationMinutes: bookingData.durationMinutes,
        agentPayout: bookingData.agentPayout ? parseFloat(bookingData.agentPayout) : null,
        agent: bookingData.agent_id ? {
            id: bookingData.agent_id,
            name: bookingData.agent_name,
            eta: bookingData.agent_eta,
            phone: bookingData.agent_phone,
            location: {
                lat: bookingData.agent_lat,
                lng: bookingData.agent_lng
            }
        } : null,
        createdAt: bookingData.createdAt,
    };
};

// Helper to generate a new booking ID
const generateBookingId = async () => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM bookings');
    const count = rows[0].count;
    return `BOOK${String(count + 1).padStart(3, '0')}`;
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public (for agent dashboard)
const getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.*,
                a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng,
                u.name as customer_name, u.email as customer_email
            FROM bookings b
            LEFT JOIN agents a ON b.agent_id = a.id
            LEFT JOIN users u ON b.customer_id = u.id
            ORDER BY b.createdAt DESC
        `;
        const [bookings] = await db.query(query);
        res.json(bookings.map(booking => {
            const formatted = formatBooking(booking);
            // Ensure customer name is populated even if user is deleted later
            if (formatted) {
                formatted.customer = booking.customer_name || formatted.customer;
            }
            return formatted;
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings for a specific user
// @route   GET /api/bookings/user/:userId
// @access  Private (user specific)
const getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT 
                b.*,
                a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng
            FROM bookings b
            LEFT JOIN agents a ON b.agent_id = a.id
            WHERE b.customer_id = ?
            ORDER BY b.createdAt DESC
        `;
        const [bookings] = await db.query(query, [userId]);
        res.json(bookings.map(formatBooking));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
    try {
        const { service, location, instructions, latitude, longitude, customer, customer_id, customerPhone } = req.body;
        if (!service || !location || !customer || !customer_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newBookingId = await generateBookingId();
        const newBooking = { 
            id: newBookingId,
            service, 
            location, 
            instructions, 
            latitude, 
            longitude, 
            customer,
            customer_id,
            customerPhone,
            status: 'Pending',
            chat_history: '[]' // Initialize with empty JSON array
        };

        const query = 'INSERT INTO bookings SET ?';
        await db.query(query, newBooking);
        
        // Return the newly created pending booking. Assignment is now handled by agent accepting the job.
        const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [newBookingId]);
        res.status(201).json(formatBooking(rows[0]));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.*,
                a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng
            FROM bookings b
            LEFT JOIN agents a ON b.agent_id = a.id
            WHERE b.id = ?
        `;
        const [rows] = await db.query(query, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(formatBooking(rows[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Public
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        let fieldsToUpdate = { status };

        if (status === 'In Progress') {
            fieldsToUpdate.progress = 10;
            fieldsToUpdate.estimatedCost = BASE_FARE;
        } else if (status === 'Completed') {
            // First, get the creation time to calculate duration
            const [bookingRows] = await db.query('SELECT createdAt, agent_id FROM bookings WHERE id = ?', [bookingId]);
            if (bookingRows.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            
            const agentId = bookingRows[0].agent_id;
            const createdAt = new Date(bookingRows[0].createdAt);
            const completedAt = new Date();
            const durationMinutes = Math.max(1, Math.round((completedAt - createdAt) / (1000 * 60))); // Ensure duration is at least 1 minute
            
            let finalCost = BASE_FARE;
            if (durationMinutes > STANDARD_DURATION_LIMIT) {
                const standardCost = STANDARD_DURATION_LIMIT * PER_MINUTE_RATE_STANDARD;
                const extendedMinutes = durationMinutes - STANDARD_DURATION_LIMIT;
                const extendedCost = extendedMinutes * PER_MINUTE_RATE_EXTENDED;
                finalCost += standardCost + extendedCost;
            } else {
                finalCost += durationMinutes * PER_MINUTE_RATE_STANDARD;
            }


            const agentPayout = finalCost * 0.7; // 70% payout

            fieldsToUpdate.progress = 100;
            fieldsToUpdate.durationMinutes = durationMinutes;
            fieldsToUpdate.finalCost = finalCost;
            fieldsToUpdate.agentPayout = agentPayout;
            
            // Make agent available again
            if (agentId) {
                await db.query('UPDATE agents SET isAvailable = TRUE WHERE id = ?', [agentId]);
            }
        }

        const updateQuery = 'UPDATE bookings SET ? WHERE id = ?';
        const [result] = await db.query(updateQuery, [fieldsToUpdate, bookingId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const [rows] = await db.query(`
            SELECT b.*, a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng 
            FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id WHERE b.id = ?`, [bookingId]);
        res.json(formatBooking(rows[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Agent accepts a booking
// @route   PATCH /api/bookings/:id/accept
// @access  Private (for agents)
const acceptBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId } = req.body;

        if (!agentId) {
            return res.status(400).json({ message: 'Agent ID is required' });
        }

        // Check if the booking is still pending
        const [bookingRows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (bookingRows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (bookingRows[0].status !== 'Pending') {
            return res.status(409).json({ message: 'Booking has already been taken' });
        }

        // Assign agent to booking, update status, and mark agent as unavailable
        await db.query('UPDATE bookings SET agent_id = ?, status = ? WHERE id = ?', [agentId, 'Queued', id]);
        await db.query('UPDATE agents SET isAvailable = FALSE WHERE id = ?', [agentId]);

        // Fetch and return the updated booking
        const [updatedRows] = await db.query(`
            SELECT b.*, a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng 
            FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id WHERE b.id = ?`, [id]);
        
        res.json(formatBooking(updatedRows[0]));

    } catch (error) {
        console.error('Error accepting booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify booking location
// @route   PATCH /api/bookings/:id/verify
// @access  Public
const verifyBookingLocation = async (req, res) => {
     try {
        const updateQuery = 'UPDATE bookings SET locationVerified = ?, progress = ? WHERE id = ?';
        const [result] = await db.query(updateQuery, [true, 50, req.params.id]);

        if (result.affectedRows === 0) {
             return res.status(404).json({ message: 'Booking not found' });
        }
        
        const [rows] = await db.query(`
            SELECT b.*, a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng 
            FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id WHERE b.id = ?`, [req.params.id]);
        res.json(formatBooking(rows[0]));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update queue position
// @route   PATCH /api/bookings/:id/queue
// @access  Private (for agents)
const updateQueueInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { queuePosition, totalInQueue } = req.body;

        if (queuePosition === undefined || totalInQueue === undefined) {
            return res.status(400).json({ message: 'Queue position and total are required' });
        }

        const [result] = await db.query('UPDATE bookings SET queuePosition = ?, totalInQueue = ? WHERE id = ?', [queuePosition, totalInQueue, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const [rows] = await db.query(`
            SELECT b.*, a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng 
            FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id WHERE b.id = ?`, [id]);
        res.json(formatBooking(rows[0]));

    } catch (error) {
        console.error('Error updating queue info:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getAllBookings,
    getBookingsByUserId,
    createBooking,
    getBookingById,
    updateBookingStatus,
    acceptBooking,
    verifyBookingLocation,
    updateQueueInfo
};
