var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  const result = {
    status: 200,
    message: '기본 구조 구축 성공',
  }
  res.status(200).send(result);
});

module.exports = router;
