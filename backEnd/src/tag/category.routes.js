const express = require('express');
const tagController = require('./tag.controller');

// /api/categories — 카테고리는 태그와 함께 tag 폴더에서 관리한다.
const router = express.Router();

router.get('/', tagController.getCategories);

module.exports = router;
