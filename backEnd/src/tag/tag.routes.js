const express = require('express');
const auth = require('../middlewares/auth');
const tagController = require('./tag.controller');

// /api/tags
const router = express.Router();

router.get('/', tagController.getTags);
router.get('/popular', tagController.getPopularTags);
router.post('/recommend', auth, tagController.recommendTags);

module.exports = router;
