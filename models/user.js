const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    joined: { type: Date, default: Date.now },
    fullName: String,
    isAdmin: {type: Boolean, default: false},
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    hotels: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Hotel'
        }
    ]
})

UserSchema.plugin(passportLocalMongoose)

UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
        await Room.deleteMany({
            _id: {
                $in: doc.hotels
            }
        })
    }
})

module.exports = mongoose.model('User', UserSchema)