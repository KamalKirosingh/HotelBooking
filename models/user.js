const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const Review = require('./review')
const Hotel = require('./hotel')
const Room = require('./room')
const Booking = require('./booking')

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    joined: { type: Date, default: Date.now },
    fullName: String,
    isAdmin: {type: Boolean, default: false},
    hotels: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Hotel'
        }
    ],
    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Room'
        }
    ],
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ],
    reviewsGiven: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    reviewsFor: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

UserSchema.plugin(passportLocalMongoose)

UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviewsGiven
            } 
        })
        await Review.deleteMany({
            _id: {
                $in: doc.reviewsFor
            } 
        })
        await Hotel.deleteMany({
            _id: {
                $in: doc.hotels
            }
        })
        await Room.deleteMany({
            _id: {
                $in: doc.rooms
            }
        })
        await Booking.deleteMany({
            _id: {
                $in: doc.bookings
            }
        })
    }
})

module.exports = mongoose.model('User', UserSchema)