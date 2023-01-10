const express = require('express');

const router = express.Router();

router.use('/api', require('./api'));

//회원 리스트 조회 api yuna
router.use('/user/privacy', require('./api/user/privacy'));

//회원 정보 수정 api yuna
router.use('/user/modify', require('./api/user/modify'));

module.exports = router;
