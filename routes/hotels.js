const express = require('express')
const router = express.Router()
const hotels = require('../controllers/hotels')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isOwner, isNotOwner, validateHotel } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

//upload.array('image') has to be matches by the input name in the post request

router.route('/')
    .get(catchAsync(hotels.index))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync(hotels.createHotel))


router.get('/new', isLoggedIn, hotels.renderNewForm)

router.route('/:id')
    .get(catchAsync(hotels.showHotel))
    .put(isLoggedIn, isOwner, upload.array('image'), validateHotel, catchAsync(hotels.updateHotel))
    .delete(isLoggedIn, isOwner, catchAsync(hotels.deleteHotel))

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(hotels.renderEditForm))

router.get('/:id/booking', isLoggedIn, isNotOwner, catchAsync(hotels.renderBookingForm))
module.exports = router;