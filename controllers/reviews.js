const Hotel = require('../models/hotel')
const Review = require('../models/review')

// *********************************** 
// CREATE - creates a new review 
// ***********************************
module.exports.createReview = async (req, res) => {
    const hotels = await Hotel.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author.id = req.user._id
    review.author.username = req.user.username
    // hotel.hasRated.push(req.user._id)
    // hotel.rateCount = hotel.comments.length
    hotels.reviews.push(review)
    await review.save()
    await hotels.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/hotels/${hotels._id}`)
}
// ***************************************
// DELETE/DESTROY- removes a single review
// ***************************************
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/hotels/${id}`)
}