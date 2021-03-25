const { hotelSchema, reviewSchema, roomSchema, bookingSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Hotel = require('./models/hotel')
const Review = require('./models/review')
const User = require('./models/user')
const Booking = require('./models/booking')
//use app.use as middleware to access any request to any route, 
//use functions like validateHotel to access any request to a specific route
//The "is" middleware are used to stop behind the scene unauthorised access to these routes, such as querying the link "/edit" manually.
//The unauthorised users are otherwise prevented access directly in the ejs files.

// *******************************************
// LOGIN MIDDLEWARE - If the user is logged in 
// *******************************************
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next()
}
// *********************************************************
// VALIDATE MIDDLEWARE - If the hotel req.body is valid 
// *********************************************************
module.exports.validateHotel = (req, res, next) => {
    //.validate uses the joi method
    const { error } = hotelSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// *******************************************************************
// HOTEL OWNER MIDDLEWARE - If the user is the hotel owner or admin
// *******************************************************************
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params
    const hotel = await Hotel.findById(id)
    if (!hotel.owner.id.equals(req.user._id) && !req.user.isAdmin) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/hotels/${id}`)
    }
    next()
}
// *******************************************************************
// HOTEL OWNER MIDDLEWARE - If the user is not the hotel owner or admin
// *******************************************************************
module.exports.isNotOwner = async (req, res, next) => {
    const { id } = req.params
    const hotel = await Hotel.findById(id)
    if (hotel.owner.id.equals(req.user._id)) {
        req.flash('error', 'You are the owner!')
        return res.redirect(`/hotels/${id}`)
    }
    next()
}
// ***********************************************************
// REVIEW AUTHOR MIDDLEWARE - If the user is the review author
// ***********************************************************
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.id.equals(req.user._id) && !req.user.isAdmin) {
        console.log(req.user)
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/hotels/${id}`)
    }
    next()
}
// ***************************************************** 
// VALIDATE MIDDLEWARE - If the review req.body is valid 
// *****************************************************
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
} 
// *************************************************************
// PROFILE OWNER MIDDLEWARE - If the user is the profile author
// *************************************************************
module.exports.isProfileOwner = async (req, res, next) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user._id.equals(req.user._id) && !req.user.isAdmin) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/hotels`)
    }
    next()
}
// ************************************************
// ADMIN MIDDLEWARE - If the user is not the admin
// ************************************************
module.exports.isNotAdmin = async (req, res, next) => {
    if (req.user.isAdmin) {
        req.flash('error', 'You are an admin!')
        return res.redirect(`/hotels`)
    }
    next()
}
// *********************************************************
// VALIDATE MIDDLEWARE - If the room req.body is valid 
// *********************************************************
module.exports.validateRoom = (req, res, next) => {
    //.validate uses the joi method
    const { error } = roomSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// *********************************************************
// VALIDATE MIDDLEWARE - If the booking req.body is valid 
// *********************************************************
module.exports.validateBooking = (req, res, next) => {
    //.validate uses the joi method
    const { error } = bookingSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// *************************************************************
// BOOKING AUTHOR MIDDLEWARE - If the user is the booking author
// *************************************************************
module.exports.isBookingAuthor = async (req, res, next) => {
    const { id, roomId, bookingId } = req.params
    const booking = await Booking.findById(bookingId)
    const hotel = await Hotel.findById(id)
    if (!booking.author.id.equals(req.user._id) && !hotel.owner.id.equals(req.user._id) && !req.user.isAdmin ) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/hotels/${id}/rooms/${roomId}`)
    }
    next()
}