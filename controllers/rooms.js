const Room = require('../models/room')
const Hotel = require('../models/hotel')
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
        const rooms = await Room.find({$or: [{title: regex}], "hotel.id" : id})
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
          const rooms = await Room.find({"hotel.id" : id}).sort({reviewAvg: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
           }
        else if (req.query.sortby === "reviewCount") {
          const rooms = await Room.find({"hotel.id" : id}).sort({reviewCount: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
          } 
        else if (req.query.sortby === "priceLow") {
        const rooms = await Room.find({"hotel.id" : id}).sort({price: 1})
        res.render("rooms/index", { hotel, rooms, noMatch })
       }
        else {
          const rooms = await Room.find({"hotel.id" : id}).sort({price: -1})
          res.render("rooms/index", { hotel, rooms, noMatch })
          }
  } else {
      const rooms = await Room.find({"hotel.id" : id})
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
    const hotel = await Hotel.findById(id)
    const room = new Room(req.body.room)
    room.hotel = hotel
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
    await room.save()
    await hotel.save()
    req.flash('success', 'Successfully made a new room!')
    res.redirect(`/hotels/${hotel._id}/rooms/${room._id}`)
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
        return res.redirect('/rooms')
    }
    // if the user has made a review already
    const ratingsArray = []
    room.reviews.forEach(function(rating) {
        ratingsArray.push(rating.rating);
      })
      if (ratingsArray.length === 0) {
        room.reviewAvg = 0;
      } else {
        const ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating;
        })
        room.reviewAvg = ratings / room.reviews.length;
        room.reviewCount = room.reviews.length;
      }
      room.save();
      res.render('rooms/show', { room, hotel })
}
      
// *******************************************
// EDIT - renders a form to edit a room
// *******************************************
module.exports.renderEditRoomForm = async (req, res) => {
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${hotel._id}/rooms`)
    }
    res.render('rooms/edit', { room, hotel })
}
// *******************************************
// UPDATE - updates a particular room
// *******************************************
module.exports.updateRoom = async (req, res) => {
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
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
    res.redirect(`/hotels/${hotel._id}/rooms/${room._id}`)
}
// *******************************************
// BOOKING - renders the booking page
// *******************************************
module.exports.renderBookingForm = async (req, res) => {
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
    const room = await Room.findById(roomId)
    if (!room) {
        req.flash('error', 'Cannot find that room!')
        return res.redirect(`/hotels/${hotel._id}/rooms`)
    }
    res.render('rooms/booking', { room, hotel })
}
// *******************************************
// DELETE/DESTROY- removes a single room
// *******************************************
module.exports.deleteRoom = async (req, res) => {
    const { id, roomId} = req.params
    const hotel = await Hotel.findById(id)
    await Room.findByIdAndDelete(roomId)
    req.flash('success', 'Successfully deleted room')
    res.redirect(`/hotels/${hotel._id}/rooms`)
} 


