---
layout: post
title: "Chrome에서 구글 시작 페이지가 한국이 아닌 다른 나라로 나올 경우"
date: 2016-11-21 21:07:59 +09:00
comments: true
categories: tip
---

Chrome을 열면 시작 페이지가 [구글-한국](https://www.google.co.kr)이 떠야 하는데 이상하게 [구글-일본](https://www.google.co.jp) 등으로 뜨는 경우가 있다. 주변에서 이런 경우를 보면 어쩌다 한번만 그런게 아니라 한번 발생하면 지속적으로 해당 국가의 구글이 뜬다. Chrome의 설정이나 계정 정보에 관련 정보가 저장되어서 그런 경우도 있다고 하나 관련 정보를 모두 수정하고 캐시 정보를 모두 지워도 문제가 해결되지 않는 경우가 있다. 이런 경우는 아마도 사용자의 IP를 보고 국가를 판단하는 것으로 보인다.

관련해서 [Chrome 사용자 게시판 - 구글, 크롬 국가 변경](https://productforums.google.com/forum/#!msg/chrome-ko/9ho5EKK3a5c/Kfh2xzEaqFMJ) 이라는 글을 보면 답변 내용 중에 아래의 내용이 있다.

>Google 검색은 사용자의 검색 설정, 위치 설정(위치는 IP 주소, 위치 기록, Wi-Fi 연결, www.google.com/preferences 페이지에서 설정한 위치 등)을 토대로 파악하여 사용자를 알맞는 Google 도메인으로 리디렉트 시킵니다. 예를 들어서 미국에서 Google 검색을 수행하면, Google.com 도메인으로, 프랑스에서 Google 검색을 하면 google.com 대신 google.fr 도메인으로 사용자를 이동시킵니다. 한국에서 검색을 한다면 당연히 google.co.kr 로 이동시켜야 하는 것이 맞습니다만, google.co.jp 로 잘못 리디렉트된다면, 다음 몇 가지 방법을 통해 원하는 Google 도메인을 방문할 수 있습니다.
>
>1. 잘못된 Google 사이트로 연결된다면, Google에서 사용자의 IP 주소를 잘못 감지했을 수 있으며, [문제를 신고](https://support.google.com/websearch/contact/ip)하면 Google에서 사용자의 IP 주소를 업데이트해 줄 수 있습니다. 보통 매우 신속하게 문제가 해결되지만 최대 한 달이 걸릴 수도 있다 합니다.
>
>2. [개인 검색 설정 및 위치 설정](https://support.google.com/websearch/answer/179386) 등을 검토해보시고, 필요하면, Google에서 위치를 변경할 수 있습니다.
>
>3. 언제든지, www.google.co.jp 대신 google.com 또는 google.co.kr 등 원하는 도메인을 바로 방문할 수 있습니다. 구체적인 해결방법은 다음 예시를 참고하세요.
영문 Google 도메인 방문하는 방법: http://www.google.com/ncr 를 클릭하거나, http://www.google.com/ncr 을 북마크에 추가합니다.
한국 Google 도메인을 방문하는 방법: http://www.google.co.kr/ncr 를 클릭하거나, http://www.google.co.kr/ncr 를 북마크에 추가합니다.
여기서 NCR는 No Country Redirect 를 의미합니다. 같은 방법으로 한국에서 프랑스 도메인으로 이동하려면, www.google.fr 를 입력할 것이 아니라, Chrome 주소창에 www.google.fr/ncr 를 입력해야 합니다.

이 내용 중에 있는 것처럼 http://www.google.co.kr/ncr 를 접속한 후 브라우저를 껐다 켜면 정상적으로 구글 한국으로 접속되는 경우가 있으니 한번 시도해보길 바란다. 그리고 위 답변처럼 [IP 문제 신고](https://support.google.com/websearch/contact/ip)를 하는 것이 가장 확실한 해결책인 것으로 보인다.
