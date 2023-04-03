var db = require('../../../../db');
const bcrypt = require('bcrypt');

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
//회원 비밀번호 확인 함수
userfunc.checkPassword = (userEmail, userPW) => {
    return new Promise((resolve, reject) => {
        const sqlCheckPw = "SELECT memNo, password FROM member WHERE email = '" + userEmail + "' AND withdrawal = 0;";
        db.query(
            sqlCheckPw, (err, result) => {
                if (err) {
                    resolve(setResponse(true, { 'corect': false }, "서버 내부 오류 : " + err, 500));
                } else {
                    if (result.length != 0 && result[0].password != undefined) {
                        //비밀번호 일치여부 검사
                        bcrypt.compare(userPW, result[0].password, (error, response) => {
                            if (response) {
                                resolve(setResponse(false, { 'corect': true, 'userNo': result[0].memNo }, "비밀번호 일치"));
                            } else {
                                resolve(setResponse(true, { 'corect': false }, "비밀번호 불일치"));
                            }
                        })
                    } else {
                        resolve(setResponse(true, { 'corect': false }, "비밀번호 조회 에러(회원 정보 없음)"));
                    }
                }
            }
        );
    })  
}

module.exports = userfunc;