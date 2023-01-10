const express = require('express');

const router = express.Router();

router.use('/api', require('./api'));

//회원 리스트 조회 api yuna
router.use('/user/privacy', require('./api/user/privacy'));

module.exports = router;
