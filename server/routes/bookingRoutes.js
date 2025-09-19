
const express = require('express');
const { 
    getAllBookings, 
    createBooking, 
    getBookingById, 
    updateBookingStatus, 
    verifyBookingLocation,
    getBookingsByUserId,
    acceptBooking,
    updateQueueInfo
} = require('../controllers/bookingController');

const router = express.Router();

router.route('/')
    .get(getAllBookings)
    .post(createBooking);

router.route('/:id')
    .get(getBookingById);

router.route('/user/:userId')
    .get(getBookingsByUserId);

router.route('/:id/status')
    .patch(updateBookingStatus);

router.route('/:id/verify')
    .patch(verifyBookingLocation);

router.route('/:id/accept')
    .patch(acceptBooking);

router.route('/:id/queue')
    .patch(updateQueueInfo);


module.exports = router;
