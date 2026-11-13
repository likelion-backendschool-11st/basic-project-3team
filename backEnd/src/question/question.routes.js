const express = require('express');
const questionController = require('./question.controller');

const router = express.Router();

router.get('/search', questionController.searchQuestions);

module.exports = router;
