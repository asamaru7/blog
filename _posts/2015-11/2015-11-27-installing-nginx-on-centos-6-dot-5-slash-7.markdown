---
layout: post
title: "Nginx(stable / mainline) 설치 - CentOS 6.5 / 7"
date: 2015-11-27 15:49:16 +0900
comments: true
categories: linux
---
[Nginx](http://nginx.org/)는 [위키피디아](https://ko.wikipedia.org/wiki/Nginx)에서 아래와 같이 설명하고 있다.

> Nginx(엔진 x라 읽는다)는 웹 서버 소프트웨어로, 가벼움과 높은 성능을 목표로 한다. 웹 서버, 리버스 프록시 및 메일 프록시 기능을 가진다.
>
> Netcraft의 2011년 1월 웹서버 설문조사에 따르면, nginx는 전체 도메인에서 4번째(7.50%)로 많이 쓰이는 웹서버이며, 활성화된 웹 사이트에 대한 통계에서도 역시 4번째(8.23%)로 많이 사용된다[1].
>
> Nginx는 요청에 응답하기 위해 비동기 이벤트 기반 구조를 가진다. 이것은 아파치 HTTP 서버의 스레드/프로세스 기반 구조를 가지는 것과는 대조적이다. 이러한 구조는 서버에 많은 부하가 생길 경우의 성능을 예측하기 쉽게 해준다.

기존에는 Apache를 사용하고 있었다. Apache의 다양한 기능 때문이라기 보다는 익숙함 때문이었다. 그런데 예전부터 [Nginx](http://nginx.org/)에 대한 사람들의 평가(Apache의 튜닝 상태에 따라 다른 결과를 보이기도 한다)를 볼 때마다 언젠가는 갈아타야지 싶었는데 최근에야 이 생각을 실천하게 되었다. 그레서 [Nginx](http://nginx.org/)를 설치하는 과정을 정리하고자 한다.

---

CentOS에서 Nginx의 설치는 크게 소스를 컴파일해서 설치하는 방법과 YUM을 통해 설치하는 방법이 있다. Nginx의 경우 Apache와 다르게 모듈을 추가할 경우엔 무조건 소스 설치를 해야한다(모듈을 포함시켜 컴파일 해야 한다). 따라서 mod_pagespeed나 pagespeed 등을 사용하고자 하는 경우에는 소스 설치를 해야 한다. 오늘은 YUM 설치를 기준으로 설명하고자 하니 모듈을 추가해서 설치하는 방법은 아래의 링크들을 참고하자.

* [How to install Mod_Security on Nginx](http://www.nginxtips.com/how-to-install-mod_security-on-nginx/)
[Build ngx_pagespeed From Source](https://developers.google.com/speed/pagespeed/module/build_ngx_pagespeed_from_source)
* [NGINX 모듈 제작하기](http://d2.naver.com/helloworld/192785)

사실 기본적인 설치는 [공식 메뉴얼](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)에 아주 잘 설명되어 있고 간단하다. 내용을 옮겨 적자면 아래와 같다.

`/etc/yum.repos.d/nginx.repo` 파일을 생성해서 아래의 내용을 넣는다.

```
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=0
enabled=1
```

그리고는 아래와 같이 yum 으로 설치한다.

```bash
sudo yum install nginx
```

혹시 EPEL을 이용해서 설치하고 싶다면 `/etc/yum.repos.d/nginx.repo` 파일을 생성할 필요없이 아래와 같이하면 된다.

```bash
sudo yum install epel-release
sudo yum install nginx
```

끝이다. 정말 간단하다. 설명할 것도 없다. 하지만 사실 이 글을 적는 이유는 이제부터다.

Nginx는 기본적으로 두가지 버전이 존재한다. stable 버전과 mainline 버전이다. 사실상 최신 버전은 mainline 이다. 2015-11-27일 기준으로 stable은 nginx-1.8.0, mainline은 1.9.7이다. 말그대로 stable 버전이 안정 버전이므로 사용이 권장되기는 하나 mainline도 불안정한 것은 아니다.

[What’s the difference between the “mainline” and “stable” branches of nginx?](http://serverfault.com/a/715126)의 설명대로라면 mainline을 더 권장한다. stable 버전이라고 버그가 없는 것이 아니며 버그 패치는 mainline에 먼저 된다는 이유 때문이다.

그래서 나는 mainline으로 설치하기로 했다. 설치 방법은 위의 stable과 별반 다르지 않으나 repository의 url만 차이가 난다.

`/etc/yum.repos.d/nginx.repo` 파일을 생성해서 아래의 내용을 넣는다.

```
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/mainline/centos/\$releasever/\$basearch/
gpgcheck=0
enabled=1
```

그리고는 아래와 같이 yum 으로 설치한다.

```bash
sudo yum install nginx
```

이것 또한 아주 간단하다. 약간의 부가 작업을 포함해서 bash shell 스크립트를 하나 만들어 뒀다.

nginx.install.sh

```bash
#!/bin/bash
function printTitle {
    echo -e "\e[1;97m=======================================\e[0m"
    echo -e "\e[1;97m* $1\e[0m"
    echo -e "\e[1;97m=======================================\e[0m"
}

function printJob {
    echo -e "\e[94m* $1\e[0m"
}

function printSubJob {
    echo -e "\e[96m\t$1\e[0m"
}

printTitle "Nginx 설치"

printJob "httpd.service 종료"
systemctl stop httpd.service

printJob "httpd.service 제거"
yum remove -y httpd
systemctl disable httpd.service

printJob "Nginx 설치"
if [ ! -e /etc/yum.repos.d/nginx.repo ]; then
    printSubJob "nginx repository 추가"
    echo "[nginx]" > /etc/yum.repos.d/nginx.repo
    echo "name=nginx repo" >> /etc/yum.repos.d/nginx.repo
    echo "baseurl=http://nginx.org/packages/mainline/centos/\$releasever/\$basearch/" >> /etc/yum.repos.d/nginx.repo
    #echo "baseurl=http://nginx.org/packages/centos/\$releasever/\$basearch/" >> /etc/yum.repos.d/nginx.repo
    echo "gpgcheck=0" >> /etc/yum.repos.d/nginx.repo
    echo "enabled=1" >> /etc/yum.repos.d/nginx.repo
fi

printSubJob "nginx package 설치"
yum install -y nginx

printJob "Nginx 서비스 활성"
systemctl enable nginx.service

printJob "Nginx 서비스 시작"
systemctl start nginx.service

printJob "방화벽 설정"
if [ `firewall-cmd --zone=public --list-all|grep "services"|grep "http" | wc -l` -eq 0 ]; then
    printSubJob "http/https 개방"
    firewall-cmd --permanent --zone=public --add-service=http
    firewall-cmd --permanent --zone=public --add-service=https

    printSubJob "방화벽 rule reload"
    firewall-cmd --reload
fi
```

위 소스는 CentOS 7에서 firewalld를 사용하는 것을 기준으로 만들어진 것이니 참고하기 바란다. 그리고 원래 내가 사용하는 소스에서 불필요한 부분을 제거하고 넣은 것이라 `print***` 함수 같은 부분이 잘못 되었을 수 있는데 오류가 난다면 관련 부분을 모두 제거하면 된다.
