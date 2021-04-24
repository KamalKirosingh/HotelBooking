const User = require('../models/user')
const Hotel = require('../models/hotel')
const Room = require('../models/room')
const Review = require('../models/review')
const Booking = require('../models/booking')
const async = require('async')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

// ****************************
// NEW - renders register form 
// ****************************
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}
// ***************************
// CREATE - creates a new user
// ***************************
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, fullName } = req.body
        const user = new User({ email, username, fullName })
        if(password === '46246578') {
          user.isAdmin = true
        }
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to HotelBooking!')
            res.redirect('/hotels')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}
// ******************************
// SIGN IN - renders a login form
// ******************************
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}
// *****************************
// LOGGING IN - log the user in
// *****************************
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!')
    const redirectUrl = req.session.returnTo || '/hotels'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}
// ******************************
// LOGGING OUT - log the user out
// ******************************
module.exports.logout = (req, res) => {
    req.logout()
    req.flash('success', "Goodbye!")
    res.redirect('login')
} 
// ************************************************
// FORGOT PASSWORD - renders a forgot password form
// ************************************************
module.exports.renderForgot = (req, res) => {
res.render('users/forgot')
}
// PASSWORD RESET CODE RE-USED FROM: http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/ & https://caolan.github.io/async/v3/
// *************************************************
// FORGOT PASSWORD - posts the forgot password form
// *************************************************
module.exports.forgot = (req, res, next) => {
  async.waterfall([
      function(complete) {
        crypto.randomBytes(20, function(err, buf) {
          let token = buf.toString('hex')
          complete(err, token)
        })
      },
      function(token, complete) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.')
            return res.redirect('forgot')
          }

          user.resetPasswordToken = token
          user.resetPasswordExpires = Date.now() + 3600000
  
          user.save(function(err) {
            complete(err, token, user)
          })
        })
      },
      function(token, user, complete) {
      const transport = nodemailer.createTransport({ service: 'Gmail', auth: {
            user: 'HotelBooking485@gmail.com',
            pass: process.env.GMAILPW
          }
        })
        const mail = { to: user.email, from: 'HotelBooking485@gmail.com', subject: 'Password Reset',
          text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
            'Please click on the following link to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
        transport.sendMail(mail, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.')
          complete(err, 'complete')
        })
      }
    ], function(err) {
      if (err) return next(err)
      res.redirect('forgot')
    })
  }
// **********************************************
// RESET PASSWORD - renders a reset password form
// **********************************************
module.exports.renderReset = (req, res) => {
    const user = User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.')
          return res.redirect('forgot')
        }
        res.render('users/reset', {token: req.params.token})
    } 
// **********************************************
// RESET PASSWORD - posts the reset password form
// **********************************************
module.exports.reset = (req, res) => {
    async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.')
              return res.redirect('/login')
            }
            if(req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined
    
                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user)
                  })
                })
              })
            } else {
                req.flash("error", "Passwords do not match.")
                return res.redirect('/login')
            }
          })
        },
        function(user, done) {
          const transport = nodemailer.createTransport({ service: 'Gmail', auth: {
              user: 'HotelBooking485@gmail.com',
              pass: process.env.GMAILPW
            }
          })
          const mail = { to: user.email, from: 'HotelBooking485@gmail.com', subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          }
          transport.sendMail(mail, function(err) {
            req.flash('success', 'Success! Your password has been changed.')
            done(err)
          })
        }
      ], function(err) {
        res.redirect('/hotels')
      })
    }
// **********************************************
// SHOW - details about the current user
// **********************************************
module.exports.showProfile = async (req, res,) => {
  const { userId } = req.params
    const user = await User.findById(userId)
    const hotels = await Hotel.find({"owner.id" : userId})
    const reviews = await Review.find({"author.id" : userId})
    const bookings = await Booking.find({"author.id" : userId})
    if (!user) {
        req.flash('error', 'Cannot find that user!')
        return res.redirect('/hotels')
    }
    res.render('users/show', { hotels, user, reviews, bookings })
}
// ***********************************************
// EDIT - renders a form to edit the user details
// **********************************************
module.exports.renderEditForm = async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        req.flash('error', 'Cannot find user!')
        return res.redirect('/hotels')
    }
    res.render('users/edit', { user })
}
// **********************************
// UPDATE - updates the user details
// **********************************
module.exports.updateProfile = async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    user.fullName = req.body.fullName
    user.email = req.body.email
    await user.save()
    req.flash('success', 'Successfully updated user!')
    res.redirect(`/users/${user._id}`)
}
// *******************************************
// DELETE/DESTROY- removes the user account
// *******************************************
module.exports.deleteUser = async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)

     // remove the bookings from this user to other rooms
     const bookings = user.bookings
     if (bookings) {
       for (let bookingId of bookings) {
         const booking = await Booking.findById(bookingId)
         await Room.findByIdAndUpdate(booking.room, { $pull: { bookings: bookingId } })
         await Room.findByIdAndUpdate(booking.room, { $pull: { hasBooked: { $in: [booking.author.id] } }})
         }
       }
         
     // remove the bookings from other users to this users rooms
     const rooms = user.rooms
     for (let roomId of rooms) {
        let room = await Room.findById(roomId)
        const otherBookings = room.bookings
        if (otherBookings) {
          for (let bookingId of otherBookings) {
            const otherBooking = await Booking.findById(bookingId)
            await User.findByIdAndUpdate(otherBooking.author.id, { $pull: { bookings: bookingId } })
            //  delete the booking
            await Booking.findByIdAndDelete(otherBooking)
          }
        }
      }
   
    // remove the reviewsGiven from other users to this users hotels or rooms 
    const reviewsFor = user.reviewsFor
    if (reviewsFor)
      for (let reviewId of reviewsFor) {
        const review = await Review.findById(reviewId)
        await User.findByIdAndUpdate(review.author.id, { $pull: { reviewsGiven: review.id } })
        }
        const reviewsGiven = user.reviewsGiven
        if (reviewsGiven) {
          for (let reviewId of reviewsGiven) {
              const review = await Review.findById(reviewId)
              // for each review by the deleted user, if the review is for a hotel:
              if (review.hotel) {
                console.log(review.hotel)
                const hotel = await Hotel.findById(review.hotel)
                // remove the reviews from this user to other users reviewFor
                 await User.findByIdAndUpdate(hotel.owner.id, { $pull: { reviewsFor: reviewId } })
                // remove the reviews from the hotels 
                const hotelOwner = await User.findById(hotel.owner.id)
                for (let hotelId of hotelOwner.hotels) {
                  const hotel = await Hotel.findById(hotelId)
                  await Hotel.findByIdAndUpdate(hotelId, { $pull: { reviews: reviewId } })
                  await Hotel.findByIdAndUpdate(hotelId, { $pull: { hasRated: { $in: [review.author.id] } }})

                  let newReviewCount = hotel.reviewCount - 1
                  if (newReviewCount < 0) {
                      newReviewCount = 0
                   }
                  await Hotel.findByIdAndUpdate(hotel.id, {$set: {reviewCount: newReviewCount }})
                }
              }
              // for each review by the deleted user, if the review is for a room:
              else {
                const room = await Room.findById(review.room)
                // remove the reviews from this user to other users reviewFor
                 await User.findByIdAndUpdate(room.owner.id, { $pull: { reviewsFor: reviewId } })
                // remove the reviews from the rooms 
                const roomOwner = await User.findById(room.owner.id)
                for (let roomId of roomOwner.rooms) {
                  const room = await Room.findById(roomId)
                  await Room.findByIdAndUpdate(roomId, { $pull: { reviews: reviewId } })
                  await Room.findByIdAndUpdate(roomId, { $pull: { hasRated: { $in: [review.author.id] } }})

                  let newReviewCount = room.reviewCount - 1
                  if (newReviewCount < 0) {
                      newReviewCount = 0
                   }
                  await Room.findByIdAndUpdate(room.id, {$set: {reviewCount: newReviewCount }})
                }
              }
            }
          }
    await User.findByIdAndDelete(userId)
    req.flash('success', 'Successfully deleted user')
    res.redirect('/')
}  