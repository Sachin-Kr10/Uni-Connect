const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

// Ensure user is verified to upload files
router.use(verifyAccessToken);

// 'image' is the name of the formData field the frontend will send
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid format' });
    }
    
    // Cloudinary automatically provides `req.file.path` as the secure URL
    res.status(200).json({
      message: 'Upload successful',
      url: req.file.path
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error processing file' });
  }
});

module.exports = router;
