const express = require('express');
const auth = require('../middlewares/auth');
const reportController = require('./report.controller');

const router = express.Router();

router.post('/', auth, reportController.createReport);

module.exports = router;
