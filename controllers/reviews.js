const Hotel = require('../models/hotel')
const Review = require('../models/review')

// *********************************** 
// CREATE - creates a new review 
// ***********************************
module.exports.createReview = async (req, res) => {
    const hotel = await Hotel.findById(req.params.id)
    let ratedArray = []
    hotel.hasRated.forEach(function(rated) {
      ratedArray.push(String(rated))
    })
    if (ratedArray.includes(String(req.user._id))) {
      req.flash('error', "You've already reviewed this hotel, please edit your review instead.")
      res.redirect(`/hotels/${hotel._id}`)
     } else {
        const review = new Review(req.body.review)
        review.author.id = req.user._id
        review.author.username = req.user.username
        hotel.hasRated.push(req.user._id)
        hotel.reviewCount = hotel.reviews.length
        hotel.reviews.push(review)
        await review.save()
        await hotel.save()
        req.flash('success', 'Created new review!')
        res.redirect(`/hotels/${hotel._id}`)
        }
    }
// *******************************************
// EDIT - edits a particular review
// *******************************************
module.exports.editReview = async (req, res) => {
    const { id, reviewId } = req.params
    const hotel = await Hotel.findById(id)
    const review = await Review.findByIdAndUpdate(reviewId, { ...req.body.review })
    await review.save()
    
    req.flash('success', 'Successfully updated review!')
    res.redirect(`/hotels/${hotel._id}`)
}
// ***************************************
// DELETE/DESTROY- removes a single review
// ***************************************
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Hotel.findByIdAndUpdate(id, { $pull: { hasRated: { $in: [review.author.id]}}})
    const hotel = await Hotel.findById(id)
    const reviewCount = hotel.reviewCount
    await Hotel.findByIdAndUpdate(id, {$set: {reviewCount: reviewCount-1}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/hotels/${id}`)
}