---
layout: post
title: "Html.fromHtml deprecated(Android N)"
date: 2016-07-14 10:33:16 +09:00
comments: true
categories: android
---

Android N이 아직 developer preview 상태지만 곧 정식 버전이 나올 것으로 생각된다. 이 Android N에서 deprecated 된 것 중의 하나가 [Html.fromHtml](https://developer.android.com/reference/android/text/Html.html#fromHtml%28java.lang.String%29)다.

공식 문서에는 다음과 같이 안내되어 있다.

> This method was deprecated in API level 24. use fromHtml(String, int) instead.

이와 관련해서는 길게 이야기할 것도 없으니 버전에 대응되도록 처리해 둔 함수를 아래에 남긴다.

```java
public static Spanned fromHtml(String source) {
  if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N) {
    // noinspection deprecation
    return Html.fromHtml(source);
  }
  return Html.fromHtml(source, Html.FROM_HTML_MODE_LEGACY);
}
```
