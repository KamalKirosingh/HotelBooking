const Booking = require('../models/booking')
const Room = require('../models/room')
const User = require('../models/user')
const Hotel = require('../models/hotel')
// *******************************************
// BOOKING - renders the booking page
// *******************************************
module.exports.renderBookingForm = async (req, res) => {
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${id}/rooms`)
    }
    res.render('bookings/new', { room, hotel })
}
// *********************************** 
// CREATE - creates a new booking 
// ***********************************
module.exports.createBooking = async (req, res) => {
    const { id, roomId } = req.params

    const room = await Room.findById(roomId)
    const booking = new Booking(req.body.booking)

    booking.author.id = req.user._id
    booking.author.username = req.user.username
    booking.room = room

    const checkin = booking.checkin
    const checkout = booking.checkout
    // BOOKING.NIGHTS CODE RE-USED FROM: https://www.w3resource.com/javascript-exercises/javascript-date-exercise-8.php
    booking.nights = Math.floor((Date.UTC(checkout.getFullYear(), checkin.getMonth(), checkout.getDate()) - Date.UTC(checkin.getFullYear(), checkin.getMonth(), checkin.getDate()) ) /(1000 * 60 * 60 * 24))

    booking.amount = room.price * booking.nights * booking.guests
    room.bookings.push(booking)

    const user = await User.findById(req.user.id)
    user.bookings.push(booking)

    await room.save()
    await user.save()
    await booking.save()
    res.redirect(`/hotels/${id}/rooms/${roomId}/${booking._id}/payment`)
}
// *********************************** 
// PAYMENT - renders the payment form
// ***********************************
module.exports.renderPaymentForm = async (req, res) => {
const { id, roomId, bookingId } = req.params
const hotel = await Hotel.findById(id)
const room = await Room.findById(roomId)
const booking = await Booking.findById(bookingId)

res.render('bookings/payment', {hotel, room, booking})
}
// *********************************** 
// SUBMIT - submits the payment form
// ***********************************
module.exports.submitPayment = async (req, res) => {
const { id, roomId, bookingId } = req.params
req.flash('success', 'Successfully made booking!')
res.redirect(`/hotels/${id}/rooms/${roomId}/${bookingId}`)
}
// **********************************************
// SHOW - details about one particular booking
// **********************************************
module.exports.showBooking = async (req, res,) => {
    const booking = await Booking.findById(req.params.bookingId)
    res.render('bookings/show', { booking })
}
// ***************************************
// DELETE/DESTROY- removes a single booking
// ***************************************
module.exports.deleteBooking = async (req, res) => {
    const { id, roomId, bookingId } = req.params
    const booking = await Booking.findById(bookingId)

    await Room.findByIdAndUpdate(roomId, { $pull: { bookings: bookingId } })

    await User.findByIdAndUpdate(booking.author.id, { $pull: { bookings: bookingId } })

    await Booking.findByIdAndDelete(bookingId)
    req.flash('success', 'Successfully deleted booking')
    res.redirect(`/hotels/${id}/rooms/${roomId}`)
}