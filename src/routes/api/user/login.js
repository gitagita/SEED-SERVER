var express = require("express");
var router = express.Router();
var db = require('../../../../db');
const bcrypt = require('bcrypt');
var userfunc = require('./userfunc');
const moment = require("moment");

var setResponse = (error, data, message, status) => {
    if (!error) status = 200;
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

/*
 * 최초 로그인
 * @author yuna
 */
router.post("/", async (req, res) => {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;

    if (userEmail === undefined || userPW === undefined) {
        return res.send(setResponse(true, { 'loggedIn': false }, "회원 확인 오류: "+ findUser.message, 400));
    }

    //회원이 가입 또는 탈퇴 여부 검사
    let findUser = await userfunc.findUser(userEmail);
    if(findUser.status != 200){
        res.send(setResponse(true, { 'loggedIn': false }, "회원 확인 오류: "+ findUser.message, 400));
    } else {
        if(!findUser.data.exist) {
            res.send(setResponse(false, { 'loggedIn': false, 'exist': false }, "가입하지 않은 회원입니다."));
        } else if(findUser.data.withdrawal){
            res.send(setResponse(false, { 'loggedIn': false, 'withdrawal': true }, "탈퇴한 회원입니다."));
        } else {
            //회원 비밀번호 일치 여부 확인
            let checkPw = await userfunc.checkPassword(userEmail,userPW);
            if(checkPw.status != 200){
                res.send(setResponse(true, { 'loggedIn': false }, "비밀번호 확인 오류", 400));
            } else if(!checkPw.data.corect){
                res.send(setResponse(true, { 'loggedIn': false }, "비밀번호 불일치", 400));
            } else {
                //accessToken과 refreshToken 발급
                const accessToken = await userfunc.makeAccessToken({id: userEmail});
                const refreshToken = await userfunc.makeRefreshToken();

                const regDt = moment().format("YYYY-MM-DDTHH:mm:ss");
                
                //쿠키 및 DB에 저장
                const sql = "INSERT INTO token (email, token, regDt) VALUES (?,?,?) ON DUPLICATE KEY UPDATE token = '"+refreshToken+"';";
                db.query(
                    sql, [userEmail, refreshToken, regDt], (err, result) => {
                        if (err) {
                            res.send(setResponse(true, { 'loggedIn': false }, "토큰발급 실패(서버 내부 오류):"+err, 500));
                        } else {
                            res.cookie('accessToken', accessToken);
                            res.cookie('refreshToken', refreshToken);

                            res.send(setResponse(false, { 'loggedIn': true, 'accessToken': accessToken, 'refreshToken': refreshToken}, "토큰발급 성공(로그인 성공)"));
                        }
                    }
                );
            }
        }
    }

    
});

/*
 * 자동로그인 및 Access토큰 발급
 * @author yuna
 */
router.post("/token", async (req, res) => {
    if(req.headers["authorization"] && req.headers["refresh"]) {
        const accessToken = req.headers["authorization"].split(" ")[1];
        const refreshToken = req.headers["refresh"];

        //access토큰 유효성 검사
        const accessResult = await userfunc.accessVerify(accessToken);

        //access토큰 만료된 경우
        if(accessResult.data.ok === false && accessResult.data.message === "jwt expired") {
            //refresh토큰 유효성 검사 및 유효한 경우 access토큰 발급
            const refreshResult = await userfunc.refreshVerify(refreshToken, accessResult.data.id);
            //access토큰과 refresh토큰 둘 다 유효하지 않은 경우 -> 최초 로그인
            if(refreshResult.data.ok === false) {
                res.send(setResponse(true, { 'loggedIn': false }, "로그인 실패(refresh토큰 권한 없음)", 401));
            } else {
                //access토큰은 만료되고 refresh토큰은 유효한 경우 -> 새로운 accessToken 발급
                res.send(setResponse(false, { 'loggedIn': true, 'accessToken': refreshResult.data.accessToken, 'refreshToken': refreshToken }, "토큰발급 성공(로그인 성공)"));
            }
        } else if (accessResult.data.ok){  //access 토큰이 만료되지 않은 경우
            res.send(setResponse(false, { 'loggedIn': true }, "access토큰이 유효함(로그인 성공)"));
        } else {
            res.send(setResponse(true, { 'loggedIn': false }, "로그인 실패: "+accessResult.data.message, 401));
        }

    } else {
        res.send(setResponse(true, { 'loggedIn': false }, "로그인 실패(헤더에 authorization 또는 refresh 없음)", 400));
    }
        
})

module.exports = router;