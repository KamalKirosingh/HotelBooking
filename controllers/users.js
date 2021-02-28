const User = require('../models/user')
const Hotel = require('../models/hotel')
const Review = require('../models/review')

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
    res.redirect('/hotels')
} 
// **********************************************
// SHOW - details about the current user
// **********************************************
module.exports.showProfile = async (req, res,) => {
    //populate the reviews with the authors, then populate the hotels with reviews and authors.
    const user = await User.findById(req.params.id)
    const hotel = await Hotel.find({"owner" : { "id" : user._id}})
    const review = await Review.find({"author" : { "id" : user._id}})
    if (!user) {
        req.flash('error', 'Cannot find that hotel!')
        return res.redirect('/hotels')
    }
    console.log(hotel)
    res.render('users/profile', { hotel, user, review })
}