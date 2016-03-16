---
layout: "post"
title: "Mac OSX(10.6 – 10.11)에서 PHP(5.6 / 7) 업그레이드"
date: "2016-03-11T08:43:17+09:00"
comments: true
categories: php
---
현재 기준으로 El Capitan에서 PHP 버전은 5.5.30이다. 웬만한 PHP 라이브러리는 동작하는데 문제가 없는 버전이긴 하지만 PHP 7이 최신 버전이며 작업에 따라 더 높은 버전의 PHP가 필요할 수 있다. 나의 경우도 웬만한 작업은 Vagrant에서 하므로 OSX의 PHP 버전은 문제가 되지 않지만 이번에 몇가지를 테스트하기 위해 OSX의 PHP를 버전업 하기로 했다.

OSX에서의 PHP 버전업은 [Upgrade to PHP 5.6 or 7 on Mac OSX 10.11 El Capitan and OSX 10.6 – 10.10](http://coolestguidesontheplanet.com/upgrade-php-on-osx/)에 잘 나와있다. 아니 설명할 것이 거의 없을 정도로 아주 간단하다.

```bash
# PHP 5.6으로 버전업
curl -s http://php-osx.liip.ch/install.sh | bash -s 5.6

# PHP 7.0으로 버전업
curl -s http://php-osx.liip.ch/install.sh | bash -s 7.0
```

위처럼 쉘 스크립트를 실행해 주고 기다리면 거의 모든 작업이 완료된다(시간은 조금 걸린다).

이제는 잘 설치되었는지 확인.

### PHP 버전 확인

```bash
/usr/local/php5/bin/php --version
php --version
```

위처럼 해보면 `/usr/local/php5/bin/php --version`는 PHP가 버전업된 것으로 보이지만 `php --version`는 기존 버전으로 나올 것이다.

```bash
which php
```

위 명령을 넣으면 실행되는 PHP의 경로를 볼 수 있다. 나의 경우엔 `/usr/bin/`이다. 여기엔 PHP 기본 실행 파일 외에도 몇가지 관련 파일이 있는데 이 파일들을 새로 설치한 파일들로 교체 해주면 된다. 그런데 어떤 파일들을 바꿔야 할지 잘 모르거나 보다 간단한 방법을 찾고 있다면 아래의 방법을 사용하자.

```bash
# 현재 계정 적용
echo "export PATH=/usr/local/php5/bin:\$PATH" >> ~/.profile
# 또는
# 전체 계정 적용
echo "export PATH=/usr/local/php5/bin:\$PATH" >> /etc/bashrc
```

이제 shell을 다시 열어 `php --version` 해보면 새로 설치된 PHP 버전을 확인 할 수 있다.

### 웹 접속 확인

우선 httpd.conf는 El Capitan 기준으로 `/etc/apache2/httpd.conf`에 있다. 여기서 `DocumentRoot`를 확인하면 기본 웹 접근 경로를 알 수 있다. 이것 또한 El Capitan 기준으로  "/Library/WebServer/Documents"이다.

```bash
vi /Library/WebServer/Documents/phpinfo.php
```

위처럼 새로 파일을 하나 열어서 아래의 내용을 넣는다.

```php
<?php phpinfo();
```

이제는 [http://localhost/phpinfo.php](http://localhost/phpinfo.php)에 접속해서 페이지가 잘 나오는지 본다. 페이지가 나왔다면 PHP 버전도 확인 가능할 것이다. 나의 경우는 7.0.4가 설치되어 있다.

---

덤으로 composer 설치.

```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```
