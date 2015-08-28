---
layout: post
title: "Android 6(API 23)의 getColor() deprecated 대응 + getDrawable() deprecated"
date: 2015-08-28 06:27:49 +0900
comments: true
categories: android
---

얼마전 Android API 23 버전이 공개되었다. 이와함께 support library, design support library도 함께 23 버전으로 버전업 되었다.

이에따라 여러가지 UI들이 추가되어 필요한 부분을 적용해 보고자 gradle을 수정하고 build 하니 getColor 함수가 deprecated 되었다는 warning을 보게되었다.

아... 최근에 안드로이드는 기본 함수들을 너무 많이 바꾼다. 사실 이번 버전업으로 이것뿐아니라 http 관련된  api가 제거 되었다. 이미 이전부터 deprecated 되었었긴하지만 너무 갑작스럽기도 하다.
현재시점에서 ACRA, android-async-http 등의 오픈소스들도 대응이 되지 않았다. 이에 따른 대응방법도 구글에 안내되어 있긴하다.

[Apache HTTP 클라이언트 제거](https://developer.android.com/intl/ko/preview/behavior-changes.html#behavior-apache-http-client)

하지만 임시방편일 뿐 계속 사용하기엔 석연치 않다. 조금더 자세한 내용은 다음에 다시 글을 쓰도록 하겠다.

다시 본론으로 돌아와서 이 부분을 해결하기 위해서는 ContextCompat(android.support.v4.content.ContextCompat)을 사용하면 된다.
단, support library 23 이상이 필요할 수 있다. 이하에서는 확인을 못했다.

함수는 아래와 같이 구성되어 있다.

```java
public static final int getColor(Context context, int id) {
    final int version = Build.VERSION.SDK_INT;
    if (version >= 23) {
        return ContextCompatApi23.getColor(context, id);
    } else {
        return context.getResources().getColor(id);
    }
}
```

실제사용은

```java
ContextCompat.getColor(context, resourceId);
```
이렇게 하면된다. 어떻게보면 기존보다 더 편하다. 하지만 기존에 getColor를 사용하던 부분을 고치는 것은 우리가 해야한다.

추가로 보다 더 이전에 deprecated된 함수 getDrawable()가 있다. 이건 정확하지 않지만 API 21부터 deprecated 된 것 같다.
이 문제도 동일한 class를 통해 해결 가능하다.

```java
public static final Drawable getDrawable(Context context, int id) {
    final int version = Build.VERSION.SDK_INT;
    if (version >= 21) {
        return ContextCompatApi21.getDrawable(context, id);
    } else {
        return context.getResources().getDrawable(id);
    }
}
```

요즘 분위기를 보면 이런식으로 deprecated 되는 함수가 많다. 사실 개인적으로 많은 것은 기존 안드로이드가 워낙 엉망이라고 보기 때문에 문제가 되지 않는다고 생각하지만 처리하는 과정은 맘에 들이 않는다.
한번에 싹 정리하지 않고 눈에 띄면 추가하듯 띄엄띄엄 deprecated 함수를 늘리고 실제 제거까지 오래 기다리지 않는다. 이건 꼭 새로운 버전을 사용하지 말라고 권장하는 것도 아니고 쓰라는 것도 아니고...

마지막으로 PhoneNumberUtils.formatNumber 함수 예기만 하나더 하자면

```java
public static String formatNumber(String source);
```

이 함수도 deprecated 되었다. 이제는 두번째 인자로 포멧팅할 국가 코드를 넣어야 한다.

```java
PhoneNumberUtils.formatNumber(number, "KR");
```

그게 대응이 어려운 문제는 아니다. 하지만 위의 문제들과 더불어 굳이 deprecated 했어야 하는가? 하는 부분이다.
개인적인 생각으로 두번째 인자를 생략하면 기존처럼 국가코드를 자동으로 넣으면 되지 않는가? 일부 다국어 지원 앱에서 조금더 명확한 사용을 하기 위해 대다수의 단일국가 지원 앱들이 불편을 감수해야하는가?
다음이 기존함수이다.

```java
@Deprecated
public static String formatNumber(String source) {
    SpannableStringBuilder text = new SpannableStringBuilder(source);
    formatNumber(text, getFormatTypeForLocale(Locale.getDefault()));
    return text.toString();
}
```

보다시피 ```Locale.getDefault()``` 부분을 넣어주고 있었다. 어쨌든 나는 아래와 같은 호환 함수를 만들어서 사용하고 있다.

```java
static public String getFormattedPhoneNumber(String number) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        return PhoneNumberUtils.formatNumber(number, "KR");
    } else {
        // noinspection deprecation
        return PhoneNumberUtils.formatNumber(number);
    }
}
```