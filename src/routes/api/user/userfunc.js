var db = require('../../../../db');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

var setResponse = (error, data, message, status) => {
    if (!error) status = "200";
    return {
        'status': status,
        'error': error,
        'message': message,
        'data': data
    };
}

let userfunc = {};

token = () => {
    return{
        access(Object){ //accessToken 발급
            return jwt.sign(Object, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "2h",    //2 hours
            });
        },
        refresh(){    //refreshToken 발급
            return jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: "14d",   //14 days
            })
        },
        issuance(refresh) {    //refreshToken 유효성 검사 후 accessToken 발급
            return jwt.verify(
                refresh, process.env.REFRESH_TOKEN_SECRET,
                (err, user) => {
                    if(err){
                        return setResponse(true, { 'ok': false }, "토큰발급 실패(refreshToken 유효성 에러)", 401);
                    } else {
                        return setResponse(false, { 'ok': true, 'accessToken': token().access({id: user.id}), 'refreshToken': refresh }, "토큰발급 성공(로그인 성공)");
                    }
                }
            )
        },
        decoded(access){    //accessToken 유효성 검사
            return jwt.verify(
                access, process.env.ACCESS_TOKEN_SECRET,
                (err, user) => {
                    if(err){
                        //access토큰 디코딩 하여 userId 가져오기
                        const decoded = jwt.decode(access);
                        if(!decoded) {
                            return setResponse(true, {'ok': false}, "로그인 실패(access토큰 권한 없음))", 401);
                        }
                        return setResponse(true, { 'ok': false, 'message': err.message, 'id':decoded.id }, "로그인 실패(accessToken 유효성 에러):", 401);
                    } else {
                        return setResponse(false, { 'ok': true }, ",로그인 성공(accessToken 유효함)");
                    }
                }
            )
        }
    }
}


//회원 비밀번호 확인 함수
userfunc.checkPassword = (userEmail, userPW) => {
    return new Promise((resolve, reject) => {
        const sqlCheckPw = "SELECT memNo, password FROM member WHERE email = '" + userEmail + "' AND withdrawal = 0;";
        db.query(
            sqlCheckPw, (err, result) => {
                if (err) {
                    resolve(setResponse(true, {}, "서버 내부 오류 : " + err, 500));
                } else {
                    if (result.length != 0 && result[0].password != undefined) {
                        //비밀번호 일치여부 검사
                        bcrypt.compare(userPW, result[0].password, (error, response) => {
                            if (response) {
                                resolve(setResponse(false, { 'corect': true, 'userNo': result[0].memNo }, "비밀번호 일치"));
                            } else {
                                resolve(setResponse(true, {}, "비밀번호 불일치", 400));
                            }
                        })
                    } else {
                        resolve(setResponse(true, {}, "비밀번호 조회 에러(회원 정보 없음)"), 400);
                    }
                }
            }
        );
    })  
}

//회원 가입 여부 확인
userfunc.findUser = (userEmail) => {
    return new Promise((resolve, reject) => {
        const sqlFindUser = "SELECT EXISTS (select * from member where email = '" + userEmail + "' limit 1) as success;";
        db.query(
            sqlFindUser, (err, result) => {
                if (err) {
                    resolve(setResponse(true, {}, "서버 내부 오류 : " + err, 500));
                } else {
                    if (result.length != 0 && result[0].success == 1) {
                           //탈퇴 회원 여부 확인
                           const sqlCheckUser = "SELECT withdrawal FROM member where email = '" + userEmail + "';";
                            db.query(sqlCheckUser, (err, result) => {
                                if (err) {
                                    resolve(setResponse(true, {}, "서버 내부 오류 : " + err, 500));
                                } else {
                                    if(result[0].withdrawal == 0){  //withdrawal: 0-가입중 / 1-탈퇴함
                                        resolve(setResponse(false, { 'exist': true , 'withdrawal': false }, "존재하는 회원"));
                                    } else {
                                        resolve(setResponse(false, { 'exist': true , 'withdrawal': true }, "탈퇴한 회원"));
                                    }
                                }
                            });
                    }else if (result.length != 0 && result[0].success == 0) {
                        resolve(setResponse(false, { 'exist': false , 'withdrawal': true }, "존재하지 않는 회원"));
                    } else {
                        resolve(setResponse(true, {}, "회원 테이블 조회 오류", 400));
                    }
                }
            }
        );
    })  
}

//refresh token 유효성 검사 및 access토큰 발급
userfunc.refreshVerify = (refreshToken, userEmail) => {
    return new Promise((resolve, reject) => {
        const sqlRefresh = "SELECT token FROM token WHERE email = '" + userEmail + "';";
        db.query(
            sqlRefresh, (err, result) => {
                if (err) {
                    resolve(setResponse(true, { 'ok': false }, "서버 내부 오류 : " + err.message, 500));
                } else {
                    //인자로 받은 refreshToken과 DB에서 조회한 token 비교 
                    if(result.length != 0 && result[0].token === refreshToken){
                        resolve(token().issuance(refreshToken));
                    } else {
                        resolve(setResponse(true, { 'ok': false }, "refresh토큰 비교 오류", 400));
                    }
                }
            }
        );
    })
}

//access token 유효성 검사
userfunc.accessVerify = (accessToken) => {
    return new Promise((resolve, reject) => {
        resolve(token().decoded(accessToken));
    })
}

userfunc.makeAccessToken = (Object) => {
    return new Promise((resolve, reject) => {
        resolve(token().access(Object));
    })
}

userfunc.makeRefreshToken = () => {
    return new Promise((resolve, reject) => {
        resolve(token().refresh());
    })
}

module.exports = userfunc;