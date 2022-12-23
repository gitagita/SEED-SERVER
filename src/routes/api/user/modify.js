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
 * 해당 아이디(이메일)에 해당하는 회원 정보 수정(이름, 이미지, 비밀번호)
 * @author yuna
 */
router.post("/:id", function (req, res) {
    const body = req.body;
    let sendmsg = "";
    const id = req.params.id;
    let field = [];
    let setting = [];

    if (!body.userPW) {    //비밀번호 필수
        sendmsg = setResponse(true, { 'modified': false }, "회원정보 수정 실패(비밀번호 필수)");
        res.send(sendmsg);
        return;
    }

    //비밀번호 일치여부 확인
    //로그인api 비밀번호 암호 구현 후 추가 예정 yuna

    if (body.userNickname) {  //회원 이름
        field.push("memNm = ?");
        setting.push(body.userNickname);
    }
    if (body.userProfileImage) {  //회원 이미지
        field.push("image = ?");
        setting.push(body.userProfileImage);
    }
    //수정일
    field.push("modDt = ?");
    setting.push(moment().format("YYYY-MM-DDTHH:mm:ss"));

    const fields = field.join(', ');

    const sql = "UPDATE member SET " + fields + " WHERE email = '" + id + "';";
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