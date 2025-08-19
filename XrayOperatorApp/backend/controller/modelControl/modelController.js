const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const pool = require('../../db');
const FormData = require('form-data');
const axios = require('axios');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = uuidv4();
    req.userId = userId;
    const userUploadPath = path.join('imgUploads', userId);
    fs.mkdir(userUploadPath, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, userUploadPath);
    });
  },
  filename: function (req, file, cb) {
    const uniqueFilename = req.userId + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});
const upload = multer({ storage: storage });

exports.uploadImg = [
  upload.single("uploadedFile"),
  async (req, res) => {
    try {
      const { userId } = req;
      const { username, age } = req.body;
      const imageFile = req.file;
      if (!username || !age || !imageFile || !userId) {
        return res.status(400).send("Username, age, and an image file are required.");
      }
      const imagePath = imageFile.path;
      const insertQuery = {
        text: "INSERT INTO users (id, username, age, image_path) VALUES ($1, $2, $3, $4) RETURNING *",
        values: [userId, username, age, imagePath],
      };
      const result = await pool.query(insertQuery);
      const newUser = result.rows[0];
      // ML server call and file save logic here...
      res.status(201).json({
        message: "User created and file uploaded successfully!",
        user: newUser,
      });
    } catch (err) {
      res.status(500).send("Server error during file upload process.");
    }
  }
];