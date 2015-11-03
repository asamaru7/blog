---
layout: post
title: "MySql에서 folat 필드 동일값 비교"
date: 2015-09-16 18:09:56 +0900
comments: true
categories: db
---
이번에 작업하면서 mysql의 float 필드를 사용할 일이 있었다. 사실 오랜기간동안 mysql을 사용해 오면서 float 필드를 사용해 본 적이 많지 않았고 float 필드를 범위 검사가 아닌 동일값 검사를 할일이 없었다.

이번 작업에서는 float 필드의 동일값 검사를 하면서 당연히 아래와 같이 query를 만들면 될 줄 알았다.

```mysql
SELECT * FROM TABLE1 WHERE FloatField = 10.1;
```

그런데 분명 동일한 값이 있음에도 불구하고 검색된 결과가 없었다. 처음엔 어의가 없었다. 당연히 동일한 값이 있는데 왜 검색이 되지 않을까?
그래서 구글에서 검색을 해보니 float 필드는 "="을 이용한 동일값 검사를 할 수 없었다. 아래는 float 필드의 동일값 검사를 하는 예시다.

```mysql
SELECT * FROM TABLE1 WHERE ABS(FloatField - 10.1) <= 1e-6;
```

아.. 이런 웬 해괴망측한 방법이란 말인가? 사실 여러글에서 보면 문자열로 Casting(변환)해서 검사하는 방법 등도 있었다. 그리고 주의할 사항은 `1e-6`값을 정하는 부분이다. 소숫점의 길이에 따라 값을 어느 정도 조정해야 하는 듯 하다. 소숫점 2자리 기준에서 `1e-6` 적용시 같은 값으로 인식하지 않았다. 그래서 `1e-4`를 적용했었다. 어짜피 2자리까지 값이니 충분한 오차 한계긴하다.

MySql 사이트에서 보면 [B.5.5.8 Problems with Floating-Point Values](https://dev.mysql.com/doc/refman/5.0/en/problems-with-float.html) 이라는 글이 있다.

첫줄에 설명된 것과 같이 mysql에서는 부동 소수점을 정확한 값으로 저장하지 않기 때문에 내부적으로 나타내는 값이 동일하지 않을 수 있다고 되어 있다.

원인은 설명되어 있지만 사실 왜 이래야만 하는 것인지 이해는 잘되지 않는다. 원래 부동 소수점에 대한 문제는 여러 프로그램에서 있는 문제이긴하나 mysql에서도 이 문제가 있을 줄은 생각하지 못했다.

어쨌든 보다 다양한 예시와 설명은 위에 링크한 mysql 메뉴얼을 참고하면 된다. 아니면 부동소숫점이 아닌 고정소숫점 타입을 사용해도 된다. [숫자 타입](http://www.mysqlkorea.com/sub.html?mcode=manual&scode=01&m_no=21681&cat1=11&cat2=332&cat3=0&lang=k) 메뉴얼에서 DECIMAL 관련된 내용을 참고하자.
