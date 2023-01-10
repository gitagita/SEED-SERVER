var express = require("express");
var router = express.Router();
var db = require('./../../../../db');

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
    let sendmsg = "";
    let field = "email as memId, memNm, image";
    const sql = "SELECT " + field + " FROM member;";
    db.query(
        sql, (err, result) => {
            if (err) {
                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                res.send(sendmsg);
            } else {
                sendmsg = setResponse(false, result, "회원 조회 성공");
                res.send(sendmsg);
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
    let sendmsg = "";
    let field = "email as memId, memNm, image";
    const sql = "SELECT " + field + " FROM member WHERE email = '" + id + "';";
    db.query(
        sql, (err, result) => {
            if (err) {
                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                res.send(sendmsg);
            } else if (result.length == 0) {
                sendmsg = setResponse(true, err, "회원 조회 실패(해당 회원 아이디 정보 없음)");
                res.send(sendmsg);
            } else {
                sendmsg = setResponse(false, result, "회원 조회 성공");
                res.send(sendmsg);
            }
        }
    );
});

module.exports = router;