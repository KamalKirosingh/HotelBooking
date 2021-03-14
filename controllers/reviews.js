const Hotel = require('../models/hotel')
const Review = require('../models/review')
const Room = require('../models/room')
const User = require('../models/user')

// *********************************** 
// CREATE - creates a new review 
// ***********************************
module.exports.createHotelReview = async (req, res) => {
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
        review.hotel = hotel

        hotel.hasRated.push(req.user._id)
        hotel.reviewCount = hotel.reviews.length
        hotel.reviews.push(review)

        const user = await User.findById(req.user.id)
        user.reviewsGiven.push(review)

        console.log(hotel.owner.id)
        const hotelOwner = await User.findById(hotel.owner.id)
        hotelOwner.reviewsFor.push(review)

        await review.save()
        await hotel.save()
        await user.save()
        await hotelOwner.save()
        req.flash('success', 'Created new review!')
        res.redirect(`/hotels/${hotel._id}`)
        }
    }
// *******************************************
// EDIT - edits a particular review
// *******************************************
module.exports.editHotelReview = async (req, res) => {
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
module.exports.deleteHotelReview = async (req, res) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)

    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Hotel.findByIdAndUpdate(id, { $pull: { hasRated: { $in: [review.author.id]}}})

    const hotel = await Hotel.findById(id)
    let newReviewCount = hotel.reviewCount - 1
    if (newReviewCount < 0) {
        newReviewCount = 0
    }
    await Hotel.findByIdAndUpdate(id, {$set: {reviewCount: newReviewCount }})
   

    await User.findByIdAndUpdate(review.author.id, { $pull: { reviewsGiven: reviewId } })
    await User.findByIdAndUpdate(hotel.owner.id, { $pull: { reviewsFor: reviewId } })

    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/hotels/${id}`)
}


// *********************************** 
// CREATE - creates a new review 
// ***********************************
module.exports.createRoomReview = async (req, res) => {
    const { id, roomId} = req.params
    const room = await Room.findById(roomId)
    let ratedArray = []
    room.hasRated.forEach(function(rated) {
      ratedArray.push(String(rated))
    })
    if (ratedArray.includes(String(req.user._id))) {
      req.flash('error', "You've already reviewed this room, please edit your review instead.")
      res.redirect(`/hotels/${id}/rooms/${roomId}`)
     } else {
        const review = new Review(req.body.review)
        review.author.id = req.user._id
        review.author.username = req.user.username
        review.room = room

        room.hasRated.push(req.user._id)
        room.reviewCount = room.reviews.length
        room.reviews.push(review)

        const user = await User.findById(req.user.id)
        user.reviewsGiven.push(review)

        const roomOwner = await User.findById(room.owner.id)
        roomOwner.reviewsFor.push(review)

        await review.save()
        await room.save()
        await user.save()
        await roomOwner.save()
        req.flash('success', 'Created new review!')
        res.redirect(`/hotels/${id}/rooms/${roomId}`)
        }
    }
// *******************************************
// EDIT - edits a particular review
// *******************************************
module.exports.editRoomReview = async (req, res) => {
    const { id, roomId, reviewId } = req.params
    const review = await Review.findByIdAndUpdate(reviewId, { ...req.body.review })
    await review.save()
    
    req.flash('success', 'Successfully updated review!')
    res.redirect(`/hotels/${id}/rooms/${roomId}`)
}
// ***************************************
// DELETE/DESTROY- removes a single review
// ***************************************
module.exports.deleteRoomReview = async (req, res) => {
    const { id, roomId, reviewId } = req.params
    const review = await Review.findById(reviewId)

    await Room.findByIdAndUpdate(roomId, { $pull: { reviews: reviewId } })
    await Room.findByIdAndUpdate(roomId, { $pull: { hasRated: { $in: [review.author.id]}}})

    const room = await Room.findById(roomId)
    let newReviewCount = room.reviewCount - 1
    if (newReviewCount < 0) {
        newReviewCount = 0
    }
    await Room.findByIdAndUpdate(roomId, {$set: {reviewCount: newReviewCount }})
   

    await User.findByIdAndUpdate(review.author.id, { $pull: { reviewsGiven: reviewId } })
    await User.findByIdAndUpdate(room.owner.id, { $pull: { reviewsFor: reviewId } })

    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/hotels/${id}/rooms/${roomId}`)
}