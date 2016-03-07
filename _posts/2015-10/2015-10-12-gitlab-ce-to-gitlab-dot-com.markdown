---
layout: post
title: "자체 설치한 gitlab-ce에서 gitlab.com으로 이전하다"
date: 2015-10-12 08:26:40 +0900
comments: true
categories: git
---

[CentOS에 Gitlab 설치하기](/2015/09/22/how-to-install-gitlib-on-centos/)에 포스팅 했던 것 처럼 회사에서 git를 사용하기 위해 Gitlab CE 버전을 자체 서버에 설치해서 사용했다. 얼마 사용하지는 않았는데 속도가 너무 느린감이 있어서 옮기게 되었다. 사실 Gitlab을 설치한 서버는 사내에 다른 용도로 사용하던 서버로 dual lan이 설정되어 있는데 간혹 네트워크가 느려지는 문제가 있다. gateway를 지정해서 어느정도 문제를 해결해서 사용하긴 하지만 간혹 접속이 느려지는 경우가 있다. 사실 이 문제가 아니라 gitlab 자체가 많이 느린 느낌이다.

그래서 private project를 지원하는 [bitbucket](https://bitbucket.org/)으로 옮겼다. 사실 github가 최고이긴하나 굳이 비용을 들여가면서 사용할 이유는 없기 때문이다(아직 다양한 기능을 활용하지 못하니). 그런데 여기서도 문제에 부딪혔다. 네트워크 속도가 느리다. 외국에서 서비스 하고 있다보니 어느 정도는 감안해야 하지만 그래도 너무 느렸다. clone 받는데 30kb/s 가 평균이었다. 그래서 어쩔 수 없이 다른 곳을 알아보았다.

그런데 [gitlab](https://gitlab.com/)에서도 무료 호스팅을 해주고 있었다. 전에 gitlab을 다운 받을 때는 자세히 보지 않아서 몰랐지만 이미 제공되고 있었던 것이다. 게대가 bitbucket과 같은 제약 사항도 없다. 앞으로도 유료화하지 않을 것이라는 안내도 되어있다. 그래서 다시 옮겼다.

옮기는 과정은 굳이 설명하지 않아도 될것 같다. gitlab에서 기능을 잘 제공하고 있다. bitbucket에서 자동 이전할 수 있는 기능을 제공한다(github, bitbucket, gitorious.org, google code, fogbugz, any repo by url을 제공한다).

결과는 나른 만족스럽다. 이전도 아주 단순하고 gitlab의 ce 버전 이상의 기능을 제공하며 속도도 그럭저럭 쓸만하다. 아주 쾌적한 속도는 아니지만 bitbucket에 비하면 아주 빠르다.

당분간은 gitlab을 사용하게 될 것 같다. 향후에 git의 다양한 기능을 제대로 활용하게되고 익숙해 진다면 github로 이전을 다시 할지는 모르겠으나 이 정도면 아직은 충분한 것 같다.
