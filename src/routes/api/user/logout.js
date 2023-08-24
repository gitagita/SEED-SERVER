var express = require("express");
var router = express.Router();
var db = require('../../../../db');

var setResponse = (error, data, message, status) => {
    if (!error) status = 200;
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

/*
 * 로그아웃
 * @author yuna
 */
router.post("/", (req, res) => {
    const userEmail = req.body.userEmail;
    if(userEmail === undefined) {
        return res.send(setResponse(true, { 'sussess': false }, "로그아웃 실패(userEmail undefined)", 400));
    }

    const sql = "UPDATE token SET token = '' WHERE email = ?;";
    db.query(
        sql, [userEmail], (err, result) => {
            if(err) {
                res.send(setResponse(true, { 'sussess': false }, "로그아웃 실패(서버 내부 오류):"+err, 500));
            } else {
                //쿠키에서 토큰 삭제
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                res.send(setResponse(false, {'sussess': true}, "로그아웃 성공"));
            }
        }
    );
})

module.exports = router;