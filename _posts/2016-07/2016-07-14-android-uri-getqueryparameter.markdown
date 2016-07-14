---
layout: post
title: "android Uri.getQueryParameter() 사용시 젤리빈 이전 버전에서 공백이 +로 표시되는 문제 해결"
date: 2016-07-14 9:53:26 +09:00
comments: true
categories: android
---

[Uri.getQueryParameter()](https://developer.android.com/reference/android/net/Uri.html#getQueryParameter%28java.lang.String%29) 사용시 젤리빈 이전 버전을 지원해야 한다면 주의해야 할 사항이 있다. 최근에는 젤리빈 이하를 굳이 지원할 필요가 없다고 볼 수 있지만 혹시라도 지원해야 한다면 아래의 내용을 참고하자.

공식 문서에서 보면 해당 함수 설명에 아래의 내용이 있다.

> Warning: Prior to Jelly Bean, this decoded the '+' character as '+' rather than ' '.

젤리빈 이전 버전에서는 공백을 urlencode하여 넘겨진 `+`를 공백으로 치환하지 않는다. 따라서 공백으로 직접 치환해 주어야 한다.

호환 처리를 위해 만든 함수를 아래에 남긴다.

```java
@Nullable
static public String getQueryParameter(@Nullable Uri uri, @NonNull String key) {
  String result = null;
  if (uri != null) {
    result = uri.getQueryParameter(key);
    if ((result != null) && (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN)) {
      result = result.replace('+', ' ');
    }
  }
  return result;
}
```
