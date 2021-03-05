const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    joined: { type: Date, default: Date.now },
    fullName: String,
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)