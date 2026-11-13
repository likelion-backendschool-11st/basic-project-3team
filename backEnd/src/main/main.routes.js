const express = require('express');
const mainController = require('./main.controller');

const router = express.Router();

router.get('/', mainController.getQuestions);

module.exports = router;
