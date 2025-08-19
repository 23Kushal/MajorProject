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
      

      // ---  call the Python ML Server ---

      // 1. Create a new form instance
      const form = new FormData();

      // 2. Read the saved image file into a buffer
      const imageBuffer = fs.readFileSync(imagePath);

      // 3. Append the data in the format the Python server expects
      form.append('request_uuid', userId);
      form.append('image', imageBuffer, { filename: imageFile.filename }); // Pass buffer and original filename

      try {
        console.log("Sending image to ML server for processing...");
        const mlResponse = await axios.post('http://127.0.0.1:8000/process-image/', form, {
            headers: {
                ...form.getHeaders()
            },
            // IMPORTANT: If you want to save the returned image, get it as a buffer
            responseType: 'arraybuffer' 
        });

        console.log("Successfully received processed image from ML server.");
        
        // Isolate the original filename WITHOUT its extension 
        const originalFilename = path.basename(imagePath, path.extname(imagePath));

        // Get the directory where the original file is located ("imgUploads/some-uuid/")
        const directory = path.dirname(imagePath);

        // Create the new filename 
        const newFilename = `${originalFilename} Analyzed.png`;

        // Join the directory and the new filename to create the full, correct path
        const newAnalyzedPath = path.join(directory, newFilename);

        // Save the image data to this new path
        fs.writeFileSync(newAnalyzedPath, mlResponse.data);

        console.log(`Original file remains: ${imagePath}`);
        console.log(`New analyzed file saved as: ${newAnalyzedPath}`);

    } catch (mlError) {
        console.error("Error calling ML server:", mlError.message);
        // Continue but maybe log this failure
    }

    
      res.status(201).json({
        message: "User created and file uploaded successfully!",
        user: newUser,
      });
    } catch (err) {
      res.status(500).send("Server error during file upload process.");
    }
  }
];