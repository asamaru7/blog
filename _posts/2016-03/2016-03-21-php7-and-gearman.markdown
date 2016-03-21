---
layout: "post"
title: "PHP 7에서 Gearman 모듈 사용하기"
date: "2016-03-21T11:22:49+09:00"
comments: true
categories: php
---
PHP 7로 마이그레이션시에 걸림돌이 될 수 있는 것 중 하나가 PHP 모듈의 호환성 문제다. 나의 경우는 대부분 문제가 없었으나 [Gearman](http://gearman.org/)이 걸렸다. 아직 Gearman의 PHP 모듈이 정식으로 PHP 7을 지원하지 않아서 공식 지원을 기다리고 있었다. 그런데 시간을 두고 기다려봐도 지원을 기대하기 어려워(버전업이 오래전부터 멈춰있음) 자체적으로 방법을 찾기로 했다.

Gearman 외에도 PHP 7과 모듈들의 호환성을 확인하려면 [PHP 7 Extensions](https://gist.github.com/lewisgoddard/459b450106cf1e5b754e)을 참고하기 바란다.

---

우선 나의 경우는 PHP 7을 소스 설치하지 않고 [Webtatic.com](https://webtatic.com/packages/php70/)에서 제공하는 바이너리를 yum으로 설치해서 사용중이다. CentOS에서 해당 레포지토리를 사용하려면 아래와 같이 webtatic 레포지토리를 yum에 추가하면 된다.

```bash
$ rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm
```

---

PECL에 등록된 Gearman 모듈은 [PECL - Gearman](http://pecl.php.net/package/gearman)에서 확인할 수 있고 소스는 [hjr3/pecl-gearman](https://github.com/hjr3/pecl-gearman)에서 확인할 수 있다. 보면 알겠지만 꽤 오래전부터 변경이 전혀 없다. 그래서 해당 라이브러리를 fork해서 문제를 개선하고 있는 [wcgallego/pecl-gearman](https://github.com/wcgallego/pecl-gearman/network)을 사용해서 컴파일하기로 했다.

설치는 아래와 같이 할 수 있다.

```bash
$ yum install -y php70w-devel libgearman-devel
$ git clone https://github.com/wcgallego/pecl-gearman.git
$ cd pecl-gearman/
$ ./configure
$ make
$ make install
```

앞서 언급했던 것과 같이 나의 경우는 [Webtatic.com](https://webtatic.com/packages/php70/)의 바이너리를 사용한 경우이므로 상황에 따라 아래의 명령은 차이가 난다. 하지만 중요한 부분은 [wcgallego/pecl-gearman](https://github.com/wcgallego/pecl-gearman/network)의 소스를 받아서 빌드하는 것이므로 자신의 환경에 맞춰 빌드하는 것에는 큰 문제가 없을 것으로 생각한다.

빌드에 오류가 없다면 `/usr/lib64/php/modules/`에 `gearman.so` 파일이 만들어져 있을 것이다. modules의 경로 또한 차이가 날 수 있으나 설치 마지막 메시지를 보면 자신의 위치는 확인 할 수 있을 것이다. 이 파일이 만들어 졌다면 이제 거의 끝이다. 이제는 php에서 해당 모듈을 load 하도록 연결하면 된다.

`/etc/php.d/gearman.ini` 파일을 열어서 아래의 내용을 넣는다.

```
; Enable gearman extension module
extension = gearman.so
```

`php.ini` 파일에 `extension = gearman.so`를 추가해도 된다. 나의 경우는 ini 파일들이 분리되어 관리되기 때문에 따로 파일을 만든 것이다.

이제는 php를 재시작(`service php-fpm restart`)하고 `phpinfo();`로 확인해보면 Gearman 모듈이 연결된 것을 확인 할 수 있다.
