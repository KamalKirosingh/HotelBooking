const User = require('../models/user');

// ****************************
// NEW - renders register form 
// ****************************
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
// ***************************
// CREATE - creates a new user
// ***************************
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/hotels');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}
// ******************************
// SIGN IN - renders a login form
// ******************************
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}
// *****************************
// LOGGING IN - log the user in
// *****************************
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/hotels';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
// ******************************
// LOGGING OUT - log the user out
// ******************************
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/hotels');
} 