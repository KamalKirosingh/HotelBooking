const Room = require('../models/room')
const Review = require('../models/review')
const Hotel = require('../models/hotel')
const User = require('../models/user')
const Booking = require('../models/booking')
const { cloudinary } = require("../cloudinary")

//CODE RE-USED FROM: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex/6969486#6969486
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}
// ************************************ 
// INDEX - renders multiple rooms 
// ************************************
module.exports.index = async (req, res) => {
    let noMatch = null
    const { id } = req.params
    const hotel = await Hotel.findById(id)

    // if the user searches a room
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        const rooms = await Room.find({$or: [{title: regex}], "hotel" : { "_id" : id }})
              if(rooms.length < 1) {
                  noMatch = "No rooms match that query, please try again."
                  res.render("rooms/index", { hotel, rooms, noMatch })
              }
              else {
                res.render("rooms/index", { hotel, rooms, noMatch })
              }
            }
    // if the user filters
    else if (req.query.sortby) {
        if (req.query.sortby === "reviewAvg") {
          const rooms = await Room.find({"hotel" : { "_id" : id }}).sort({reviewAvg: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
           }
        else if (req.query.sortby === "reviewCount") {
          const rooms = await Room.find({"hotel" : { "_id" : id }}).sort({reviewCount: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
          } 
        else if (req.query.sortby === "priceLow") {
          const rooms = await Room.find({"hotel" : { "_id" : id }}).sort({price: 1})
          res.render("rooms/index", { hotel, rooms, noMatch })
       }
        else {
          const rooms = await Room.find({"hotel" : { "_id" : id }}).sort({price: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
          }
  } else {
      const rooms = await Room.find({"hotel" : { "_id" : id }})
      console.log(rooms)
      res.render('rooms/index', { hotel, rooms, noMatch })
    }
}
// **********************************
// NEW - renders a form
// **********************************
module.exports.renderNewRoomForm = async(req, res) => {
    const { id } = req.params
    const hotel = await Hotel.findById(id)
    res.render('rooms/new', { hotel })
}
// *********************************
// CREATE - creates a new room
// *********************************
module.exports.createRoom = async (req, res, next) => {
    const { id } = req.params
    const room = new Room(req.body.room)
    const user = await User.findById(req.user.id)

    const hotel = await Hotel.findById(id)
    room.hotel = hotel
    room.reviewCount = room.reviews.length
    room.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    room.booking = {
        start: req.body.room.start,
        end: req.body.room.end
      }
    room.amenities = req.body.room.amenities.split(",")
    room.owner = {
        id: req.user._id,
        username: req.user.username
    }
    hotel.rooms.push(room)
    user.rooms.push(room)
    await user.save()
    await room.save()
    await hotel.save()
    req.flash('success', 'Successfully made a new room!')
    res.redirect(`/hotels/${id}/rooms/${room._id}`)
}
// **********************************************
// SHOW - details about one particular room
// **********************************************
module.exports.showRoom = async (req, res,) => {
    //populate the reviews with the authors, then populate the rooms with reviews and authors.
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${hotel._id}/rooms`)
    }
    // if the user has made a review already
    const ratingsArray = []
    room.reviews.forEach(function(rating) {
        ratingsArray.push(rating.rating)
      })
      if (ratingsArray.length === 0) {
        room.reviewAvg = 0
      } else {
        const ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating
        })
        room.reviewAvg = ratings / room.reviews.length
        room.reviewCount = room.reviews.length
      }
      room.save()
      res.render('rooms/show', { room, hotel })
}
      
// *******************************************
// EDIT - renders a form to edit a room
// *******************************************
module.exports.renderEditRoomForm = async (req, res) => {
    const { id, roomId} = req.params
    const room = await Room.findById(roomId)
    const hotel = await Hotel.findById(id)
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${id}/rooms`)
    }
    res.render('rooms/edit', { room, hotel })
}
// *******************************************
// UPDATE - updates a particular room
// *******************************************
module.exports.updateRoom = async (req, res) => {
    const { id, roomId} = req.params
    const room = await Room.findByIdAndUpdate(roomId, { ...req.body.room })
    room.booking = {
        start: req.body.room.start,
        end: req.body.room.end
      }
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //... spreads the imgs array so that each element in imgs is passes seperately into rooms.images
    room.images.push(...imgs)
    await room.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await room.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated room!')
    res.redirect(`/hotels/${id}/rooms/${roomId}`)
}
// *******************************************
// DELETE/DESTROY- removes a single room
// *******************************************
module.exports.deleteRoom = async (req, res) => {
    const { id, roomId} = req.params
    const room = await Room.findById(roomId)

    // remove the bookings from other users to this room
    const bookings = room.bookings
    if (bookings) {
      for (let bookingId of bookings) {
        const booking = await Booking.findById(bookingId)
        await User.findByIdAndUpdate(booking.author.id, { $pull: { bookings: bookingId } })
        console.log("BOOKINGS REMOVED FROM AUTHORS")
       }
    }
    // remove the room from the owner
    await User.findByIdAndUpdate(room.owner.id, { $pull: { rooms: roomId } })
    console.log("ROOM REMOVED FROM OWNER")
     // remove the room from the hotel
    await Hotel.findByIdAndUpdate(id, { $pull: { rooms: roomId } })
    console.log("ROOM REMOVED FROM HOTEL")

    const reviews = room.reviews
    if (reviews) {
    // for each review to the room
        for (let reviewId of reviews) {
            const review = await Review.findById(reviewId)
            // remove the reviewGiven from the users to the room
            await User.findByIdAndUpdate(review.author.id, { $pull: { reviewsGiven: reviewId } })
            console.log("ROOM REVIEWGIVEN REMOVED FROM USER")
            // remove the reviewFor in the room owner
            await User.findByIdAndUpdate(room.owner.id, { $pull: { reviewsFor: reviewId } })
            console.log("REMOVEFOR FROM OWNER")
        }
    }

    await Room.findByIdAndDelete(roomId)
    req.flash('success', 'Successfully deleted room')
    res.redirect(`/hotels/${id}/rooms`)
} 

