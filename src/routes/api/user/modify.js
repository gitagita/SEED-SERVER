var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const moment = require("moment");
const bcrypt = require('bcrypt');
const SEED_SALT = 12;
var userfunc = require('./userfunc');

var setResponse = (error, data, message, status) => {
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
router.post("/", async function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    let field = [];
    let setting = [];

    //유효성 검사
    if (userEmail === undefined) {
        return res.send(setResponse(true, { 'modified': false }, "회원정보 수정 실패(이메일 필수)"));
    }
    if (userPW === undefined) {
        return res.send(setResponse(true, { 'modified': false }, "회원정보 수정 실패(비밀번호 필수)"));
    }
    //회원 비밀번호 일치 여부 확인
    let checkPw = await userfunc.checkPassword(userEmail,userPW);
    if(!checkPw.data.corect){
        return res.send(setResponse(true, { 'modified': false }, "회원정보 수정 실패("+checkPw.message+")"));
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
                res.send(setResponse(true, err, "서버 내부 오류", 500));
            } else {
                res.send(setResponse(false, { 'modified': true, 'result': result }, "회원정보 수정 완료"));
            }
        }
    );
});

/*
 * 회원 비밀번호 수정
 * @author yuna
 */
router.post("/password", async function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    const newPW = body.newPW;

    if (userEmail === undefined) {
        return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패(이메일 필수)"));
    }
    if (userPW === undefined) {
        return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 필수)"));
    }
    if (newPW === undefined) {
        return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패(변경할 비밀번호 필수)"));
    }
    if (newPW === userPW) {
        return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패(현재 비밀번호와 변경하려는 비밀번호 일치)"));
    }

    //회원 비밀번호 일치 여부 확인
    let checkPw = await userfunc.checkPassword(userEmail,userPW);
    if(!checkPw.data.corect){
        return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패("+checkPw.message+")"));
    }

    //비밀번호 bcrypt 암호화 및 비밀번호 업데이트
    bcrypt.hash(newPW, SEED_SALT, (err, encryptedPW) => {
        if (err) {
            res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패(비밀번호 암호화 실패)"));
        } else {    //비밀번호 변경
            const modDt = moment().format("YYYY-MM-DDTHH:mm:ss");
            const sql = "UPDATE member SET password = ?, modDt = ? WHERE email = ?;";
            db.query(
                sql, [encryptedPW, modDt, userEmail], (err2, result) => {
                    if (err2) {
                        res.send(setResponse(true, err2, "서버 내부 오류", 500));
                    } else {
                        res.send(setResponse(false, { 'modified': true, 'result': result }, "비밀번호 수정 완료"));
                    }
                }
            );
        }
    })
});

module.exports = router;