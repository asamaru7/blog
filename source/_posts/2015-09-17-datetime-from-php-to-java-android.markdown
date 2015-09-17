---
layout: post
title: "PHP의 DateTime을 Java (Android)로 전달하기"
date: 2015-09-17 18:45:26 +0900
comments: true
categories: ["android", "php"]
---

안드로이드 앱을 개발하게되면 많은 경우에 서버와의 데이터 연결이 필요하다. 대부분의 데이터 타입은 이 과정에서 큰 문제를 일으키지 않는다(데이터 타입만 명확히 한다면). 하지만 DateTime은 조금 까다로울 수 있다. 프로그램에서 시간은 TimeZone을 가지고 있기 때문에 이 부분을 명확히 하지 않으면 의도치 않은 시간으로 표시된다. 게다가 형식이 맞지 않는다면 제대로 전달되지 않을 수도 있다.

> 네이버 D2에 있는 [Java의 날짜와 시간 API](http://d2.naver.com/helloworld/645609)를 보면 Java에서의 Date 처리가 불편하다는 얘기가 있다.

이번 작업에서는 서버는 PHP를 사용하고 있는 상황이었고 클라이언트는 [AndroidAnnotations](http://androidannotations.org/)의 [Rest-API](https://github.com/excilys/androidannotations/wiki/Rest-API#rest)를 사용했다. 수신 데이터의 파싱은 [GsonHttpMessageConverter](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/http/converter/json/GsonHttpMessageConverter.html)를 사용하는 상황이다. 이 글의 주제에서 벗어나므로 [AndroidAnnotations](http://androidannotations.org/)나 [GsonHttpMessageConverter](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/http/converter/json/GsonHttpMessageConverter.html)에 대한 부분은 설명하지 않겠다.

GsonHttpMessageConverter를 사용해서 데이터를 파싱하는 경우 대상이되는 class의 멤버변수의 데이터 타입에 맞추어 데이터를 채워준다. 당연히 전송되는 데이터가 JSON 형식이어야 한다. 다른 데이터 타입의 경우 앞서 설명한 것과 같이 데이터 타입만 맞춰준다면 아주 쉽게 데이터를 받을 수 있다(그것이 이것을 사용하는 주요 목적이다). 그런데 DateTime 타입은 조금 신경을 써줘야 한다.

자 그럼 서버에서 데이터를 보낼 수 있는 방법에 어떤 것이 있을까? 가장 일반적인 방법으로는 timestamp(int), string, Date가 있다. 어떤 것을 쓰더라도 무방하지만 앞서 얘기한 것처럼 GsonHttpMessageConverter를 써서 간단히 데이터를 정확한 형식으로 받는 것이 편리하기 때문에 전송시 데이터 타입을 맞추는 것이 좋다.

```php
// string 타입으로 전송
$date = "2015-09-17 10:00:00";
// int 타입으로 전송
$date = (new \DateTime("2015-09-17 10:00:00"))->getTimestamp();
// Date 타입으로 전송
$date = (new \DateTime("2015-09-17 10:00:00"))->setTimeZone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z');
```

위의 코드를 보면 PHP에서 전송할 때 넘겨줄 데이터의 예시를 타입별로 제시했다. 앞서 강조했던대로 안드로이드 클라이언트에서 GsonHttpMessageConverter를 이용해 Date 타입으로 바로 받으려면 마지막에 있는 "Date 타입으로 전송" 방식을 사용하면 된다.

해당 부분을 보면 두가지 처리를 해주고 있다. 첫번째로 TimeZone을 설정한 것이고, 두번째로 Date Format을 지정한 것이다. 사실 이 부분들을 잘 몰라서 삽질을 조금 했었다. 처음엔 Date Format을 어떻게 전달해야할지 몰라 해맸다. 제대로 수신을 하지 못했던 것이다. Format을 맞추고 나니 이젠 보낸 시간과 받은 시간이 달랐다. 이 부분은 TimeZone의 문제이므로 TimeZone을 지정해서 해결했다. TimeZone에 사용한 UTC는 [협정 세계시](https://ko.wikipedia.org/wiki/%ED%98%91%EC%A0%95_%EC%84%B8%EA%B3%84%EC%8B%9C)라는 뜻이다. 이것과 세트로 format에서 끝에 \Z를 붙여 데이터가 [ISO 8601](https://ko.wikipedia.org/wiki/ISO_8601)에 따라 UTC를 따르고 있음을 표시한 것이다.


결론적으로 위의 형식을 사용하면 GSON으로 바로 받아도 정확한 시간을 사용할 수 있다.

사실 위의 경우는 GsonHttpMessageConverter를 사용한다는 상황을 가정한 것으로 이것을 사용하지 않고 직접 데이터를 받아 GSON을 통해 파싱한다면 아래의 방법을 쓸 수도 있다. Format을 보면 알겠지만 UTC Date여야 한다(정확한 시간 처리를 위해). "yyyy-MM-dd HH:mm:ss"이 Format을 쓸 수도 있으나 TimeZone 명시되지 않으므로 시간이 다르게 보일 수 있다.

```java
Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").create();
```

아래는 추가적으로 다른 타입으로 수신했을 때 안드로이드 클라이언트에서 Date 타입으로 변환하고자 할때 사용할 수 있는 참고 코드들이다.

** string 타입으로 수신시 **
```java
try {
    String dateTime = "2015-09-17 10:00:00";
    SimpleDateFormat dateParser = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.KOREA);
    Date date = dateParser.parse(dateTime);
} catch (ParseException e) {
    e.printStackTrace();
}
```

** timestamp(int) 타입으로 수신시 **

PHP에서의 TimeStamp는 초단위(s)지만 Java에서는 밀리초(ms) 단위이므로 1000을 곱해서 넣어 주어야 한다.
그리고 Java에서는 Date가 Deprecated되어 [Calendar](http://docs.oracle.com/javase/1.5.0/docs/api/java/util/Calendar.html)를 더 권장한다고 한다. [정확하게는 완전히 Deprecated된 것은 아니고 일부 생성자가 그렇다는 것](http://docs.oracle.com/javase/6/docs/api/java/util/Date.html)이지만 [Calendar](http://docs.oracle.com/javase/1.5.0/docs/api/java/util/Calendar.html)가 더 다양한 기능을 제공하므로 더 권장된다는 것이다. 자세한 이유는 검색해보면 많이 나온다.

```java
// Calendar 사용
Calendar c = Calendar.getInstance();
c.setTimeInMillis(timestamp * 1000);
Date date = c.getTime();

// OR

// Date 사용
Date d = new Date(timestamp * 1000);
```

