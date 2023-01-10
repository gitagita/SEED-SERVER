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
 * 회원 등록
 * @author yuna
 */
router.post("/", function (req, res) {
    const body = req.body;
    const userPW = body.userPW;
    const userEmail = body.userEmail;
    const userNickname = body.userNickname;
    const policyAgree = body.policyAgree;

    let sendmsg = "";
    let setting = [];

    if (userPW === undefined || userEmail === undefined || userNickname === undefined || policyAgree === undefined) {    //회원가입 항목 검사
        sendmsg = setResponse(true, { 'signed': false }, "회원정보 수정 실패(필수 가입 항목 확인)");
        return res.send(sendmsg);
    }

    setting.push(userEmail);
    setting.push(userNickname);
    setting.push(policyAgree);
    setting.push(moment().format("YYYY-MM-DDTHH:mm:ss"));   //회원가입일

    //console.log(salt);return;
    //비밀번호 bcrypt 암호화
    bcrypt.hash(userPW, SEED_SALT, (err, encryptedPW) => {
        if (err) {
            sendmsg = setResponse(true, { 'signed': false }, "회원 가입 실패(비밀번호 암호화 실패) : " + err);
            res.send(sendmsg);
        } else {
            setting.push(encryptedPW);  //암호화된 비밀번호
            const sql = "INSERT INTO member (email, memNm, policyAgree, regDt, password) VALUE (?,?,?,?,?);";
            db.query(
                sql, setting, (err, result) => {
                    if (err) {
                        sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                        res.send(sendmsg);
                    } else {
                        sendmsg = setResponse(false, { 'signed': true, 'result': result }, "회원 가입 성공");
                        res.send(sendmsg);
                    }
                }
            );
        }
    })
});

module.exports = router;