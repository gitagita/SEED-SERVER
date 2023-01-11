var express = require("express");
var router = express.Router();
var db = require('../../../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

var setResponse = function (error, data, message, status) {
    if (!error) status = 200;
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

const token = () => {
    return{
        access(id){ //accessToken 발급
            return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "15m",
            });
        },
        refresh(id){    //refreshToken 발급
            return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: "10 days",
            })
        },
        issuance(refresh) {    //refreshToken으로 accessToken 발급
            return jwt.verify(
                refresh, process.env.REFRESH_TOKEN_SECRET,
                (err, user) => {
                    if(err){
                        return setResponse(true, { 'loggedIn': false }, "토큰발급 실패(refreshToken 유효성 에러)", 403);
                    } else {
                        return setResponse(false, { 'loggedIn': true, 'accessToken': token().access(user.id), 'refreshToken': refresh}, "토큰발급 성공(로그인 성공)");
                    }
                }
            )
        }
    }
}

/*
 * 최초 로그인
 * @author yuna
 */
router.post("/", function (req, res) {
    const body = req.body;
    const userEmail = body.userEmail;
    const userPW = body.userPW;
    let authData = "";

    //회원 아이디, 비밀번호 확인
    const sqlCheckPw = "SELECT password FROM member WHERE email = '" + userEmail + "';";
    db.query(
        sqlCheckPw, (err, result) => {
            if (err) {
                authData = setResponse(true, err, "서버 내부 오류", 500);
                res.send(authData);
            } else {
                if (result.length != 0 && result[0].password != undefined) {
                    //비밀번호 일치여부 검사
                    bcrypt.compare(userPW, result[0].password, (error, response) => {
                        if (response) {
                            authData = setResponse(false, { 'auth': true, 'accessToken': token().access(userEmail), 'refreshToken': token().refresh(userEmail)}, "토큰발급 성공(로그인 성공)");
                            res.send(authData);
                        } else {
                            authData = setResponse(true, { 'auth': false }, "토큰발급 실패(비밀번호 불일치)", 400);
                            res.send(authData);
                        }
                    })
                } else {
                    authData = setResponse(true, { 'auth': false }, "토큰발급 실패(존재하지 않는 사용자) : " + err, 400);
                    res.send(authData);
                }
            }
        }
    );
});

/*
 * 자동로그인 및 Access토큰 발급
 * @author yuna
 */
router.route("/token")
    //accessToken 유효성 검사 및 값 반환
    //403에러의 경우 accessToken 재발급 필요
    .get((req, res) => {
        let authHeader = req.headers["authorization"];
        let accessToken = authHeader && authHeader.split(" ")[1];
        let userData = "";

        if(!accessToken){
            userData = setResponse(true, { 'loggedIn': false }, "로그인 실패(userEmail 또는 accessToken 없음)", 400);
        } else {
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, res) =>{
                if(err) userData = setResponse(true, { 'loggedIn': false }, "로그인 실패(accessToken 유효성 에러):"+ err, 403);
                else userData = res; //accessToken
            })
        }
        res.send(userData);
    })
    //refreshToken으로 accessToken 발급
    //403에러의 경우 refreshToken 재발급 필요(로그인 페이지로)
    .post((req, res) => {
        const refreshToken = req.body.refreshToken;
        let userData = "";
        if(!refreshToken) userData = setResponse(true, { 'loggedIn': false }, "토큰발급 실패(refreshToken 없음)", 403);
        const sendmsg = token().issuance(refreshToken);
        res.send(sendmsg);
    })

module.exports = router;