---
layout: "post"
title: "PHP - Invalid SOS parameters for sequential JPEG 오류 해결"
date: "2016-03-25T10:46:14+09:00"
comments: true
categories: php
---

PHP에서 GD를 이용해서 jpg 이미지를 처리할 때 아래와 같은 오류를 만날 수 있다. 나의 경우는 안드로이드에서 jpg 이미지를 PHP로 전송해서 처리하는 과정에서 이 오류를 만났다(안드로이드여 사라져라).

```
Warning:  imagecreatefromjpeg(): gd-jpeg, libjpeg: recoverable error: Invalid SOS parameters for sequential JPEG
```

이 오류는 PHP Bugs에 [
Bug #39918	imagecreatefromjpeg doesn't work](https://bugs.php.net/bug.php?id=39918)라는 글로도 등록되어 있다. 일단 PHP Bugs에서는 버그가 아닌 것으로 분류해 놓았지만 대부분의 다른 커뮤니티들에서는 버그라고 이야기하고 있다.

어쨌든 해결 방법은 아래와 같다.

```php
@ini_set('gd.jpeg_ignore_warning', 1);
```

위 코드를 [imagecreatefromjpeg](http://php.net/manual/kr/function.imagecreatefromjpeg.php)를 사용하기 전에 넣으면 된다(그냥 맨 위쪽). 아니면 php.ini에 위 내용을 형식에 맞게 추가해도 된다.

그런데 문제는 이것만으로는 완전히 해결이 되지 않을 수 있다. 아래와 같은 오류가 추가적으로 날 수 있다.

```
Warning:  imagecreatefromjpeg(): '/tmp/php6eEm0r' is not a valid JPEG file in ~~
```

따라서 위 처리 외에도 imagecreatefromjpeg 사용시 `@`를 붙여 아래와 같이 사용해야 한다.

```php
$source = @imagecreatefromjpeg($sourcePath);
```

`@`를 사용하는 것은 권장되지 않지만 이 경우는 어쩔 수 없다(오류 출력 범위를 변경하는 등의 방법이 있으나 이 부분만 이렇게 처리하는게 낫다).

이렇게 처리하고 나면 기능이 원하는대로 정상 동작한다(`not a valid JPEG file`라고 했지만 실제로는 정상적인 jpg 파일이므로)
