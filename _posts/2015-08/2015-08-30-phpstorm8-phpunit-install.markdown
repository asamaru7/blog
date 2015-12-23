---
layout: post
title: "phpstorm8 phpunit 설치"
date: 2015-08-30 07:07:32 +0900
comments: true
categories: php
---
phpstorm8 phpunit 세팅법

* PHPStorm
- preferences > php > phpunit > + > By remote interpreter
- remote server 추가 : ssh로 접속 설정
- path to phpunit.phar 선택 > path to phpunit.phar : /czdev/vagrant/work/phpunit.phar
- Default configuration file : /home/web/makeus/CZFramework/tests/phpunit.xml
- Default bootstrap file : /home/web/makeus/CZFramework/tests/bootstrap.php

* 해당 서버에서 작업 : 로컬 경로와 서버의 경로가 같아야 실행에 문제가 없음

```bash
su -
cd /
mkdir /czdev/vagrant/work/ : 로컬과 같은 경로 생성
wget https://phar.phpunit.de/phpunit.phar
ln -s /home/web ./ : 로컬 소스 경로 맞춤
```