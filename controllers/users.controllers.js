const { validationResult } = require('express-validator');
const { json } = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');

// Storage for profile picture uploads
const storage = multer.diskStorage({
 destination: path.join(__dirname, '../uploads'),
 filename: (req, file, cb) => {
    cb(null, `${req.user.id}.jpg`);
 },
});

const upload = multer({ storage });

exports.register = async (req, res) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
 return res.status(400).json({ errors: errors.array() });
 }

 try {
 const { email, password } = req.body;
 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser = await prisma.user.create({
   data: {
    email,
    password: hashedPassword,
    profiles: {
     create: {
      first_name: '',
      last_name: '',
      birth_date: '',
      profile_picture: '',
     },
    },
   },
 });

 return res.status(201).json(newUser);
 } catch (error) {
 return res.status(500).json({ error: error.message });
 }
};

exports.login = async (req, res) => {
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
 return res.status(400).json({ errors: errors.array() });
 }

 try {
 const { email, password } = req.body;
 const user = await prisma.user.findUnique({ where: { email } });

 if (!user) {
   return res.status(400).json({ error: 'Invalid email or password' });
 }

 const isValidPassword = await bcrypt.compare(password, user.password);

 if (!isValidPassword) {
   return res.status(400).json({ error: 'Invalid email or password' });
 }

 const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
   expiresIn: '7d',
 });

 return res.json({ token, user });
 } catch (error) {
 return res.status(500).json({ error: error.message });
 }
};

exports.authenticate = async (req, res) => {
 try {
 const user = await prisma.user.findUnique({
   where: { id: req.user.id },
   include: { profiles: true },
 });
 return res.json(user);
 } catch (error) {
 return res.status(500).json({ error: error.message });
 }
};

exports.uploadProfilePicture = upload.single('profile_picture');

exports.saveProfilePicture = async (req, res) => {
 const userId = req.user.id;

 try {
 const buffer = await sharp(req.file.path).resize({ width: 200, height: 200 }).png().toBuffer();
 await prisma.userProfile.update({
   where: { userId },
   data: { profile_picture: buffer.toString('base64') },
 });
 return res.json({ message: 'Profile picture uploaded successfully' });
 } catch (error) {
 return res.status(500).json({ error: error.message });
 } finally {
 await fs.unlink(req.file.path);
 }
};
