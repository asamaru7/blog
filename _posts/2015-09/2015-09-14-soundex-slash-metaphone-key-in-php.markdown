---
layout: post
title: "PHP에서 soundex / metaphone key 구하기"
date: 2015-09-14 21:19:33 +0900
comments: true
categories: php
---

앞선 포스팅에서 [levenshtein()](/2015/09/14/calculate-distance-between-two-strings-in-php-levenshtein/) 함수, [similar_text()](/2015/09/14/calculate-distance-between-two-strings-in-php-similar-text)에 대해 알아보았다.
이런 문자열 비교 함수는 아니지만 문자열의 soundex key를 구하여 발음이 유사한 단어들을 찾을 수 있도록 도와주는 soundex() 함수와 이보다 더 정확한 결과를 반환한다고 하는 metaphone() 함수에 대해서 알아보자.


## soundex란?

> Soundex란 발음이 유사한 서로다른 철자의 단어를 그룹화하여 철자 입력 오류를 보정하기 위한 색인시스템으로 초기에는 주로 사람이름을 검색하기 위한 용도로 사용되었으나 인터넷 검색이 활성화되면서 다양한 분야에서 응용되고 있다. 대표적인 Soundex Appliation은 “US Bureau of the Censu s”의 것이며, AT&T의 Standard soundex algorithm도 있다.
> (츨처 : http://www.nicklib.com/nlp/2297)

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

## [metaphone()](http://php.net/manual/en/function.metaphone.php) 함수

[php 메뉴얼의 설명](http://php.net/manual/en/function.metaphone.php)에 따르면 metaphone() 함수는 soundex()처럼 유사한 발음의 단어에 대해 동일한 키를 생성다. 이 함수는 영어 발음의 기본 법칙을 사용하는 soundex()보다 훨씬 정확하다. 메타폰 생성 키는 가변 길이를 가진다.

metaphone은 Lawrence Philips <lphilips at verity dot com>가 개발하였였고 이는 ["Practical Algorithms for Programmers", Binstock & Rex, Addison Wesley, 1995]에 수록되어 있다.

### 기본 사용법

```php
string metaphone ( string $str [, int $phonemes ] )
```

### 함수 인자

#### str

입력 문자열.

#### phonemes

이 매개 변수는 음소 문자로 반환된 metaphone key의 길이를 제한한다. 0이 디폴트 값으로 제한하지 않음을 의미한다.

### 반환값

메타폰 키를 문자열로 반환한다.

## 응용 아이디어

알파벳 문자열의 유사도를 개선하는데에 응용할 수도 있을 것 같다. 문자열을 soundex나 metaphone key로 변환하여 문자열 유사도를 비교하면 조금 더 개선된 유사도를 구할 수 있을 것 같다. 정확히는 다른 의미가 되지만 발음이 유사한 문장을 유사 문장으로 인정하는 효과를 얻을 수 있을 것이다.

사실 중요한 문제는 soundex나 metaphone 뿐만 아니라 Double Metaphone, Caverphone 같은 알고리즘은 알파벳 문자에 대한 음성 특징을 추출하는 것으로 한글에는 사용할 수 없다. 하지만 한글을 초/중/종성으로 분리하고 발음 기호로 변환하는 부분을 추가 처리하면 한글에도 응용할 수 있을 것으로 보인다.

게대가 한글을 영어 발음으로 변환하는 오픈소스들도 찾아보니 있다.(https://metacpan.org/pod/Lingua::KO::Munja)

추후에 기회가 된다면 직접 구현 해봐야겠다.