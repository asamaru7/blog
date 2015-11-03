---
layout: post
title: "Google Apps Gmail에서 '다른 주소에서 메일 보내기' 사용시 'Functionality Not Enabled.' 오류 해결"
date: 2015-10-06 08:01:10 +0900
comments: true
categories: Tip
---
지금은 구글 앱스의 무료 계정이 없지만 예전에는 사용자 50명 이내에 한해서 무료 계정을 제공했다. 그때 나의 개인 계정과 회사 계정을 등록해 두어서 현재까지 무료로 사용중이다. 요즘에는 다음 등에서도 비슷한 서비스를 제공하지만 역시 구글이 훨씬 다양한 기능을 제공한다.

우선 나는 내 개인 계정 한군데에 다른 메일 서비스에 수신되는 모든 메일이 포워딩 되도록 사용중이다. 따라서 메일 발수신을 모두 내 계정에서 한다. 수신은 당연히 문제가 없지만 발신의 경우 특정 이메일을 사용해서 발신해야 하는 경우가 있다. 예를들어 회사 업무차 메일을 보낼때는 회사 메일 주소로 메일을 보내야 하는 것이다. 어런 경우에 유용하게 사용할 수 있는 것이 "다른 주소에서 메일 보내기" 기능이다. 이 기능은 "환경설정 > 계정"에서 찾을 수 있다.

"다른 주소에서 메일 보내기"에서 발신을 위한 메일 주소를 등록해두면 메일 발신시 해당 메일 주소로 메일을 보낼 수 있다.

그런데 어제 새로운 메일 주소를 등록하려고 하니 "Functionality Not Enabled." 오류 메시지와 함께 정상 등록되지 않았다. 현재 등록하려던 곳은 일반 GMail이 아닌 Google Apps에서 제공하는 Gmail 이다. 분명 예전에는 새로운 메일 주소를 등록하면 해당 주소로 확인 메일을 보내주고 메일 내용에 들어있는 확인 코드를 넣으면 간단히 등록되었었다.

구글의 정책이 변경된 것으로 보인다. 어쨌든 등록을 해야해서 오류를 해결하는 방법을 찾아보았다. 일반 Gmail을 사용하는 경우라면 위 오류가 나타나지 않았을 것이니 이 단계가 필요없다. 단, 다른 구글 계정의 이메일 주소를 연결하는 방법을 보려면 조금 더 아래의 내용을 참고하자.

* [Send mail as - Add another email address you own - "Functionality not enabled" message.](https://productforums.google.com/forum/#!topic/apps/z1IS-ocp6yk)
* [Resolving The Functionality Not Enabled Message In Google Apps](https://www.youtube.com/watch?v=kK7QpOWCz_A)

위 링크들을 참고하면 이 문제를 쉽게 해결할 수 있다. 요약하자면 아래와 같다. 다시말하지만 이 경우는 Google Apps인 경우다.

* 도메인 관리(Google Apps 관리) 페이지로 접속한다.
* 사용자 > 해당 사용자 선택 > 사용하도록 설정된 Google Apps > GMail로 들어간다.
* 고급 설정 > 최종 사용자 액세스 > 사용자별 발신 게이트웨이 허용을 체크한다.

일단 이렇게 설정하면 위 오류 메시지는 해결된다. 단, 이 변경이 적용되는데 어느 정도 시간이 걸린다. 저장시에 안내 메시지가 나오는데 내 경우는 1시간 이내라고 안내가 나왔었다.

자.. 그래서 1시간 후 다시 시도.

Gmail로 돌아와서 "다른 이메일 주소 추가"를 누르면 기존과 동일하게 아래의 화면이 나타난다.

![다른 이메일 주소를 추가하세요](/img/2015-10-06-resolving-the-functionality-not-enabled-message-in-google-apps-1.png)

원하는 이름과 이메일 주소를 입력하고 "다음 단계"를 선택. 그럼 아래와 같이 오류 대신 SMTP 서버 정보를 넣으라는 화면이 나온다(기존에는 이 단계가 없었다).

![다른 이메일 주소를 추가하세요](/img/2015-10-06-resolving-the-functionality-not-enabled-message-in-google-apps-2.png)

이 단계에서는 SMTP 서버 정보를 넣으면 되는데 추가하려는 이메일 주소가 Gmail 또는 Google Apps Gmail 인 경우라면 SMTP 서버에 "smtp.gmail.com", 포트는 587을 선택하고 아이디와 비밀번호를 입력하면 된다. 단, 아이디(사용자 이름)은 abc@gmail.com 등과 같이 이메일 풀주소를 넣어야 한다. 조금더 상세한 정보는 [How To Use Google's SMTP Server](https://www.digitalocean.com/community/tutorials/how-to-use-google-s-smtp-server)를 참고하자. 단, 여기서는 포트를 465로 안내하고 있지만 내 경우는 587을 사용해야 했다.

마지막 확인 코드 입력 화면이다. 정상적으로 정보가 확인된다면 입력한 이메일 주소로 확인 코드를 보내주는데 이 확인 코드를 아래의 화면에 입력하면 등록이 완료된다.

![다른 이메일 주소를 추가하세요](/img/2015-10-06-resolving-the-functionality-not-enabled-message-in-google-apps-3.png)

확인 코드를 정상적으로 입력했다면 추가한 이메일이 보일 것이다. 이제부터는 메일을 보낼때 이 이메일 주소를 사용할 수 있다.
