

const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Helper function to calculate distance between two lat/lng points
const getDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344 // convert to KM
        return dist;
    }
}


// @desc    Register a new agent
// @route   POST /api/agents/register
// @access  Public
const registerAgent = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        
        // Check if agent with that email already exists
        const [agentExists] = await db.query('SELECT * FROM agents WHERE email = ?', [email]);
        if (agentExists.length > 0) {
            return res.status(400).json({ message: 'An agent with this email already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new agent ID
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM agents');
        const agentCount = countResult[0].count;
        const agentId = `AGENT${String(agentCount + 1).padStart(3, '0')}`;
        
        // Default location for new agent (can be updated later)
        const lat = 28.6139;
        const lng = 77.2090;

        const newAgent = {
            id: agentId,
            name,
            email,
            phone,
            password: hashedPassword,
            lat,
            lng,
            eta: '15 mins' // A default eta
        };

        const query = 'INSERT INTO agents SET ?';
        const [result] = await db.query(query, newAgent);
        
        if (result && result.affectedRows > 0) {
            res.status(201).json({
                id: agentId,
                name: name,
                email: email,
                phone: phone,
            });
        } else {
            res.status(400).json({ message: 'Invalid agent data' });
        }

    } catch (error) {
        console.error("Agent registration error:", error);
        res.status(500).json({ message: 'Server Error during agent registration' });
    }
};

// @desc    Authenticate agent & get token
// @route   POST /api/agents/login
// @access  Public
const loginAgent = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
             return res.status(400).json({ message: 'Please provide email and password' });
        }

        const [agents] = await db.query('SELECT * FROM agents WHERE email = ?', [email]);
        if (agents.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const agent = agents[0];

        // The password in the DB might be null if created before the field was added
        if (!agent.password) {
            return res.status(400).json({ message: 'Account is not properly configured. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, agent.password);

        if (isMatch) {
            res.json({
                id: agent.id,
                name: agent.name,
                email: agent.email,
                phone: agent.phone,
                location: {
                    lat: agent.lat,
                    lng: agent.lng,
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Agent login error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
const getAgents = async (req, res) => {
    try {
        const [agents] = await db.query("SELECT id, name, eta, phone, lat, lng, isAvailable FROM agents");

        const formattedAgents = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            phone: agent.phone,
            eta: agent.eta,
            location: {
                lat: agent.lat,
                lng: agent.lng
            },
            isAvailable: !!agent.isAvailable
        }));

        res.json(formattedAgents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Find closest available agent and assign to booking
// @route   POST /api/agents/assign
// @access  Internal
const findAndAssignAgent = async (booking) => {
    try {
        const [agents] = await db.query('SELECT * FROM agents WHERE isAvailable = TRUE');
        if (agents.length === 0) {
            return null; // No agents available
        }

        let closestAgent = null;
        let minDistance = Infinity;

        agents.forEach(agent => {
            const distance = getDistance(booking.latitude, booking.longitude, agent.lat, agent.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closestAgent = agent;
            }
        });

        if (closestAgent) {
            // Assign agent to booking and mark agent as unavailable
            await db.query('UPDATE bookings SET agent_id = ?, status = ? WHERE id = ?', [closestAgent.id, 'Queued', booking.id]);
            await db.query('UPDATE agents SET isAvailable = FALSE WHERE id = ?', [closestAgent.id]);
            
            // Fetch and return the updated booking with agent details
            const [rows] = await db.query(`
                SELECT b.*, a.id as agent_id, a.name as agent_name, a.eta as agent_eta, a.phone as agent_phone, a.lat as agent_lat, a.lng as agent_lng 
                FROM bookings b LEFT JOIN agents a ON b.agent_id = a.id WHERE b.id = ?`, [booking.id]);
            return rows[0];
        }
        return null;

    } catch (error) {
        console.error('Error in findAndAssignAgent:', error);
        throw error;
    }
};

// @desc    Update agent's location
// @route   PATCH /api/agents/:id/location
// @access  Private (for agents)
const updateAgentLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const [result] = await db.query('UPDATE agents SET lat = ?, lng = ? WHERE id = ?', [lat, lng, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        const [updatedAgents] = await db.query('SELECT * FROM agents WHERE id = ?', [id]);

        res.json({
            id: updatedAgents[0].id,
            name: updatedAgents[0].name,
            location: {
                lat: updatedAgents[0].lat,
                lng: updatedAgents[0].lng,
            },
            message: 'Location updated successfully',
        });

    } catch (error) {
        console.error('Error updating agent location:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { getAgents, registerAgent, loginAgent, findAndAssignAgent, updateAgentLocation };

    