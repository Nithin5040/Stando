
const express = require('express');
const { getMessages, postMessage } = require('../controllers/chatController');
const router = express.Router();

router.route('/:bookingId')
    .get(getMessages)
    .post(postMessage);

module.exports = router;
