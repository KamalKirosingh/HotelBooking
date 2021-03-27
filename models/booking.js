const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    checkin: {type: Date},
    checkout: {type: Date},
    nights: {type: Number},
    amount: {type: Number},
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
      },
    guests: {type: Number},
    created: {
        type: Date,
        default: Date.now
    },
    isBooked : {type: Boolean, default: false}
})

module.exports = mongoose.model('Booking', BookingSchema)