

const express = require('express');
const { getAgents, registerAgent, loginAgent, updateAgentLocation } = require('../controllers/agentController');
const router = express.Router();

router.get('/', getAgents);
router.post('/register', registerAgent);
router.post('/login', loginAgent);
router.patch('/:id/location', updateAgentLocation);

module.exports = router;

    