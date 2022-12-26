var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const moment = require("moment");
const bcrypt = require('bcrypt');
const SEED_SALT = 12;

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

/*
 * 회원 비밀번호 수정
 * @author yuna
 */
router.post("/password", function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    const newPW = body.newPW;
    let sendmsg = "";
    if (userEmail === undefined) {
        sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(이메일 필수)");
        return res.send(sendmsg);
    }
    if (userPW === undefined) {
        sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 필수)");
        return res.send(sendmsg);
    }if (newPW === undefined) {
        sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(변경할 비밀번호 필수)");
        return res.send(sendmsg);
    }

    //비밀번호 일치여부 확인
    const sqlCheckPw = "SELECT password FROM member WHERE email = '" + userEmail + "';";
    db.query(
        sqlCheckPw, (err, result) => {
            if (err) {
                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                res.send(sendmsg);
            } else {
                if (result.length != 0 && result[0].password != undefined) {
                    //비밀번호 일치여부 검사
                    bcrypt.compare(userPW, result[0].password, (err, response) => {
                        if (response) {
                            console.log(response);
                            //비밀번호 bcrypt 암호화
                            bcrypt.hash(newPW, SEED_SALT, (err, encryptedPW) => {
                                if (err) {
                                    sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 암호화 실패)");
                                    res.send(sendmsg);
                                } else {    //비밀번호 변경
                                    const modDt = moment().format("YYYY-MM-DDTHH:mm:ss");
                                    const sql = "UPDATE member SET password = ?, modDt = ? WHERE email = ?;";
                                    db.query(
                                        sql, [encryptedPW, modDt, userEmail], (err, result) => {
                                            if (err) {
                                                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                                                res.send(sendmsg);
                                            } else {
                                                sendmsg = setResponse(false, { 'modified': true, 'result': result }, "비밀번호 수정 완료");
                                                res.send(sendmsg);
                                            }
                                        }
                                    );
                                }
                            })
                        } else {
                            sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 불일치)");
                            res.send(sendmsg);
                        }
                    })
                } else {
                    sendmsg = setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 조회 에러) : " + err);
                    res.send(sendmsg);
                }
            }
        }
    );
});


module.exports = router;