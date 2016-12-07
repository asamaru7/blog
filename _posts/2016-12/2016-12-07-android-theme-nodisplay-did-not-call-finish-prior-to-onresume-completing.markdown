---
layout: post
title: "Theme.NoDisplay 테마 사용시 안드로이드 API 23에서 did not call finish() prior to onResume() completing 오류 발생"
date: 2016-12-07 20:40:04 +09:00
comments: true
categories: android
---

눈에 보이지 않는 Activity를 생성하기 위해 "Theme.NoDisplay" 테마를 사용한 앱에서 오류가 발생했다. 오류 내용을 보면 onResume()이 호출되기 전에 finish()가 호출되지 않았다는 것이다.
확인해보니 "Theme.NoDisplay" 테마가 사용된 Activity는 윈도우 자체가 생성되지 않기 때문에 onResume()이 호출되기 전에 finish()가 호출되어야 하는 조건이 있다. 예를들면 아래와 같다.

```java
public class NoDisplayActivity extends Activity {  
    @Override  
    protected void onCreate(Bundle savedInstanceState) {  
        super.onCreate(savedInstanceState);  
        finish();  
    }  
}  
```

이와 관련된 내용은 [PSA: Android 6.0 Theme.NoDisplay Regression](https://commonsware.com/blog/2015/11/02/psa-android-6p0-theme.nodisplay-regression.html)에서 자세히 설명하고 있다. 이 글에 따르면 Android 6.0의 문서화되지 않은 변경으로 인해 targetSdkVersion이 23 이상에서 실행시 오류가 발생할 수 있다고 경고하고 있다.

이 문제는 "Android M developer preview의 버그다([Issue 2353:	Activity crash with @android:style/Theme.NoDisplay](https://web.archive.org/web/20151116170752/https://code.google.com/p/android-developer-preview/issues/detail?id=2353))"라는 이야기도 있으나 실제 Android 6에서 오류가 발생하고 있으므로 버그라 하더라도 무시할 수 없다.

---

나도 이번 작업에서 이 문제를 겪게 되었다. 나의 경우 targetSdkVersion이 24 였으며 오류가 보고된 기기는 모두 API 23(Android 6.0) 버전이었다.

이 문제에 대한 근본적인 문제 해결 방법은 onCreate() 또는 onStart() 단계에서 finish()를 호출하는 것이다. 비동기 처리 등의 상황으로 인해 이렇게 할 수 없는 상황이라면 **Theme.NoDisplay 테마를 사용하지 말고 [Android 투명 / 보이지 않는 Activity 만들기(Theme.Translucent / Theme.NoDisplay)](/2016/12/07/android-transparent-no-display-activity/)에서 안내한 것과 같이 투명한 Activity를 만들어서 적용하는 방법** 을 써야 한다.

위에서 언급한 비동기 처리 외에도 requestPermissions()을 사용하는 것과 같이 startActivityForResult()를 사용하게 되는 상황 등에서도 동일한 문제가 발생할 수 있다.

다른 해결 방법으로 아래와 같이 onStart() 함수에서 `setVisible(true);`를 호출해서 해결했다는 이야기도 있으나 해결되지 않는다는 이야기들이 있어 안전한 방법이라고 할 수 없다.

```java
@Override
protected void onStart() {
    super.onStart();
    setVisible(true);
}
```

---

결론적으로 내가 생각하는 가장 쉽고 안전한 방법은 투명한 Activity를 이용해서 NoDisplay를 대체 구현하는 것이다.

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
