---
layout: post
title: "PHP에서 두 문자열의 거리(유사도) 구하기"
date: 2015-09-14 14:52:05 +0900
comments: true
categories: php
---

php 프로그램 개발중 문자열의 유사도를 계산해야 할 일이 생겼다. 그래서 찾다보니 php 내장 함수에 해당 기능이 이미 구현되어 있었다. 비슷한 함수가 몇가지 존재하고 있어서 조금 더 자세히 알아 보았다.

## [levenshtein()](http://php.net/manual/en/function.levenshtein.php) 함수

위키피디아에 [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance)에 대한 상세한 설명이 나와있다.

[php 메뉴얼의 설명](http://php.net/manual/en/function.levenshtein.php)에 따르면 Levenshtein distance는 문자열1을 문자열2로 변환하는데 필요한 최소한의 치환, 추가, 삭제의 횟수를 나타낸다고 되어 있다. 이 알고리즘의 시간복잡도는 ```O(m*n)```이며, 여기서 m과 n은 str1, str2의 각각의 길이다. 비슷한 함수인 [similar_text()](http://php.net/manual/en/function.similar-text.php)가 가지는 시간 복잡도 ```O(max(n,m)**3)```에 비해서는 덜하지만 그래도 비싼 처리 비용이 든다.

함수의 기본형 사용시 위의 설명대로 변환에 필요한 최소한의 치환, 추가, 삭제의 횟수를 계산하지만 추가 인자를 사용하면 각 변환에 필요한 비용을 지정할 수 있다. 이것은 더 일반적이고 적용성이 높지만 효율적이지 못하다.

### 기본 사용법

```php
int levenshtein ( string $str1 , string $str2 )
```

### 확장 사용법

```php
int levenshtein ( string $str1 , string $str2 , int $cost_ins , int $cost_rep , int $cost_del )
```

### 함수 인자

#### str1
Levenshtein distance를 계산할 문자열1

#### str2
Levenshtein distance를 계산할 문자열2

#### cost_ins
문자 추가 비용(가중치)

#### cost_rep
문자 치환 비용(가중치)

#### cost_del
문자 삭제 비용(가중치)

### 예시

메뉴얼에 나와 있는 예시 중 UTF-8 인코딩에 관련된 문제와 해결방법이 나와있어서 그 예시를 제시한다.

```php
<?php
echo levenshtein('notre', 'votre');
echo "\n";
echo levenshtein('notre', 'nôtre');
echo "\n";

// 결과
// 1
// 2
```

위의 결과를 보면 의아할 수 있다. 분명 두 예시 모두에서 글자가 하나씩 다르므로 결과가 1과 1이 나올 것이라고 예상되지만 결과는 1과 2가 나왔다. 이유는 UTF-8문자열 때문이다. 이를 개선하는 함수의 예시는 다음과 같다.

```php
<?php
// Convert an UTF-8 encoded string to a single-byte string suitable for
// functions such as levenshtein.
//
// The function simply uses (and updates) a tailored dynamic encoding
// (in/out map parameter) where non-ascii characters are remapped to
// the range [128-255] in order of appearance.
//
// Thus it supports up to 128 different multibyte code points max over
// the whole set of strings sharing this encoding.
//
function utf8_to_extended_ascii($str, &$map)
{
    // find all multibyte characters (cf. utf-8 encoding specs)
    $matches = array();
    if (!preg_match_all('/[\xC0-\xF7][\x80-\xBF]+/', $str, $matches))
        return $str; // plain ascii string

    // update the encoding map with the characters not already met
    foreach ($matches[0] as $mbc)
        if (!isset($map[$mbc]))
            $map[$mbc] = chr(128 + count($map));

    // finally remap non-ascii characters
    return strtr($str, $map);
}

// Didactic example showing the usage of the previous conversion function but,
// for better performance, in a real application with a single input string
// matched against many strings from a database, you will probably want to
// pre-encode the input only once.
//
function levenshtein_utf8($s1, $s2)
{
    $charMap = array();
    $s1 = utf8_to_extended_ascii($s1, $charMap);
    $s2 = utf8_to_extended_ascii($s2, $charMap);

    return levenshtein($s1, $s2);
}
?>
```

위의 함수를 이용해서 처음 예시를 다시 실행해보자.

```php
<?php
function utf8_to_extended_ascii($str, &$map)
{
    $matches = array();
    if (!preg_match_all('/[\xC0-\xF7][\x80-\xBF]+/', $str, $matches))
        return $str; // plain ascii string

    foreach ($matches[0] as $mbc)
        if (!isset($map[$mbc]))
            $map[$mbc] = chr(128 + count($map));

    return strtr($str, $map);
}

function levenshtein_utf8($s1, $s2)
{
    $charMap = array();
    $s1 = utf8_to_extended_ascii($s1, $charMap);
    $s2 = utf8_to_extended_ascii($s2, $charMap);

    return levenshtein($s1, $s2);
}

echo levenshtein_utf8('notre', 'votre');
echo "\n";
echo levenshtein_utf8('notre', 'nôtre');
echo "\n";

// 결과
// 1
// 1
```

결과는 개선되어 1과 1이 나온다. 하지만 정확한 값이 필요한 것이 아니라면 개선된 함수말고 기본 함수를 써도 무방하다. 일반적으로 사용할 때는 가장 비슷한 문자열을 찾는 등에 사용할테니 인코딩에 따른 값차이는 크게 의미를 가지지 않는다. 게다가 처리 비용도 더 많이 든다.