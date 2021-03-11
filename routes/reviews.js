const express = require('express')
const router = express.Router({ mergeParams: true })
const { validateReview, isLoggedIn, isReviewAuthor, isNotAdmin } = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, isNotAdmin, catchAsync(reviews.createReview))

router.put('/:reviewId', isLoggedIn, isReviewAuthor, isNotAdmin, catchAsync(reviews.editReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router