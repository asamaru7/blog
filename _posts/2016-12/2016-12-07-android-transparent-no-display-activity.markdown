---
layout: post
title: "Android 투명 / 보이지 않는 Activity 만들기(Theme.Translucent / Theme.NoDisplay)"
date: 2016-12-07 20:09:06 +09:00
comments: true
categories: android
---
안드로이드에서 투명한 배경을 가진 Activity나 눈에 보이지 않는 Activity를 만드는 방법 중 가장 쉬운 방법은 Activity의 Theme를 사용하는 것이다. 이러한 Activity를 구성하기 위해 안드로이드에서 제공되는 테마 몇가지를 알아보자.

>아래에 나오는 각 테마의 설정 내용은 Android SDK 24 기준임을 참고하기 바란다.

---

### Theme.Translucent

[](https://kairo96.gitbooks.io/android/content/ch4.11.html)
Theme.Translucent 테마는 안드로이드 3.0 이전부터 존재한 테마로 투명한 배경을 가진 Activity를 만들때 사용할 수 있는 테마다. 일반적으로 구버전의 안드로이드까지 정확히 지원하려면 Theme.Translucent.NoTitleBar를 사용해서 투명한 배경을 가진 Activity를 만들어야 한다.

이 테마는 아래의 3가지 형태로 나뉜다. 각각의 특성은 이름과 설정 내용을 보면 바로 알 수 있다.

* Theme.Translucent

```xml
<style name="Theme.Translucent">
    <item name="windowBackground">@color/transparent</item>
    <item name="colorBackgroundCacheHint">@null</item>
    <item name="windowIsTranslucent">true</item>
    <!-- Note that we use the base animation style here (that is no
         animations) because we really have no idea how this kind of
         activity will be used. -->
    <item name="windowAnimationStyle">@style/Animation</item>
</style>
```

* Theme.Translucent.NoTitleBar

```xml
<style name="Theme.Translucent.NoTitleBar">
    <item name="windowNoTitle">true</item>
    <item name="windowContentOverlay">@null</item>
</style>
```

* Theme.Translucent.NoTitleBar_Fullscreen

```xml
<style name="Theme.Translucent.NoTitleBar.Fullscreen">
    <item name="windowFullscreen">true</item>
</style>
```

기본적으로 제공되는 위 테마를 사용하는 것도 괜찮으나 필요하다면 아래와 같이 필요한 설정을 추가해서 재정의한 테마를 사용할 수 있다.

```xml
<style name="NoDisplay" parent="android:Theme">
  <item name="android:windowIsTranslucent">true</item>
  <item name="android:windowBackground">@android:color/transparent</item>
  <item name="android:windowContentOverlay">@null</item>
  <item name="android:windowNoTitle">true</item>

  <item name="android:windowIsFloating">true</item>
  <item name="android:backgroundDimEnabled">false</item>

  <item name="android:colorBackgroundCacheHint">@null</item>
  <item name="android:windowAnimationStyle">@android:style/Animation</item>
  <item name="android:windowFullscreen">true</item>
</style>
```

---

### Theme.NoDisplay

Theme.NoDisplay 테마는 Activity를 투명하게 만드는 것이 아니라 아예 보이지 않는 Activity를 만들어 준다.

```xml
<style name="Theme.NoDisplay">
    <item name="windowBackground">@null</item>
    <item name="windowContentOverlay">@null</item>
    <item name="windowIsTranslucent">true</item>
    <item name="windowAnimationStyle">@null</item>
    <item name="windowDisablePreview">true</item>
    <item name="windowNoDisplay">true</item>
</style>
```

이 테마를 사용할 때는 유의할 점이 있다. `did not call finish() prior to onResume() completing` 오류가 발생할 수 있기 때문이다. Theme.NoDisplay 테마를 사용하는 경우에는 onResume 함수가 호출되기 전에 finish()가 호출되어야 하는데 이를 어길 경우 앱에서 오류가 발생한다.
이와 관련해서는 [Theme.NoDisplay 테마 사용시 안드로이드 API 23에서 did not call finish() prior to onResume() completing 오류 발생](/2016/12/07/android-theme-nodisplay-did-not-call-finish-prior-to-onresume-completing/)에서 조금 더 자세히 다룬다.

마지막으로 [Android cheats and tips: Invisible activity](http://androidblog.reindustries.com/android-cheats-and-tips-invisible-activity/)라는 글도 참고하면 좋을 듯하다. 필요에 따라 `android:noHistory`와 `android:excludeFromRecents="true"`를 함께 사용함으로써 history와 최근 사용 항목에 남지 않는 Activity를 생성하는 부분을 안내하고 있다.
