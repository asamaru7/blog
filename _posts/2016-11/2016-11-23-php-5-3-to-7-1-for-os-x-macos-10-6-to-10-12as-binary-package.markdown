---
layout: post
title: "Max OSX에 PHP (5.3 ~ 7.1) 바이너리 패키지 설치"
date: 2016-11-23 22:30:00 +09:00
comments: true
categories: ["osx", "php"]
---

대부분의 PHP 작업은 [vagrant](https://www.vagrantup.com/)를 사용해서 linux에서 한다. 하지만 경우에 따라 OSX에서도 PHP 실행이 필요하다. 이럴때 주로 사용하는 PHP 버전과 OSX에서 제공하는 PHP의 버전이 다를 경우 다소 불편해서 가급적 버전을 맞추어 사용한다.

이런 상황에서 유용한 것이 [PHP 5.3 to 7.1 for OS X / macOS 10.6 to 10.12 as binary package](https://php-osx.liip.ch/)에서 제공하는 바이너리 패키지이다. 쉘 스크립트 한줄로 원하는 PHP 버전을 설치해 준다(/usr/local/php5에 설치한다).

이 패키지는 OSX 10.6부터 10.12(OS X 10.6 Snow Leopard, OS X 10.7 Lion, OS X 10.8 Mountain Lion, OS X 10.9 Mavericks, OS X 10.10 Yosemite, OS X 10.11 El Capitan, macOS 10.12 Sierra)를 지원하며 PHP 7.1 / 7.0 / 5.6 / 5.5 / 5.4 / 5.3을 선택할 수 있다.

아래는 각 버전별 설치 방법이다. OSX 버전은 상관없다. 설치 스크립트 내에서 OSX 버전에 따라 처리한다. 그리고 설치 과정에서 `sudo` 권한이 요구된다(비밀번호 입력을 요구할 수 있다).

**PHP 7.1 (release candidate)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 7.1
```

**PHP 7.0 (Current stable)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 7.0
```

**PHP 5.6 (Current stable)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 5.6
```

**PHP 5.5 (Old stable)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 5.5
```

**PHP 5.4 (End of life)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 5.4
```

**PHP 5.3 (End of life)**

```bash
$ curl -s https://php-osx.liip.ch/install.sh | bash -s 5.3
```

설치 후에는 `/usr/local/php5/php.d/99-liip-developer.ini`를 수정해야 한다. Timezone이 `date.timezone = Europe/Zurich`로 기본 설정되어 있어 `date.timezone = Asia/Seoul`로 변경한다. Timezone이 크게 중요하지 않거나 App에서 자체적으로 설정하고 있다면 굳이 바꾸지 않아도 된다.

그외 설치 상에서 발생하는 오류나 추가적 내용은 [위 사이트](https://php-osx.liip.ch/)를 참고하자(FAQ, 포함 Extentions 등이 안내되어 있다).
