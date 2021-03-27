const express = require('express')
const router = express.Router({ mergeParams: true })
const bookings = require('../controllers/bookings')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isOwner, isNotOwner, isNotAdmin, validateBooking, isBookingAuthor, isBooked } = require('../middleware')

router.route('/')
    .get(isLoggedIn, isOwner, catchAsync(bookings.index))
    .post(isLoggedIn, isNotOwner, isNotAdmin, validateBooking, catchAsync(bookings.createBooking))

router.get('/new', isLoggedIn, isNotOwner, isNotAdmin, catchAsync(bookings.renderBookingForm))

router.route('/:bookingId')
    .get(isBookingAuthor, isBooked, catchAsync(bookings.showBooking))
    .delete(isLoggedIn, isBookingAuthor, catchAsync(bookings.deleteBooking))
    .post(isLoggedIn, isBookingAuthor, isNotOwner, isNotAdmin, catchAsync(bookings.submitPayment))

router.get('/:bookingId/payment', isLoggedIn, isBookingAuthor, isNotOwner, isNotAdmin, catchAsync(bookings.renderPaymentForm))

module.exports = router