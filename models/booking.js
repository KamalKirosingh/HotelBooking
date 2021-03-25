const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
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
    dateCreated: {
        type: Date,
        default: Date.now
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
          ref: "Room"
    }
})

module.exports = mongoose.model('Booking', BookingSchema)