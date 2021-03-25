const express = require('express')
const router = express.Router()
const hotels = require('../controllers/hotels')
const rooms = require('../controllers/rooms')
const bookings = require('../controllers/bookings')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isOwner, isNotOwner, isNotAdmin, validateHotel, validateRoom, validateBooking, isBookingAuthor } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

//upload.array('image') has to be matches by the input name in the post request

// hotel routes

router.route('/')
    .get(catchAsync(hotels.index))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync(hotels.createHotel))


router.get('/new', isLoggedIn, isNotAdmin, hotels.renderNewForm)

router.route('/:id')
    .get(catchAsync(hotels.showHotel))
    .put(isLoggedIn, isOwner, upload.array('image'), validateHotel, catchAsync(hotels.updateHotel))
    .delete(isLoggedIn, isOwner, catchAsync(hotels.deleteHotel))

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(hotels.renderEditForm))

// room routes with booking

router.route('/:id/rooms')
.get(catchAsync(rooms.index))
.post(isLoggedIn, isOwner, upload.array('image'), validateRoom, catchAsync(rooms.createRoom))

router.get('/:id/rooms/new', isLoggedIn, isOwner, isNotAdmin, catchAsync(rooms.renderNewRoomForm))

router.route('/:id/rooms/:roomId')
    .get(catchAsync(rooms.showRoom))
    .put(isLoggedIn, isOwner, upload.array('image'), validateRoom, catchAsync(rooms.updateRoom))
    .delete(isLoggedIn, isOwner, catchAsync(rooms.deleteRoom))

router.get('/:id/rooms/:roomId/edit', isLoggedIn, isOwner, catchAsync(rooms.renderEditRoomForm))

router.route('/:id/rooms/:roomId/bookings')
    .get(isLoggedIn, isOwner, catchAsync(bookings.index))
    .post(isLoggedIn, isNotOwner, isNotAdmin, validateBooking, catchAsync(bookings.createBooking))

router.get('/:id/rooms/:roomId/bookings/new', isLoggedIn, isNotOwner, isNotAdmin, catchAsync(bookings.renderBookingForm))

router.route('/:id/rooms/:roomId/:bookingId')
    .get(isBookingAuthor, catchAsync(bookings.showBooking))
    .delete(isLoggedIn, isBookingAuthor, catchAsync(bookings.deleteBooking))
    .post(isLoggedIn, isBookingAuthor, isNotOwner, isNotAdmin, catchAsync(bookings.submitPayment))

router.get('/:id/rooms/:roomId/:bookingId/payment', isLoggedIn, isBookingAuthor, isNotOwner, isNotAdmin, catchAsync(bookings.renderPaymentForm))
    
module.exports = router;