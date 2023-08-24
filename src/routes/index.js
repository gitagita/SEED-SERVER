const express = require('express');

const router = express.Router();

router.use('/api', require('./api'));

//회원 리스트 조회 api yuna
router.use('/user/privacy', require('./api/user/privacy'));

//회원 정보 수정 api yuna
router.use('/user/modify', require('./api/user/modify'));

//회원 등록 api yuna
router.use('/user/register', require('./api/user/register'));

//회원 탈퇴 api yuna
router.use('/user/delete', require('./api/user/delete'));

//회원 로그인 api yuna
router.use('/user/login', require('./api/user/login'));

//회원 로그아웃 api yuna
router.use('/user/logout', require('./api/user/logout'));

module.exports = router;
