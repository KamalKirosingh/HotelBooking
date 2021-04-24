const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')
const { isLoggedIn, isProfileOwner } = require('../middleware')


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

router.route('/users/:userId')
.get(catchAsync(users.showProfile))
.put(isProfileOwner, catchAsync(users.updateProfile))
.delete(isProfileOwner, (users.deleteUser))

router.get('/users/:userId/edit', isLoggedIn, isProfileOwner, catchAsync(users.renderEditForm))

router.route('/forgot')
.get(users.renderForgot)
.post(users.forgot)

router.route('/reset/:token')
.get(users.renderReset)
.post(users.reset)

module.exports = router;