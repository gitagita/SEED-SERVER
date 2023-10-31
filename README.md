# SEED-SERVER

# 영화 리뷰 플랫폼 SEED 📽️
SEED는 리뷰 컨텐츠를 통해 회원이 자신을 드러낼 수 있는 **크리에이티브 컨텐츠 플랫폼**입니다. 영화 평가에 중점을 둔 다른 리뷰 사이트들과 다르게 영화에 대한 사용자 본인의 생각을 다양한 방법으로 표현할 수 있습니다. 한줄평, 평론, 카드뉴스, 영상 등 **다양한 형식의 리뷰**를 작성할 수 있습니다.
|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/45f44459-0ce9-456b-a170-a153e6caa112)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/0df82d42-1364-49d9-bd38-65790b02ed71)|
|:---:|:---:|
|시작 화면|오늘의 영화 추천 화면|

## 목차
  - [개요](#개요) 
  - [개발 배경](#개발-배경)
  - [프로젝트 구현 내용](#프로젝트-구현-내용)
    - [담당하여 구현한 기능](#담당하여-구현한-기능)
    - [그 이외에 개발한 기능](#그-이외에-개발한-기능)
    - [개발 진행중인 페이지](#담당하여-구현한-기능)
    - [앞으로의 진행방향](#앞으로의-진행방향)
## 개요
- 프로젝트 이름: SEED 📽️
- 프로젝트 지속기간: 2022.08.17-진행중
- 개발 환경: React, Node.js, MySQL, AWS-EC2, Figma, VS Code, Git, GitHub, Slack, Notion
- 구성원: 개발 4명, 디자인 2명
- 담당 역할 및 기여도: 팀장
  - 프로젝트 아이디어 제공 및 팀원 모집
  - 64 명을 대상으로 영화 플랫폼에 대한 설문조사 진행
  - AWS ec2 인스턴스 구축
  - DB 설계 및 제작
  - 회원 관련 API 개발
    
### DB 설계
  ![SEED DB 설계](https://github.com/gitagita/SEED-SERVER/assets/78337047/09fc01de-f933-46b2-8a4a-b9735119bf55)


## 개발 배경
|![슬라이드5](https://github.com/gitagita/SEED-SERVER/assets/78337047/81810ef7-aa44-4bc8-8b51-2ebf7c5eeb35)|![슬라이드11](https://github.com/gitagita/SEED-SERVER/assets/78337047/e1f4dbc8-85ea-4d37-bdc4-f9babed858e8)|
|:---:|:---:|
|리뷰의 중요성|SEED의 지향점|

대중 속에서 영화 평론에 대한 관심도가 증가하고, 웹서비스를 통한 영화 평론이 대중화 되었습니다. 또한 평점과 글 형식 뿐만 아니라 영상이나 웹툰 등 다양한 형태의 영화 리뷰가 등장했습니다. SEED는 새로운 형태의 문화 컨텐츠로의 발전 가능성에 관심을 가졌습니다.

SEED는 리뷰 컨텐츠를 중점으로, 회원이 다양한 형식으로 자신을 드러낼 수 있는 크리에이티브 컨텐츠 플랫폼을 지향합니다.

---
## 프로젝트 구현 내용
### 담당하여 구현한 기능
|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/f92ea4a2-c164-4e56-a6ab-3348114b6baf)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/b13f4447-358b-42f0-949b-d8cfb2eeef5c)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/32a3c324-ecd9-4e14-9ede-b7560b75a64b)|
|---|---|---|
|회원 가입 페이지|회원 로그인 페이지|마이 페이지|
|회원가입 동의항목의 경우 항목이 추가되거나 삭제되는 경우를 고려하여 json 형식으로 저장했습니다. 회원 비밀번호는 암호화하여 DB 에 저장했습니다.|영화리뷰 플랫폼 특성 상 회원 수가 많고 DB 에 접근하는 빈도가 많은 것을 고려하여 로그인 시 세션 방식이 아닌 **JWT 인증 방식**을 사용했습니다. 추가로 보안 강화를 위해 **access 토큰과 refresh 토큰**을 발급하여 회원 로그인 되도록 구현했습니다.| 회원의 기본 정보와 비밀번호를 변경할 수 있습니다. 변경 전 비밀번호 확인하도록 구현했습니다.

#### 회원 관련 API
|API|기능|
|---|---|
|[GET] user/privacy|화원조회|
|[GET] /user/privacy/:id|회원 상세조회|
|[POST] /user/privacy/:id/password|비밀번호 확인|
|[POST] /user/register|회원가입|
|[POST] /user/modify|회원정보수정|
|[POST] /user/modify/password|회원 비밀번호 변경|
|[POST] /user/delete|회원 탈퇴|
|[POST] /user/login|최초로그인|
|[POST] /user/login/token|자동로그인|
|[POST] /user/logout|로그아웃|
|[POST] /user/auth/email|이메일 인증|

### 그 이외에 개발한 기능
- 의견 보내기 페이지
   - 사용자가 메일을 통해 문의할 수 있는 페이지입니다. 회원이 가입한 메일을 통해 문의사항이 전송되도록 구현했습니다. 초기 개발 시에는 EmailJS 를 사용하였고, 현재는 대량의 메일 발송에 대처하기 위해 nodemailer 와 Naver SMTP 를 이용해 구현했습니다.
- 영화 리뷰 작성 페이지
   - 리뷰는 한 줄 평을 작성하는 리뷰(short)와 블로그처럼 다양한 형식으로 글을 작성할 수 있는 리뷰(express)로 나누어져 있으며, 긴 글 리뷰의 경우 json 형식으로 DB 에 저장했습니다.
  

### 개발 진행중인 페이지
|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/b6d01fec-aff8-40c6-93b4-134ff745d624)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/ac56473c-cbed-4f61-878d-fca7e0e4da54)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/dc85c93b-578a-4471-9de0-1e7e3e3516bc)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/9360f07c-4b28-403a-b077-c4eb6b31e455)|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/0c9187cd-50d1-4491-88a7-1949dffe4aae)|
|---|---|---|---|---|
|메인 페이지|좋아요와 구독 리스트|영화 및 리뷰 검색|무비그램|Short리뷰 작성|

### 앞으로의 진행방향
|64명을 대상으로 진행한 설문조사|![image](https://github.com/gitagita/SEED-SERVER/assets/78337047/2a8b610b-7c1b-410b-bf71-cbf0bf6ae7bd)|
|---|---|
|시청 후 리뷰를 남기지 않는 사람이 62.5%로 압도적으로 많았습니다.|그래서 저희는 리뷰 작성 컨텐츠 외에도 사람들이 SEED를 사용하게 만들만한 요소가 필요하다고 생각했습니다. 현재 방법으로 회원이 리뷰를 적극적으로 작성할 수 있도록 회원마다 작성한 리뷰 장르에 맞게 자라나는 나무 아이템을 고려 중에 있습니다. 그외에도 리뷰어 상 어워드, 리뷰 공유기능, 영화에 대한 토론과 영화 대사 맞추기 게임 등 다양한 아이디어를 팀원들과 계획하고 있습니다.|

