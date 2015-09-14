---
layout: post
title: "PHP에서 soundex / metaphone key 구하기"
date: 2015-09-14 21:18:40 +0900
comments: true
categories: php
---
앞선 포스팅에서 [levenshtein()](/2015/09/14/calculate-distance-between-two-strings-in-php-levenshtein/) 함수, [similar_text()](/2015/09/14/calculate-distance-between-two-strings-in-php-similar-text)에 대해 알아보았다.
이런 문자열 비교 함수는 아니지만 문자열의 soundex key를 구하여 발음이 유사한 단어들을 찾을 수 있도록 도와주는 soundex() 함수에 대해서 알아보자. 이를 응용해서 알파벳 문자열의 유사도를 개선하는데에 응용할 수도 있을 것 같다.

## soundex란?

> Soundex란 발음이 유사한 서로다른 철자의 단어를 그룹화하여 철자 입력 오류를 보정하기 위한 색인시스템으로 초기에는 주로 사람이름을 검색하기 위한 용도로 사용되었으나 인터넷 검색이 활성화되면서 다양한 분야에서 응용되고 있다. 대표적인 Soundex Appliation은 “US Bureau of the Censu s”의 것이며, AT&T의 Standard soundex algorithm도 있다.
> (츨처 : http://www.nicklib.com/nlp/2297)

사실 soundex는 알파벳을 기준으로 만들어져 한글에는 적용할 수 없다. 하지만 프로그램을 하나보면 알파벳에 대해서 만이라도 유사 발음에 대한 검색을 해야할 일이 있으므로 부분적으로는 가치가 있다.

## [soundex()](http://php.net/manual/en/function.soundex.php) 함수

[php 메뉴얼의 설명](http://php.net/manual/en/function.soundex.php)에 따르면 soundex() 함수는 발음이 유사한 단어들이 같은 soundex 키를 생성하므로, 발음은 알고 있지만 스펠은 모르는 단어를 데이터베이스에서 쉽게 찾을 수 있다. soundex 함수는 문자로 시작하는 4문자 문자열을 반환한다.

이 soundex 함수는 "The Art Of Computer Programming, vol. 3: Sorting And Searching", Addison-Wesley (1973), 391-392쪽에서 Donald Knuth가 기술한 것이다.

### 기본 사용법

```php
string soundex ( string $str )
```

### 함수 인자

#### str
입력 문자열

### 반환값

soundex 키를 문자열로 반환한다.


### 예시

```php
<?php
soundex("Euler")       == soundex("Ellery");    // E460
soundex("Gauss")       == soundex("Ghosh");     // G200
soundex("Hilbert")     == soundex("Heilbronn"); // H416
soundex("Knuth")       == soundex("Kant");      // K530
soundex("Lloyd")       == soundex("Ladd");      // L300
soundex("Lukasiewicz") == soundex("Lissajous"); // L222
```