const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const { isLoggedIn } = require('../middleware');
// const { validateUser } = require('../middleware')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

router.get('/users/:id', isLoggedIn, users.showProfile)

module.exports = router;
