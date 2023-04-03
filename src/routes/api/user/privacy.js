var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const bcrypt = require('bcrypt');
var userfunc = require('./userfunc');

var setResponse = function (error, data, message, status) {
    if (!error) status = "200";
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

/*
 * 전체 회원 리스트 정보 조회(아이디(이메일), 이름, 이미지)
 * @author yuna
 */
router.get("/", function (req, res) {
    let field = "email as memId, memNm, image";
    const sql = "SELECT " + field + " FROM member WHERE withdrawal = 0;";
    db.query(
        sql, (err, result) => {
            if (err) {
                res.send(setResponse(true, err, "서버 내부 오류", 500));
            } else {
                res.send(setResponse(false, result, "회원 조회 성공"));
            }
        }
    );
});

/*
 * 해당 아이디(이메일)에 해당하는 회원 정보 조회(아이디(이메일), 이름, 이미지)
 * @author yuna
 */
router.get("/:id", function (req, res) {
    const id = req.params.id;
    let field = "email as memId, memNm, image";
    const sql = "SELECT " + field + " FROM member WHERE email = '" + id + "' AND withdrawal = 0;";
    db.query(
        sql, (err, result) => {
            if (err) {
                res.send(setResponse(true, err, "서버 내부 오류", 500));
            } else if (result.length == 0) {
                res.send(setResponse(true, err, "회원 조회 실패(해당 회원 아이디 정보 없음)"));
            } else {
                res.send(setResponse(false, result, "회원 조회 성공"));
            }
        }
    );
});

/*
 * 비밀번호 확인 yuna
 * @author yuna
 */
router.post("/:id/password", async function (req, res) {
    const userEmail = req.params.id;
    const body = req.body;
    const userPW = body.userPW;
    //비밀번호 일치여부 확인
    res.send(await userfunc.checkPassword(userEmail, userPW));
});

module.exports = router;