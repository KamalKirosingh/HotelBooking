const mongoose = require('mongoose')
const Review = require('./review')
const Booking = require('./booking')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//set each image to a width of 200 px by changing the API link from coudinary
//.virtual means we can do image.thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }

const RoomSchema = new Schema({
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel'},
    title: String,
    images: [ImageSchema],
    price: Number,
    amenities: [],
    created: { type: Date, default: Date.now },
    description: String,
    owner: {
        id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
        },
        username: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    reviewAvg: Number,
    reviewCount: Number,
    hasRated: [
        {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
        }
    ],
    bookings: [ {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }],
}, opts)


//middleware to delete all reviews and bookings when a room is deleted
//doc is the room that just got deleted
//if a post request is sent with 'findOneAndDelete', then this function will run
RoomSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
        await Booking.deleteMany({
            _id: {
                $in: doc.bookings
            }
        })
    }
})
module.exports = mongoose.model('Room', RoomSchema)