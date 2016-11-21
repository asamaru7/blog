---
layout: post
title: "PHP 삼항 연산자 : Ternary Operator 와 Null Coalesce Operator"
date: 2016-11-07 08:02:12 +09:00
comments: true
categories: php
---
[PHP](http://php.net/)에도 [삼항 연산자:Ternary operator](http://php.net/manual/kr/language.operators.comparison.php#language.operators.comparison.ternary)
가 있다. [메뉴얼](http://php.net/manual/kr/language.operators.comparison.php#language.operators.comparison.ternary)에는 아래와 같이 설명되어 있다.

```php
<?php
// 사용 예제: 삼항 연산자
$action = (empty($_POST['action'])) ? 'default' : $_POST['action'];

// 위 예제는 다음의 if/else 구문과 동일합니다
if (empty($_POST['action'])) {
    $action = 'default';
} else {
    $action = $_POST['action'];
}
```

>(expr1) ? (expr2) : (expr3) 표현은 expr1이 TRUE이면 expr2로 평가되고, expr1이 FALSE이면 expr3로 평가됩니다.
PHP 5.3부터, 삼항 연산자의 중간 부분을 비울 수 있습니다. 표현식 expr1 ?: expr3은 expr1이 TRUE이면 expr1, 아니면 expr3를 반환합니다.

PHP 5.3부터 `expr2`를 비울 수 있다고 되어 있다. 다시 말해 `(expr1) ?: (expr3)`라는 표현을 사용할 수 있다.

그리고 한가지. 아래와 같이 삼항식을 중첩할 경우는 괄호를 사용해서 묶어줄 것을 권장한다.

>삼항 연사자를 "쌓는" 일을 피하길 권합니다. 하나의 구문에서 하나를 초과하는 삼항 연산자를 사용할 때, PHP 작동은 명확하지 않습니다:
Example #3 명확하지 않은 삼항 작동

```php
<?php
// 얼핏 보기에, 'true'를 출력할 것 같습니다
echo (true?'true':false?'t':'f');

// 그러나 위의 실제 출력은 't'입니다
// 이는 삼항 표현이 왼쪽에서 오른쪽으로 평가되기 때문입니다

// 다음이 위 코드와 동일한 더 명확한 버전입니다
echo ((true ? 'true' : 'false') ? 't' : 'f');

// 여기서, 첫 표현이 'true'로 평가되고, 이것이
// (bool)true로 전환되어 평가된 후, 두번째
// 삼항 표현의 true쪽을 반환합니다.
?>
add a note add a note
```

이와 유사하지만 다른 삼항 연산자인 [Null 병법 연산자:Null Coalesce Operator](https://wiki.php.net/rfc/isset_ternary)가 PHP 7부터 지원된다. 한글 이름을 딱히 뭐라 부를지가 애매한데 [위키피디아](https://ko.wikipedia.org/wiki/PHP)에서 "Null 병법 연산자"라는 이름을 사용하고 있다.

```php
isset($_GET['mykey']) ? $_GET['mykey'] : ""
```

위 두가지 삼항식은 동일한 것 같지만 자세히보면 다르다. 한가지는 [empty](http://php.net/manual/kr/function.empty.php)를 다른 한가지는 [isset](http://php.net/manual/kr/function.isset.php)을 대체한다.

그리고 한가지 알아야할 중요한 사항이 있다. [PHP ternary operator vs null coalescing operator](http://stackoverflow.com/a/34571460/6736772)에 예시가 나와 있듯이 `?:`는 선언되지 않은 변수를 사용할 경우 E_NOTICE가 발생한다. 다시말해 완전히 [empty](http://php.net/manual/kr/function.empty.php) 처럼 동작하는 것은 아니다. 
