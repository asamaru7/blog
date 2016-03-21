---
layout: "post"
title: "php composer 속도 개선하기"
date: "2016-03-17T19:20:39+09:00"
comments: true
categories: php
---
[Composer](https://getcomposer.org/)(컴포저)는 PHP의 의존성 관리도구이다. 이 Composer를 사용하면서 가장 큰 단점으로 꼽을 수 있는 것은 느린 속도다. 나만 그렇게 느끼는 것은 아닌지 국내외에 많은 이야기가 있다. 오늘은 그 이야기들을 정리해 보려고 한다.

우선 Composer에 대한 상세한 내용은 [Composer 한국어 매뉴얼](https://xpressengine.github.io/Composer-korean-docs/)을 참고하면 도움이 될 것 같다.

그리고 Composer 속도에 관련된 참고글이다.

* [composer.phar 의 동작이 느릴 때 조치할 수 있는 것들.](http://findstar.pe.kr/archives/532)
* [컴포저(PHP Composer) 속도 향상 시키기](https://www.lesstif.com/pages/viewpage.action?pageId=30277898)

그럼 하나씩 살펴보자.

### Composer 진단

우선 `composer diagnose` 명령을 이용해서 Composer의 상태를 진단할 수 있다. 진단 결과에 따라 개선이 필요한 부분들을 확인하고 개선할 수 있다.

```
$ composer diagnose

Checking composer.json: OK
require.~~~/~~~ : unbound version constraints (dev-master) should be avoided
Checking platform settings: OK
Checking git settings: OK
Checking http connectivity to packagist: OK
Checking https connectivity to packagist: OK
Checking github.com oauth access: OK
Checking disk free space: OK
Checking pubkeys:
Tags Public Key Fingerprint: ~~~
Dev Public Key Fingerprint: ~~~
OK
Checking composer version: OK
```

### Composer 최신버전 사용

`composer diagnose`에서도 Composer의 최신 버전을 사용중인지 알려준다. 가급적 최신 버전의 Composer를 사용하는 것이 속도에 조금이나마 도움이 될 수 있다.

```
$ sudo /usr/local/bin/composer self-update

Updating to version 7c62e2b5346a6a656dd9587203719e35bb768056.
    Downloading: 100%
Use composer self-update --rollback to return to version d6d0435c5437111e42a123b06e4071e26ba7cb6e
```

### prestissimo 플러그인 사용

[prestissimo](https://github.com/hirak/prestissimo) 이라는 Composer 플러그인이 있다. "composer parallel install plugin"이라고 소개하고 있는 플러그인으로 의존성 라이브러리 설치시 병렬 처리를 지원하여 속도를 대폭 개선해 준다고 한다. 확실히 다운로드가 필요한 상황(신규 설치, 버전업)에서는 병렬 처리로 속도가 개선된다.

```bash
$ composer global require hirak/prestissimo
```

설치 후 Composer를 사용(install, update)하면 아래와 같이 다른 모습을 볼 수 있다.

```
Loading composer repositories with package information
Updating dependencies
    Prefetch start: total: 6
    1/6:    https://codeload.github.com/symfony/polyfill-util/legacy.zip/8de62801aa12bc4dfcf85eef5d21981ae7bb3cc4
    2/6:    https://codeload.github.com/symfony/polyfill-php56/legacy.zip/4d891fff050101a53a4caabb03277284942d1ad9
    3/6:    https://codeload.github.com/Imangazaliev/DiDOM/legacy.zip/e492feae44321e2f4882f6e9466614732822f008
    4/6:    https://codeload.github.com/symfony/polyfill-mbstring/legacy.zip/1289d16209491b584839022f29257ad859b8532d
    5/6:    https://codeload.github.com/paragonie/random_compat/legacy.zip/b3313b618f4edd76523572531d5d7e22fe747430
    6/6:    https://codeload.github.com/Seldaek/monolog/legacy.zip/a5f2734e8c16f3aa21b3da09715d10e15b4d2d45
    Finished: success:6, skipped:0, failure:0, total: 6
```

### --prefer-dist 사용

[Faster composer install](http://stackoverflow.com/a/20827631)에 보면 `--prefer-dist` 옵션을 사용함으로써 속도를 향상 시킬 수 있다고 한다.

### [HHVM](http://hhvm.com/) 또는 PHP 7 사용

Composer는 PHP로 제작된 프로그램으로 PHP의 성능에 영향을 많이 받는다. 따라서 보다 빠른 실행기를 사용하는 것이 속도에 도움이 된다. PHP 7을 사용할 수 없다면 [HHVM](http://hhvm.com/)을 사용하는 것이 도움이 될 수 있다. 하지만 Prebuilt Packages를 지원하는 ubuntu나 debian을 사용하는 것이 아니라면 직접 빌드를 해야하므로 귀찮을 수 있다(개인적 생각).

### Disable Xdebug

Xdebug가 켜진 상태에서 Composer를 사용하면 아래와 같은 경고가 나온다. Xdebug를 켠 상태에서는 성능에 매우 큰 영향이 있으니 Xdebug를 끄고 사용하라는 것이다.

```bash
$ composer update

You are running composer with xdebug enabled. This has a major impact on runtime performance. See https://getcomposer.org/xdebug
```

### packagist 미러 사용

아래와 같이 packagist의 레포지토리를 http://packagist.jp로 설정함으로써 약간의 속도 향상(일본이 아무래도 더 가까우니)을 얻을 수 있다고 한다. 하지만 자칫 잘못하면 더 느려질수도 있으므로 테스트를 해서 결정할 것을 권장한다.

```
$ composer config -g repositories.packagist composer http://packagist.jp
# 제거는 아래와 같이
$ composer config -g --unset repositories.packagist
```

### Disable enable_gc

[\[Tip\] Speed Up Composer](https://laracasts.com/discuss/channels/tips/tip-speed-up-composer)에 보면 `enable_gc`를 disable 함으로써 속도를 향상시키는 방법을 안내하고 있다. 하지만 [Disable GC when computing deps, refs #3482](https://github.com/composer/composer/commit/ac676f47f7bbc619678a29deae097b6b0710b799)에서 보면 이와 관련된 패치는 이미 Composer에 반영되어 있으므로 효과가 없다.

---

사실 서두에서 이야기한 것처럼 위 내용들은 여러 곳의 이야기를 나름대로 요약 정리한 것이다. 하지만 모두 효과가 있다고는 말하지 못하겠다. 현재 PHP 7을 사용하고 있는 상황에서 여러가지를 시도 해봐도 Composer의 속도는 느리기만 하다(약간씩의 도움은 되는 것들도 있다).

느린 Composer로 인해 답답한 마음을 달래고자 시간이 되는대로 방법을 찾아보고 있으나 아직은 결론을 얻지 못했다. 그나마 prestissimo를 사용하는 것이 가장 효과적인 것 같다. 앞으로도 여러가지를 시도하여 도움이 될만한 방법을 발견하면 다시 글을 쓰도록 하겠다.
