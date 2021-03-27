const Booking = require('../models/booking')
const Room = require('../models/room')
const User = require('../models/user')
const Hotel = require('../models/hotel')

// ************************************ 
// INDEX - renders multiple bookings 
// ************************************
module.exports.index = async (req, res) => {
    const { id, roomId } = req.params
      const bookings = await Booking.find({"room" : { "_id" : roomId }})
      const room = await Room.findById(roomId)
      const hotel = await Hotel.findById(id)

      res.render('bookings/index', { hotel, room, bookings })
}
// *******************************************
// BOOKING - renders the booking page
// *******************************************
module.exports.renderBookingForm = async (req, res) => {
    const { id, roomId } = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${id}/bookings`)
    }
    res.render('bookings/new', { room, hotel })
}
// *********************************** 
// CREATE - creates a new booking 
// ***********************************
module.exports.createBooking = async (req, res) => {
    const { id, roomId } = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)

    let bookedArray = []
    room.hasBooked.forEach(function(booked) {
      bookedArray.push(String(booked))
    })
    if (bookedArray.includes(String(req.user._id))) {
        req.flash('error', "You can only make one booking at a time.")
        res.redirect(`/hotels/${id}/rooms/${roomId}`)
    } else {
        const booking = new Booking(req.body.booking)

        booking.author.id = req.user._id
        booking.author.username = req.user.username
        booking.hotel = hotel
        booking.room = room

        const checkin = booking.checkin
        const checkout = booking.checkout
        // BOOKING.NIGHTS CODE RE-USED FROM: https://www.w3resource.com/javascript-exercises/javascript-date-exercise-8.php
        booking.nights = Math.floor((Date.UTC(checkout.getFullYear(), checkin.getMonth(), checkout.getDate()) - Date.UTC(checkin.getFullYear(), checkin.getMonth(), checkin.getDate()) ) /(1000 * 60 * 60 * 24))

        booking.amount = room.price * booking.nights * booking.guests

        const roomAuthors = room.hasBooked
        if (!roomAuthors.includes(req.user.id)) {
            room.hasBooked.push(req.user._id)
        }
        room.bookings.push(booking)

        const user = await User.findById(req.user.id)
        user.bookings.push(booking)

        await room.save()
        await user.save()
        await booking.save()
        res.redirect(`/hotels/${id}/rooms/${roomId}/bookings/${booking._id}/payment`)
    }
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
const hotel = await Hotel.findById(id)
const room = await Room.findById(roomId)
const booking = await Booking.findById(bookingId)

booking.isBooked = true
await booking.save()

res.render('bookings/show', {hotel, room, booking})
}
// **********************************************
// SHOW - details about one particular booking
// **********************************************
module.exports.showBooking = async (req, res,) => {
    const { id, roomId, bookingId } = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)    
    const booking = await Booking.findById(bookingId)
    res.render('bookings/show', { hotel, room, booking })
}
// ***************************************
// DELETE/DESTROY- removes a single booking
// ***************************************
module.exports.deleteBooking = async (req, res) => {
    const { id, roomId, bookingId } = req.params
    const booking = await Booking.findById(bookingId)

    await Room.findByIdAndUpdate(roomId, { $pull: { bookings: bookingId } })
    await Room.findByIdAndUpdate(roomId, { $pull: { hasBooked: { $in: [booking.author.id] } }})

    await User.findByIdAndUpdate(booking.author.id, { $pull: { bookings: bookingId } })

    await Booking.findByIdAndDelete(bookingId)
    req.flash('success', 'Successfully deleted booking')
    res.redirect(`/hotels/${id}/rooms/${roomId}`)
}