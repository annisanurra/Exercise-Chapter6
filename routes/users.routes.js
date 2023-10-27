const express = require('express');
const { register, login, authenticate, uploadProfilePicture, saveProfilePicture } = require('../controllers/users.controllers');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/authenticate', authenticate);
router.post('/upload-profile-picture', uploadProfilePicture, saveProfilePicture);

module.exports = router;