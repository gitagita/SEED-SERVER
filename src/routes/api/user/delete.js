var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const moment = require("moment");
const bcrypt = require('bcrypt');
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
 * 회원 탈퇴
 * @author yuna
 */
router.post("/", async (req, res) => {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    const reason = body.reason;
    let setting = [];

    if (userEmail === undefined || userPW === undefined) {
        return res.send(setResponse(true, { 'isDeleted': false }, "회원탈퇴 실패(필수요소 확인)"));
    }

    //회원 탈퇴 여부 확인
    let findUser = await userfunc.findUser(userEmail);
    if(findUser.status != 200){
        res.send(setResponse(true, { 'auth': false }, "회원 확인 오류", 400));
    } else {
        if(!findUser.data.exist) {
            res.send(setResponse(false, { 'exist': false }, "가입하지 않은 회원입니다."));
        } else if(findUser.data.withdrawal){
            res.send(setResponse(false, { 'withdrawal': true }, "탈퇴한 회원입니다."));
        } else {
            //회원 비밀번호 일치 여부 확인
            let checkPw = await userfunc.checkPassword(userEmail,userPW);
            if(!checkPw.data.corect){
                return res.send(setResponse(true, { 'modified': false }, "비밀번호 수정 실패("+checkPw.message+")"));
            }

            //회원 탈퇴정보 세팅
            setting.push(checkPw.data.userNo);
            setting.push(userEmail);
            if (reason) {
                setting.push(reason);
            } else {
                setting.push(null);
            }
            const date = moment().format("YYYY-MM-DDTHH:mm:ss");
            setting.push(date);
            
            //회원탈퇴로그
            const sql = "INSERT INTO member_withdrawal_log (memNo, email, reason, regDt) VALUES (?,?,?,?);";
            db.query(
                sql, setting, (err, result) => {
                    if (err) {
                        res.send(setResponse(true, err, "서버 내부 오류", 500));
                    } else {
                        //회원 탈퇴
                        const sql = "UPDATE member SET withdrawal = 1, modDt = ? WHERE email = ?;";
                        db.query(
                            sql, [date, userEmail], (err2, result) => {
                                if (err2) {
                                    res.send(setResponse(true, err2, "서버 내부 오류", 500));
                                } else {
                                    res.send(setResponse(false, { 'isDeleted': true }, "회원탈퇴 성공"));
                                }
                            }
                        );
                    }
                }
            );
        }
    }
});

module.exports = router;