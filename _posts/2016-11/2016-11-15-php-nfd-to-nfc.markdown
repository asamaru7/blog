---
layout: post
title: "PHP에서 NFD(Normalization Form D) / NFC(Normalization Form C) 변환"
date: 2016-11-15 13:57:44 +09:00
comments: true
categories: ["php", "osx"]
---

Mac OSX는 경우 문자열을 [Unicode Normalization Forms](http://unicode.org/reports/tr15/) 중 NFD(소리 마디를 첫가끝 코드로 분해)로 처리한다(일반적으로는 NFC(첫가끝 코드를 소리 마디로 결합)를 사용).
이는 한글([U+AC00](http://www.unicode.org/charts/PDF/UAC00.pdf)) 영역을 사용하는 곳에서는 한글이 모두 풀어진 상태로 보이는 문제가 있다.
따라서 [U+1100](http://www.unicode.org/charts/PDF/U1100.pdf) 영역을 [U+AC00](http://www.unicode.org/charts/PDF/UAC00.pdf) 영역으로 변환하는 과정이 필요하다.

[한글 인코딩의 이해 2편: 유니코드와 Java를 이용한 한글 처리](http://d2.naver.com/helloworld/76650)에서는 [유니코드 정규화](https://ko.wikipedia.org/wiki/%EC%9C%A0%EB%8B%88%EC%BD%94%EB%93%9C_%EC%A0%95%EA%B7%9C%ED%99%94)([Unicode equivalence](https://en.wikipedia.org/wiki/Unicode_equivalence))를 아래와 같이 소개하고 있다.

> 한글 소리 마디와 한글자모, 한글 자모 확장 이렇게 두 개의 코드 영역이 있다는 것은 같은 글자를 표현하는 서로 다른 두 개의 방법이 있다는 것을 말한다.
이것은 한글뿐만 아니라 다른 언어에서도 나타나는 현상이다. 가령 "ñ"을 표현할 때 U+00F1을 사용할 수도 있고, U+006E (라틴 소문자 "n") 과 U+0303( 결합 틸데 "◌̃")을 연이어 사용하여 표현할 수도 있다.
유니코드 정규화(Unicode equivalence)란 이렇게 연속적인 코드를 사용하여 표현한 어떤 글자를 처리하는 방법을 다루는 명세이다. 유니코드 정규화에는 다음과 같은 네 가지 방법이 있다.

| 정규화 방법 | 예 |
|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NFD (정준 분해) Normalization Form Canonical Decomposition	| À (U+00C0) → A (U+0041) + ̀ (U+0300) 위 (U+C704) → ᄋ (U+110B) + ᅱ (U+1171) |
| NFC (정준 분해한 뒤 다시 정준 결합) Normalization Form Canonical Composition |	A (U+0041) + ̀ (U+0300) → À (U+00C0) ᄋ (U+110B) + ᅱ (U+1171) → 위 (U+C704) |
| NFKD (호환 분해)  Normalization Form Compatibility Decomposition |	ﬁ (U+FB01) → f (U+0066) + i (U+0069) |
| NFKC (호환 분해한 뒤 다시 정준 결합) Normalization Form Compatibility Composition |	樂 (U+F914), 樂 (U+F95C), 樂 (U+F9BF) → 樂 (U+6A02) |

> 이중 한글 처리와 관련된 것은 NFD(소리 마디를 첫가끝 코드로 분해)와 NFC(첫가끝 코드를 소리 마디로 결합)이다.

NFD에 관련된 내용은 위 링크들을 확인해보면 충분한 정보를 얻을 수 있을테니 오늘은 PHP에서 NFD를 다루는 부분을 소개한다.
참고로 아래의 함수를 사용하기 위해서는 [intl](http://php.net/manual/kr/book.intl.php) 모듈이 설치되어 있어야 한다.

우선 간단한 코드부터 보자.

```php
<?php
// setlocale(LC_ALL, 'ko_KR.UTF-8');
if (!\Normalizer::isNormalized($text)) {
  $text = \Normalizer::normalize($text);
}
```

사실 위 코드를 보면 더 이상 설명이 필요 없을 정도로 간단하다.
[\Normalizer::isNormalized](http://php.net/manual/kr/normalizer.isnormalized.php) 함수를 사용해서 NFC 형식인지 검사한다.
위 예시는 두번째 인자인 `$from`이 생략된 것이다(기본값 : `Normalizer::FORM_C`). 따라서 두번째 인자로 `Normalizer::FORM_D`를 넣어주면 NFD를 검사할 수 있다.

NFC 형식이 아니라면 [\Normalizer::normalize](http://php.net/manual/kr/normalizer.normalize.php) 함수를 이용해서 NFC 형식으로 변환한다.
이 함수 또한 기본적으로 두번째 인자로 `Normalizer::FORM_C`를 사용한다.

마지막으로 주석 처리한 `setlocale` 부분은 필요 시에만 추가하면 된다(상황에 따라서는 `setlocale`을 추가하면 한글의 일부가 깨지는 상황이 발생했다.).
