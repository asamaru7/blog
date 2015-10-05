---
layout: post
title: "htmlspecialchars_decode와 html_entity_decode의 문자열 처리의 다른 점"
date: 2015-09-10 14:27:01 +0900
comments: true
categories: php
---

php에서 html 구문을 그대로 출력하기 위해 [htmlspecialchars](http://php.net/manual/kr/function.htmlspecialchars.php)를 사용한다. 반대로 출력된 문장(Special HTML entities)을 되돌리기 위해서는 일반적으로 [htmlspecialchars_decode](http://php.net/manual/kr/function.htmlspecialchars-decode.php)를 많이 사용한다. 그런데 이 함수를 사용하는데 문제가 있다.
htmlspecialchars_decode는 `&nbsp;`를 공백으로 다시 되돌려 주지 않는다.

다시 htmlspecialchars로 돌아가서 메뉴얼을 보면 아래와 같이 변환된다고 설명되어 있다.

* '&'(앰퍼샌드)는 '`&amp;`'가 됩니다
* '"'(겹따옴표)는 ENT_NOQUOTES를 설정하지 않았을 때 '`&quot;`'가 됩니다.
* '''(홑따옴표)는 ENT_QUOTES가 설정되었을 때만 '`&#039;`'가 됩니다.
* '<'(미만)은 '`&lt;`'가 됩니다.
* '>'(이상)은 '`&gt;`'가 됩니다.

보다시피 엄밀히 말하자면 htmlspecialchars는 공백을 변환시키지 않는다. 따라서 대응되는 함수인 htmlspecialchars_decode는 `&nbsp;` 공백 문자열을 되돌리지도 않는다.

그럼 `&nbsp;`와 같은 것은 어떻게 처리를 해야할까?
[html_entity_decode](http://php.net/manual/en/function.html-entity-decode.php)를 사용하면 된다. 이 함수는 [htmlentities](http://php.net/manual/kr/function.htmlentities.php)와 대응되는 함수이다.

그럼 htmlentities 함수는 무엇인가? 메뉴얼에 따르면 다음과 같다.

> htmlentities()는 HTML 문자 엔티티에 존재하는 모든 문자를 엔티티로 변환하는 점을 제외하면, htmlspecialchars()와 완전히 동일합니다.

중요한 부분은 모든 문자를 변환한다는 점이다. 이 부분이 htmlspecialchars와의 차이라고 한다.

정리하자면

> htmlspecialchars와 htmlentities는 유사하나 htmlentities가 더 많은 문자를 변환한다.
> htmlspecialchars_decode와 html_entity_decode는 유사하나 html_entity_decode가 더 많은 문자를 되돌린다.

따라서 결론은 `&nbsp;`와 같은 문자열까지 모두 decode 하려면 html_entity_decode를 사용하면 된다.

## 주의

자.. 이렇게 해피앤딩이 되면 좋겠지만 몇가지 주의 사항이 있다. html_entity_decode 메뉴얼을 보면 다음과 같은 설명이 있다.

> You might wonder why trim(html_entity_decode('&nbsp;')); doesn't reduce the string to an empty string, that's because the '&nbsp;' entity is not ASCII code 32 (which is stripped by trim()) but ASCII code 160 (0xa0) in the default ISO 8859-1 encoding.

그렇다. html_entity_decode를 사용해서 `&nbsp;`를 변환하면 공백이 일반적인 공백과는 다른 공백이다. 이게 왜 문제가 되느냐? 아래의 예시를 보자.

```php
<?php
$str = trim(html_entity_decode("&nbsp;X&nbsp;"));
echo (strcmp($str, 'X') == 0) ? 'ok' : 'oops';
```

쉽게 생각하면 'ok'가 나올것 같지만 위에 설명했던 것과 같이 'oops'가 나온다. 그럼 어떻게 해결을 해야할까?

메뉴얼에서 ASCII code 160 (0xa0)로 변경된다고 하니 이것을 참고해서 조금 고쳐보자.

```php
<?php
$str = trim(str_replace("\xa0", "", html_entity_decode("&nbsp;X&nbsp;")));
echo (strcmp($str, 'X') == 0) ? 'ok' : 'oops';
```

이제 해결이 되었을까? 아니다. 결과는 oops이다.(사실 default_charset에 따라 ok가 나올 수도 있다.) 이유는 위에 메뉴얼에 있다.
'default ISO 8859-1' 인코딩일 때 0xa0로 변환된다고 되어 있다. 사실 나의 환경은 'UTF-8'이다. 대부분 그럴 것이라고 생각한다. 일단 맞는지 확인해 보자. 아래와 같이 default_charset을 ISO-8859-1에 맞추고 실행해보자.

```php
<?php
$str = trim(str_replace("\xa0", "", html_entity_decode(iconv('UTF-8', 'ISO-8859-1', "&nbsp;X&nbsp;"))));
echo (strcmp($str, 'X') == 0) ? 'ok' : 'oops';
```

결과는 메뉴얼대로 'ok' 이다. 그럼 'UTF-8'에서는 어떻게 하나? 아래의 코드를 보자.

```php
<?php
$str = trim(str_replace("\xc2\xa0", "", html_entity_decode("&nbsp;X&nbsp;")));
echo (strcmp($str, 'X') == 0) ? 'ok' : 'oops';
```

드디어 'ok'가 나온다. 중요한 차이는 "\xc2\xa0" 이다. UTF-8에서는 "\xc2\xa0"는 [UTF-8 encoding table and Unicode characters](http://www.utf8-chartable.de/unicode-utf8-table.pl?start=128&number=128&utf8=string-literal&unicodeinhtml=hex)에서 확인해보면 UTF-8에서의 "NO-BREAK SPACE"라고 되어 있다.

참 별것 아닌것 같은 함수가 잘모르고 사용하다보면 예상치 못한 문제들을 일으킨다. 사실 `&nbsp;`만 처리하면 된다면 더 간단하게 `str_replace('&nbsp;', ' ', $str)`로 해결해도 된다. 하지만 프로그램에선 항상 어떤 값이 들어올지 모르는 것이니 보다 명확하게 처리하는 것이 낫지 않을까?
