const express = require('express');
const router = express.Router();
const multer = require('multer');
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/checkin', auth, upload.single('face'), attendanceController.checkin);
router.post('/checkout', auth, upload.single('face'), attendanceController.checkout);

module.exports = router;
