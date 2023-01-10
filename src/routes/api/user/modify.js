var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const moment = require("moment");

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
 * 회원 정보 수정(이름, 이미지)
 * @author yuna
 */
router.post("/", function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    let sendmsg = "";
    let field = [];
    let setting = [];

    if (userEmail === undefined) {
        sendmsg = setResponse(true, { 'modified': false }, "회원정보 수정 실패(이메일 필수)");
        res.send(sendmsg);
        return;
    }

    if (body.userNickname) {  //회원 이름
        field.push("memNm = ?");
        setting.push(body.userNickname);
    }
    if (body.userProfileImage) {  //회원 이미지
        field.push("image = ?");
        setting.push(body.userProfileImage);
    }

    field.push("modDt = ?");    //수정일
    setting.push(moment().format("YYYY-MM-DDTHH:mm:ss"));

    const fields = field.join(', ');

    const sql = "UPDATE member SET " + fields + " WHERE email = '" + userEmail + "';";
    db.query(
        sql, setting, (err, result) => {
            if (err) {
                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                res.send(sendmsg);
            } else {
                sendmsg = setResponse(false, { 'modified': true, 'result': result }, "회원정보 수정 완료");
                res.send(sendmsg);
            }
        }
    );
});

module.exports = router;