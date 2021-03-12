const express = require('express')
const router = express.Router({ mergeParams: true })
const { validateReview, isLoggedIn, isReviewAuthor, isNotAdmin } = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')

// hotel reviews
router.post('/reviews', isLoggedIn, validateReview, isNotAdmin, catchAsync(reviews.createHotelReview))

router.put('/reviews/:reviewId', isLoggedIn, isReviewAuthor, isNotAdmin, catchAsync(reviews.editHotelReview))

router.delete('/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteHotelReview))

// room reviews
router.post('/rooms/:roomId/reviews', isLoggedIn, validateReview, isNotAdmin, catchAsync(reviews.createRoomReview))

router.put('/rooms/:roomId/reviews/:reviewId', isLoggedIn, isReviewAuthor, isNotAdmin, catchAsync(reviews.editRoomReview))

router.delete('/rooms/:roomId/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteRoomReview))
module.exports = router