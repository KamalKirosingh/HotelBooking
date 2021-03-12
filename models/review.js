const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    created: { type: Date, default: Date.now },
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
      },
      rating: Number
    })
module.exports = mongoose.model("Review", ReviewSchema)