const mongoose = require('mongoose')
const Review = require('./review')
const Room = require('./room')
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

const HotelSchema = new Schema({
    title: String,
    images: [ImageSchema],
    phone: String,
    amenities: [],
    created: { type: Date, default: Date.now },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
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
    rooms: [{type: Schema.Types.ObjectId, ref: 'Room'}]
}, opts)


HotelSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/hotels/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

//middleware to delete all bookings, reviews and rooms when a hotel is deleted
//doc is the hotel that just got deleted
//if a post request is sent with 'findOneAndDelete', then this function will run
HotelSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
        await Room.deleteMany({
            _id: {
                $in: doc.rooms
            }
        })
    }
})
module.exports = mongoose.model('Hotel', HotelSchema)