---
layout: post
title: "PHP에서 두 문자열의 거리(유사도) 구하기 - similar_text()"
date: 2015-09-14 20:13:22 +0900
comments: true
categories: php
---
앞선 포스팅 [PHP에서 두 문자열의 거리(유사도) 구하기 - levenshtein()](/2015/09/14/calculate-distance-between-two-strings-in-php-levenshtein/)에서 levenshtein() 함수에 대해 알아보았다. 이번엔 이와 유사한 함수인 similar_text()에 대해 알아보고자 한다.

## [similar_text()](http://php.net/manual/en/function.similar-text.php) 함수

[php 메뉴얼의 설명](http://php.net/manual/en/function.similar-text.php)에 따르면 similar_text() 함수는 두 문자열의 유사도를 계산한다고 되어 있다.

두 문자열의 유사도를 이 계산은 Programming Classics: Implementing the World's Best Algorithms by Oliver (ISBN 0-131-00413-1) 에서 설명되어 있다. 이 구현은 pseudo code와 다르게 스택은 아니지만, 재귀 호출이므로 전체 프로세스의 속도에 영향을 줄 수 있다. 이 계산 알고리즘은 시간복잡도 `O(N**3)`를 가지며 여기서 N은 두 문자열 중 긴 문자열의 길이를 뜻한다.

문자열의 길이에 따라 성능이 극도로 떨어질 수 있으므로 가급적 짧은 문장의 비교에 사용하는 것이 좋다. 메뉴얼에서 paul은 20000자 이상에서만 성능에 문제가 있었다고는 하나 시간복잡도를 보더라도 긴 문자열은 자제하는게 좋겠다.

### 기본 사용법

```php
int similar_text ( string $first , string $second [, float &$percent ] )
```

### 함수 인자

#### first
첫번째 문자열

#### second
두번째 문자열

#### percent
reference로 넘겨져야하는 세번째 인자는 similar_text() 함수의 계산 결과인 문서 유사도를 퍼센트(%)로 제공해 준다.

### 반환값

두 문자열에서 매칭되는 문자수를 반환한다.


### 예시

이 함수는 몇가지 특성을 가지고 있으므로 메뉴얼에 안내되어 있는 아래의 예시들을 통해 차이를 알고 사용해야 한다.

#### 인자의 입력 순서에 따라 결과가 달라진다.

```php
<?php
$var_1 = 'PHP IS GREAT';
$var_2 = 'WITH MYSQL';

similar_text($var_1, $var_2, $percent);

echo $percent;
// 27.272727272727

similar_text($var_2, $var_1, $percent);

echo $percent;
// 18.181818181818
```

#### 공백은 비교에서 제외된다.(그렇다고 trim이 되거나 문자열 내 공백이 제거되고 비교하는 것은 아니다.)

```php
<?php
echo similar_text(" ", "", $sim);
echo " -> ";
echo $sim;
echo "\n";
echo similar_text("ab c", "abc", $sim);
echo " -> ";
echo $sim;
echo "\n";
echo similar_text(" abc", "abc", $sim);
echo " -> ";
echo $sim;
echo "\n";

// 결과
// 0 -> 0
// 3 -> 85.714285714286
// 3 -> 85.714285714286
```

#### 대소문자를 구분한다.

```php
<?php
$var1 = 'Hello';
$var2 = 'Hello';
$var3 = 'hello';

echo similar_text($var1, $var2);  // 5
echo similar_text($var1, $var3);  // 4
```

### 유사함수

비슷한 역할을 하는 함수에 대해 알고 싶다면 아래의 포스팅을 참고하자.

* [PHP에서 두 문자열의 거리(유사도) 구하기 - levenshtein()](/2015/09/14/calculate-distance-between-two-strings-in-php-levenshtein/)
