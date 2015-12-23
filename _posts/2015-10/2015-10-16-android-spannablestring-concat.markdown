---
layout: post
title: "안드로이드 SpannableString 합치기"
date: 2015-10-16 13:16:51 +0900
comments: true
categories: android
---

안드로이드에서 TextView, EditText 등에서 문자를 출력할 때 스타일을 지정하기 위해서 [SpannableString](http://developer.android.com/intl/ko/reference/android/text/SpannableString.html)을 사용한다. 다른 방법으로는 [Html.fromHtml](http://developer.android.com/intl/ko/reference/android/text/Html.html#fromHtml%28java.lang.String%29)을 사용하는 방법도 있으나 결국 내부에서는 SpannableString로 처리된다.

그런데 작업을 하다보면 각각의 SpannableString을 합쳐야할 때가 있다. 이런 경우에 사용할 수 있는 것이 [TextUtils.concat](http://developer.android.com/intl/ko/reference/android/text/TextUtils.html#concat%28java.lang.CharSequence...%29) 이다. 아래의 예시를 보자.

```java
SpannableString styledText1 = new SpannableString("Text String1");
styledText1.setSpan(new AbsoluteSizeSpan(12, true), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);

SpannableString styledText2 = new SpannableString("Text String2");
styledText2.setSpan(new AbsoluteSizeSpan(20, true), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);

CharSequence concatString = TextUtils.concat(styledText1, " ", styledText2);
```

소스를 보면 알겠지만 주의할 점은 반환값이 [CharSequence](http://developer.android.com/intl/ko/reference/java/lang/CharSequence.html)라는 것이다.

그리고 SpannableString을 이미 사용한다면 대부분 아는 내용일 수 있지만 처음 사용하는 사람이라면 SpannableString에서 가능한 것들이 무엇이 있는지 궁금할 수 있다(Class가 다양하다). 이 경우엔 [Spans, a Powerful Concept.](http://flavienlaurent.com/blog/2014/01/31/spans/)를 참고하면 도움이 될 것이다.