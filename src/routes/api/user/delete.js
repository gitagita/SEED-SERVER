var express = require("express");
var router = express.Router();
var db = require('./../../../../db');
const moment = require("moment");
const bcrypt = require('bcrypt');

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
 * 회원 탈퇴
 * @author yuna
 */
router.post("/", function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    const reason = body.reason;
    let sendmsg = "";
    let setting = [];

    if (userEmail === undefined || userPW === undefined) {
        sendmsg = setResponse(true, { 'isDeleted': false }, "회원탈퇴 실패(필수요소 확인)");
        res.send(sendmsg);
        return;
    }

    //비밀번호 일치여부 확인
    const sqlCheckPw = "SELECT memNo, password FROM member WHERE email = '" + userEmail + "' AND withdrawal = 0;";
    db.query(
        sqlCheckPw, (err, result) => {
            console.log(result);
            if (err) {
                sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                res.send(sendmsg);
            } else {
                if (result.length != 0 && result[0].password != undefined) {
                    //비밀번호 일치여부 검사
                    bcrypt.compare(userPW, result[0].password, (err2, response) => {
                        if (response) {
                            setting.push(result[0].memNo);
                            setting.push(userEmail);
                            if (reason) {
                                setting.push(reason);
                            } else {
                                setting.push(null);
                            }
                            setting.push(moment().format("YYYY-MM-DDTHH:mm:ss"));
                            
                            //회원탈퇴로그
                            const sql = "INSERT INTO member_withdrawal_log (memNo, email, reason, regDt) VALUE (?,?,?,?);";
                            db.query(
                                sql, setting, (err3, result) => {
                                    if (err3) {
                                        sendmsg = setResponse(true, err3, "서버 내부 오류", 500);
                                        res.send(sendmsg);
                                    } else {
                                        //회원 탈퇴
                                        const sql = "UPDATE member SET withdrawal = 1 WHERE email = '" + userEmail + "';";
                                        db.query(
                                            sql, setting, (err4, result) => {
                                                if (err4) {
                                                    sendmsg = setResponse(true, err, "서버 내부 오류", 500);
                                                    res.send(sendmsg);
                                                } else {
                                                    sendmsg = setResponse(false, { 'isDeleted': true }, "회원탈퇴 성공");
                                                    res.send(sendmsg);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        } else {
                            sendmsg = setResponse(true, { 'isDeleted': false }, "회원탈퇴 실패(비밀번호 불일치)");
                            res.send(sendmsg);
                        }
                    })
                } else {
                    sendmsg = setResponse(true, { 'isDeleted': false }, "회원탈퇴 실패");
                    res.send(sendmsg);
                }
            }
        }
    );
});

module.exports = router;