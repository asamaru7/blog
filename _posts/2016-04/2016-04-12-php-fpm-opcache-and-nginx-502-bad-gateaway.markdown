---
layout: post
title: "php-fpm opcache로 인한 Nginx - 502 bad gateaway 오류"
date: 2016-04-12 15:39:21 +09:00
comments: true
categories: php
---
얼마 전부터 서비스 사용자로부터 이상한 오류 보고를 비주기적으로 받고 있다.

특정 페이지에 접속시 `502 Bad gateaway` 오류가 난다는 것이다. 하지만 그 오류가 나는 페이지에 특별히 눈에 띄는 부분은 없다. 게다가 동일한 프로그램이 몇개의 폴더에서 동시에 사용 중임에도 꼭 한군데서만 동일한 문제를 일으킨다. 게다가 일시적으로 발생하고 사라지지 않고 한번 오류가 발생하면 그 후에 해당 페이지에 접속하면 해결 전까지는 계속 502 에러를 보인다. 게다가 해당 오류가 발생하는 조건을 알 수 없어 오류 재연이 불가능한 상황이라 원인 파악에 애를 먹고 있다.

현재 해당 서버는 CentOS 6.7에 nginx + php-fpm으로 서비스 되고 있고 opcache와 apcu 등이 적용되어 있다. 오류가 난 상황에서는 로그에 아래와 같은 기록이 남는다.

**/var/log/nginx/error.log**

```
2016/04/12 14:50:43 [error] 2481#2481: *1828457 recv() failed (104: Connection reset by peer) while reading response header from upstream, client: ~~~.~~~.~~~.~~~, server: ~~~, request: "GET /~~~ HTTP/1.1", upstream: "fastcgi://~~~:", host: "~~~", referrer: "~~~"
```

**/var/log/php-fpm/error.log**

```
[12-Apr-2016 14:54:39] WARNING: [pool www] child 24352 exited on signal 11 (SIGSEGV) after 301.965713 seconds from start
[12-Apr-2016 14:54:39] NOTICE: [pool www] child 24510 started
```

현재로써는 일단 오류가 발생하면 해당 서버의 opcache를 초기화해주면 문제는 즉시 해결된다. 따라서 opcache의 오류로 판단하고 있다.

이 문제와 관련해서 검색해보니 비슷한 증상을 보이는 사례들이 많았다. 대부분의 경우 해결책은 opcache를 끄도록 설정하는 것을 제시하고 있다. 하지만 opcache는 당연히 필요하니 사용하던 것이라 그냥 끌수는 없다. 다른 방법으로 [Apache 2.4 + Opcache + APCu = 502?](http://offandon.org/2015/12/apache-2-4-opcache-apcu-502/)에 보면 아래와 같은 방법을 제시하고 있다.

**/etc/php.d/opcache.ini:**

```
opcache.fast_shutdown=0
opcache.enable_cli=0
```

하지만 `fast_shutdown`의 경우도 성능을 위해 사용하는 것이 권장되고 있는 옵션으로 그냥 끌수는 없다. 사실 문제가 해결된다는 보장도 없다(글쓴이도 정확하게 이해한 것이 아니라고 한다).

여기서 잠깐 `fast_shutdown`에 대해 조금 알아보자. [PHP 매뉴얼 OPcache 설치/설정](http://php.net/manual/kr/opcache.configuration.php#ini.opcache.fast-shutdown)에 보면 아래와 같이 설명되어 있다.

>**opcache.fast_shutdown boolean**
>
>If enabled, a fast shutdown sequence is used that doesn't free each allocated block, but relies on the Zend Engine memory manager to deallocate the entire set of request variables en masse.

정확한 의미는 모르겠지만 메뉴얼([Recommended php.ini settings ](http://php.net/manual/kr/opcache.installation.php)) 상에서도 아래와 같이 `fast_shutdown`를 켜는 것을 권장하고 있다.

```
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
opcache.enable_cli=1
```

다른 문서인 [Best Zend OpCache Settings/Tuning/Config](https://www.scalingphpbook.com/blog/2014/02/14/best-zend-opcache-settings.html)에서도 켜는 것을 권장하고 있다. 따라서 이 옵션을 끄는 것도 보류.

현재 프로그램에서 의심되는 부분(다른 파일과 동일한 namespace와 class명을 사용)을 수정하고 opcache의 몇가지 옵션을 조정해서 다시 오류가 발생하는지 지켜보고 있다. 다시 오류가 재연되면 opcache 관리 페이지에서 전체 초기화가 아닌 파일 단위로 초기화하면서 원인 파일을 찾으려고 한다(진작에 했어야 하는 일이지만 서비스 중인 상태로 최대한 빨리 복구해야 해서 많은 시간을 들여 오류 위치를 찾을 수 없었다).

원인 파일을 찾고 나면 소스를 리뷰한 후 특별한 문제를 찾지 못할 경우 해당 파일만 opcache에서 제외시킬 계획이다.

제외하는 방법은 `opcache.blacklist_filename`에 지정된 파일에 해당 파일 경로를 추가하면 된다. 나의 경우는 `opcache.blacklist_filename = /etc/php.d/opcache*.blacklist`로 설정되어 있고 `/etc/php.d/opcache-default.blacklist` 파일이 기본적으로 생성되어 있다. 현재 테스트 서버에서 `/etc/php.d/opcache-default.blacklist`에 특정 파일 경로를 추가해서 opcache에서 정상적으로 제외되는지 확인은 마쳤다.

php를 10여년 넘게 써오면서 이런 경우는 처음이다. 프로그램을 수정한 부분으로 문제가 해결되었으면 하는 바람이다.

**첨부**

위 상황과는 관련이 없지만 불특정하게 발생하지 않는 일반적인 상황에서의 502 오류라면 [nginx + PHP-fpm에서 502 Bad gateway 에러 해결법 총정리](https://gom2.net/502-bad-gateway-solution-on-nginx-php_fpm/)를 참고하면 도움이 될 것이다.
