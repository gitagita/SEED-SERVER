var express = require("express");
var router = express.Router();
var db = require('../../../../db');
const { smtpTransport } = require('./email');
require('dotenv').config();

var setResponse = (error, data, message, status) => {
    if (!error) status = 200;
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

/* min ~ max까지 랜덤으로 숫자를 생성하는 함수 */ 
var generateRandom = function (min, max) {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
}

/*
 * 이메일 인증
 * @author yuna
 */
router.post("/", async (req, res) => {
    const userEmail = req.body.userEmail;
    console.log(userEmail);
    if(userEmail === undefined || userEmail == '') {
        return res.send(setResponse(true, { 'auth': false }, "인증 이메일 전송 오류(userEmail 없음)", 400));
    }

    const number = generateRandom(111111,999999);

    const mailOptions = {
        from: process.env.MAILID,
        to: userEmail,
        subject: "[SEED] 이메일 주소 인증",
        text: "인증번호 6자리 : " + number
    };

    await smtpTransport.sendMail(mailOptions, (error, responses) => {
        if (error) {
            console.log(error);
            res.send(setResponse(true, {'auth': false}, "인증 이메일 전송 오류: "+error));
            smtpTransport.close();
            return;
        } else {
            res.send(setResponse(false, {'auth': true, 'number': number}, "이메일 인증 성공"));
            smtpTransport.close();
            return;
        }
    });
})

module.exports = router;