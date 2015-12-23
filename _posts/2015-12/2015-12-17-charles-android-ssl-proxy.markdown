---
layout: post
title: "Charles를 이용한 안드로이드 SSL Proxy"
date: 2015-12-17 08:36:04 +0900
comments: true
categories: ["android", "tip"]
---
안드로이드 앱을 개발할 때 http/https 디버깅을 위해서 proxy를 사용한다. 나는 예전에 [Paros](http://sourceforge.net/projects/paros/)를 주로 사용했었는데 기본적인 기능을 사용하는데 문제가 없지만 버전업이 중단되어 아쉬운 부분이 많았다. 그래서 최근엔 [Charles](https://www.charlesproxy.com/)를 주로 사용한다. [Paros](http://sourceforge.net/projects/paros/)와 달리 [Charles](https://www.charlesproxy.com/)는 유료지만 사용이 편리하고 다양한 기능을 제공한다. 그래서 많은 사람들이 사용하고 있는 것 같다.

이번에는 이 [Charles](https://www.charlesproxy.com/)를 이용해서 https(SSL)를 proxy하는 방법을 설명하고자 한다. 이 글의 주요 주제는 아니지만 [Charles](https://www.charlesproxy.com/)를 이용해서 proxy로 연결하는 방법부터 간략히 보자.

[Charles](https://www.charlesproxy.com/) > Proxy > Proxy Settings 메뉴로 들어가면 port를 지정할 수 있는 란이 나온다. 여기에 원하는 port를 입력한다. 안드로이드 기기에서는 Wi-Fi 설정으로 들어가서 연결된 네트워크를 길게 누르면 `네트워크 구성 변경`이라는 메뉴가 나타난다. 해당 메뉴로 들어가서 `고급 옵션 표시`를 체크하면 프록시 설정을 할 수 있는 란들이 나타난다. 여기서 `프록시 호스트 이름`에는 [Charles](https://www.charlesproxy.com/)가 켜져있는 컴퓨터의 IP를 넣고 `프록시 포트`에는 [Charles](https://www.charlesproxy.com/)에서 지정했던 port를 넣는다. 아이폰도 안드로이드와 메뉴는 다르지만 동일한 형태로 프록시 설정을 해주면 된다. 더 자세한 내용이 필요하면 인터넷에 관련 자료가 아주 많으니 찾아보길 바란다.

이렇게 연결이 되고나면 [Charles](https://www.charlesproxy.com/)에는 해당 기기에서 사용하는 http/https 기록이 모두 나타난다. http 정보는 암호화가 되어 있지 않기 때문에 모든 내용을 다 볼 수 있지만 https의 경우는 송수신 데이터가 모두 암호화되어 있어 내용을 알아볼 수 없다. 이 부분을 http처럼 볼 수 있도록 설정하는 방법을 설명하고자 하는 것이다.

---

다시 [Charles](https://www.charlesproxy.com/)로 가서 아래의 단계를 따라한다. [Charles](https://www.charlesproxy.com/) 3.9.3 버전 기준이므로 참고 바란다(3.11.2 버전의 경우 확인해보니 메뉴 위치가 다르긴 하나 설정은 큰 차이가 없다).

* Proxy > Proxy Settings > SSL로 간다.
* “Enable SSL Proxying”를 체크한다.
* "Locations" 아래의 "Add" 버튼을 눌러 디버깅하고자 하는 도메인과 port를 입력한다.
* "OK"를 눌러 완료한다.

이제는 [Charles - LEGACY SSL PROXYING](http://www.charlesproxy.com/documentation/additional/legacy-ssl-proxying/) 사이트로 가서 cert 파일을 다운 받는다. 다운받은 cert 파일을 안드로이드 기기에 넣는다. 이메일로 보내서 첨부파일을 열어도 되고 파일을 직접 넣어도 되고 어떻게든 기기에 파일을 넣기만 하면 된다. 그리고 cert(crt) 파일을 터치하여 실행한다. 이후의 과정은 다음과 같다.

* cert 이름을 넣으라고 나오는데 아무 이름이나 넣어도 상관없다.
* 기기에 보안 lock(잠금 화면)이 걸려있지 않다면 lock을 걸어야만 사용할 수 있다는 안내가 나온다. 따라서 lock을 설정해야 한다. 패턴이건 비밀번호건 상관은 없다.
* 설치가 완료되고나면 네트워크 모니터링 가능성(이 기기의 네트워크 정보를 다른 곳에서 볼 수 있다) 안내가 나오는데 무시하면 된다. 지금하고 있는 작업 자체가 그것이므로.

정상적으로 설치가 완료되었다면 이제부터는 이전과는 다르게 지정했던 도메인의 https 정보는 http와 동일하게 모두 볼 수 있다.

---

그런데 3.10 버전 이상을 사용할 경우는 방법이 다르다. [Charles - SSL CERTIFICATES](https://www.charlesproxy.com/documentation/using-charles/ssl-certificates/)에 설명되어 있다. 안드로이드의 경우는 사이트에서 다운 받는 대신 Charles에서 "Help > SSL Proxying > Install Charles Root Certificate on Mobile Device or Remote Browser..."를 선택하면 방법을 안내한다. 내용은 다음과 같다.

안드로이드 기기의 브라우저에서 http://www.charlesproxy.com/getssl를 방문한다. 단, Proxy가 연결된 상태이어야 한다. 이 사이트에 접속하면 cert 파일을 자동으로 추가해 준다. 이후의 과정은 3.9.3과 동일하다.

---

마지막으로 설치한 cert 파일을 제거하는 방법이다. 이 부분은 기기마다 차이가 날 수 있다. 갤노트3 / 롤리팝 기준으로 "설정 > 일반 > 보안 > 인증서 저장공간 > 신뢰할 수 있는 인증서 > 사용자"를 찾아가면 추가한 인증서가 있다. 해당 인증서를 누르면 맨 하단에 "제거" 버튼이 있다.

아.. 그리고 기존에 잠금 화면을 사용하지 않았던 사람이라면 위 과정을 거치면서 잠금 화면을 추가했으므로 다시 해제하고 싶을 수 있다. 그런데 추가한 인증서만 제거해서는 잠금 화면을 해제할 수 없다. 해제를 원한다면 "신뢰할 수 있는 인증서" 메뉴 대신 "인증서 삭제" 메뉴를 이용해서 모든 인증서를 지우면 잠금 화면을 해제할 수 있다.
