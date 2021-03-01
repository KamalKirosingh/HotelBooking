const Hotel = require('../models/hotel')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary")
const hotel = require('../models/hotel')

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}
// ************************************ 
// INDEX - renders multiple hotels 
// ************************************
module.exports.index = async (req, res) => {
    let noMatch = null
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
        const hotels = await Hotel.find({$or: [{title: regex}, {location: regex}]}).populate('popupText')
              if(hotels.length < 1) {
                  noMatch = "No hotels match that query, please try again."
                  res.render("hotels/index", { hotels, noMatch })
              }
              else {
                res.render("hotels/index", { hotels, noMatch })
              }
            }


            
    else {
        const hotels = await Hotel.find({}).populate('popupText')
        res.render('hotels/index', { hotels, noMatch })
    }
}
// **********************************
// NEW - renders a form
// **********************************
module.exports.renderNewForm = (req, res) => {
    res.render('hotels/new')
}
// *********************************
// CREATE - creates a new hotel
// *********************************
module.exports.createHotel = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    }).send()
    const hotel = new Hotel(req.body.hotel)
    hotel.geometry = geoData.body.features[0].geometry
    hotel.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    hotel.booking = {
        start: req.body.hotel.start,
        end: req.body.hotel.end
      }
    hotel.amneties = req.body.hotel.amneties.split(",")
    hotel.owner = {
        id: req.user._id,
        username: req.user.username
    }
    await hotel.save()
    console.log(hotel)
    req.flash('success', 'Successfully made a new hotel!')
    res.redirect(`/hotels/${hotel._id}`)
}
// **********************************************
// SHOW - details about one particular hotel
// **********************************************
module.exports.showHotel = async (req, res,) => {
    //populate the reviews with the authors, then populate the hotels with reviews and authors.
    const hotel = await Hotel.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!')
        return res.redirect('/hotels')
    }
    // if the user has made a review already
    const ratingsArray = []
    hotel.reviews.forEach(function(rating) {
        ratingsArray.push(rating.rating);
      })
      if (ratingsArray.length === 0) {
        hotel.rateAvg = 0;
      } else {
        const ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating;
        })
        hotel.rateAvg = ratings / hotel.reviews.length;
        hotel.rateCount = hotel.reviews.length;
      }
      hotel.save();
      res.render('hotels/show', { hotel })
}
      
// *******************************************
// EDIT - renders a form to edit a hotel
// *******************************************
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id)
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!')
        return res.redirect('/hotels')
    }
    res.render('hotels/edit', { hotel })
}
// *******************************************
// UPDATE - updates a particular hotel
// *******************************************
module.exports.updateHotel = async (req, res) => {
    const { id } = req.params
    const hotel = await Hotel.findByIdAndUpdate(id, { ...req.body.hotel })
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    }).send()
    hotel.geometry = geoData.body.features[0].geometry
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //... spreads the imgs array so that each element in imgs is passes seperately into hotels.images
    hotel.images.push(...imgs)
    await hotel.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await hotel.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated hotel!')
    res.redirect(`/hotels/${hotel._id}`)
}
// *******************************************
// BOOKING - renders the booking page
// *******************************************
module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params
    const hotel = await Hotel.findById(id)
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!')
        return res.redirect('/hotels')
    }
    res.render('hotels/booking', { hotel})
}
// *******************************************
// DELETE/DESTROY- removes a single hotel
// *******************************************
module.exports.deleteHotel = async (req, res) => {
    const { id } = req.params
    await Hotel.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted hotel')
    res.redirect('/hotels')
} 


