---
layout: post
title: "com.google.gson.JsonSyntaxException: java.lang.NumberFormatException: Expected an int but was 오류"
date: 2016-04-11 12:54:28 +09:00
comments: true
categories: ["java","android"]
---
[GSON](https://github.com/google/gson)을 이용해서 JSON 데이터를 Parse하려고 할 때 아래와 같이 `NumberFormatException`이 발생할 수 있다. 이는 대부분의 경우 int의 최대값을 넘어선 값을 int에 대입하려고 할 때 발생한다.

```
com.android.volley.ParseError: com.google.gson.JsonSyntaxException: java.lang.NumberFormatException: Expected an int but was 4291611852 at line 1 column 143 path $.items[0].items[0].borderColor
```

나의 경우엔 안드로이드로 color 값을 넘겨주려고 할 때 위 오류가 발생했다. 내가 지정한 값은 `0xffcccccc`인데 int로 4291611852이다. 그런데 안드로이드에서 int의 최대값은 2147483647이므로 범위를 벋어난다. 그런데 안드로이드에서는 `0xffcccccc`와 같은 형식으로 color 값을 사용하지만 문제가 없다. 이유는 아래와 같이 `0xffcccccc`값을 int 범위 내로 변환하면 -3355444이 된다.

```java
System.out.println("0xffcccccc " + (int)0xffcccccc);
```

결론은 이런 값을 사용해야 할 경우는 GSON 객체에서 int 대신 long을 사용하고 사용하는 곳에서 int로 type casting하면 된다.
