const express = require('express')
const router = express.Router({ mergeParams: true })
const rooms = require('../controllers/rooms')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isOwner, isNotAdmin, validateRoom } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
.get(catchAsync(rooms.index))
.post(isLoggedIn, isOwner, upload.array('image'), validateRoom, catchAsync(rooms.createRoom))

router.get('/new', isLoggedIn, isOwner, isNotAdmin, catchAsync(rooms.renderNewRoomForm))

router.route('/:roomId')
    .get(catchAsync(rooms.showRoom))
    .put(isLoggedIn, isOwner, upload.array('image'), validateRoom, catchAsync(rooms.updateRoom))
    .delete(isLoggedIn, isOwner, catchAsync(rooms.deleteRoom))

router.get('/:roomId/edit', isLoggedIn, isOwner, catchAsync(rooms.renderEditRoomForm))
    
module.exports = router