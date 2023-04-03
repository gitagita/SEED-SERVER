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
    let setting = [];

    if (userPW === undefined || userEmail === undefined || userNickname === undefined || policyAgree === undefined) {    //회원가입 항목 검사
        return res.send(setResponse(true, { 'signed': false }, "회원정보 수정 실패(필수 가입 항목 확인)"));
    }

    //이메일 중복 검사
    const sqlCheck = "SELECT COUNT(email) as userCnt FROM member WHERE email = '" + userEmail + "';";
    db.query(
        sqlCheck, setting, (err, result) => {
            if (err) {
                res.send(setResponse(true, err, "서버 내부 오류", 500));
            } else {
                if(result.length != 0 && result[0].userCnt > 0){
                    res.send(setResponse(true, { 'signed': false }, "회원 가입 실패(아이디 중복)"));
                } else {
                    setting.push(userEmail);
                    setting.push(userNickname);
                    setting.push(policyAgree);
                    setting.push(moment().format("YYYY-MM-DDTHH:mm:ss"));   //회원가입일

                    //비밀번호 bcrypt 암호화
                    bcrypt.hash(userPW, SEED_SALT, (err2, encryptedPW) => {
                        if (err2) {
                            res.send(setResponse(true, { 'signed': false }, "회원 가입 실패(비밀번호 암호화 실패) : " + err2));
                        } else {
                            setting.push(encryptedPW);  //암호화된 비밀번호
                            const sql = "INSERT INTO member (email, memNm, policyAgree, regDt, password) VALUE (?,?,?,?,?);";
                            db.query(
                                sql, setting, (err3, result) => {
                                    if (err3) {
                                        res.send(setResponse(true, err3, "서버 내부 오류", 500));
                                    } else {
                                        res.send(setResponse(false, { 'signed': true, 'result': result }, "회원 가입 성공"));
                                    }
                                }
                            );
                        }
                    })
                }
            }
        }
    );
});

module.exports = router;