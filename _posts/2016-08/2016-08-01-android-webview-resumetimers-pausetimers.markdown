---
layout: post
title: "안드로이드 WebView resumeTimers() / pauseTimers() 적용하기"
date: 2016-08-01 16:56:09 +09:00
comments: true
categories: android
---

안드로이드의 WebView를 사용하다 보면 처음 페이지를 보여줄 때는 정상적으로 보이나 두번째 이후부터 페이지를 정상적으로 표시하지 못하는 경우가 있다. 이 경우는 여러가지 이유로 발생할 수 있으나 오늘은  [pauseTimers](https://developer.android.com/reference/android/webkit/WebView.html#pauseTimers%28%29) / [resumeTimers](https://developer.android.com/reference/android/webkit/WebView.html#resumeTimers%28%29) 때문에 발생하는 경우에 대한 이야기를 하고자 한다.

우선 이 함수들이 필요한 이유부터 간단히 알아보자.

메뉴얼에서 [pauseTimers](https://developer.android.com/reference/android/webkit/WebView.html#pauseTimers%28%29)를 찾아보면 아래와 같이 설명되어 있다.

> Pauses all layout, parsing, and JavaScript timers for all WebViews. This is a global requests, not restricted to just this WebView. This can be useful if the application has been paused.

현재 보여지는 웹뷰뿐만 아니라 모든 웹뷰에 대해 layout, parsing, JavaScript timers 를 멈추도록 지시한다. 이것이 왜 필요할까? 안드로이드는 기본적으로 앱이 백그라운드 상태로 들어가더라도 웹뷰의 동작은 자동적으로 멈추지 않고 계속 동작하기 때문이다. 이렇게되면 앱을 사용하지 않더라도 지속적으로 연산 작업이 일어나므로 배터리를 더 많이 사용하게 된다(이런 문제라면 OS 차원에서 알아서 처리하면 될텐데 왜 개발자가 직접이 문제를 처리해 주어야하는지 이해가 안된다).

이 문제를 해결하기 위해서는 Activity를 벗어날 때 [pauseTimers](https://developer.android.com/reference/android/webkit/WebView.html#pauseTimers%28%29)를 호출해주면 된다.

그런데 이렇게 처리해 주었다면 Activity에 복귀할 때는 [pauseTimers](https://developer.android.com/reference/android/webkit/WebView.html#pauseTimers%28%29)를 필히 호출해줘야 한다. 그렇지 않으면 화면이 보여지지 않는 문제를 만날 수 있다. 여러 사람들의 이야기를 들어보면 이 현상은 기기마다 차이가 있는 것으로 보인다(문제가 발생하는 기기도 있고 그렇지 않은 기기도 있다는 뜻).

간단한 해결 방법은 아래와 같이 WebView를 사용하는 Activity의 onResume, onPause에서 직접 처리해주면 된다.

```Java
@Override
protected void onResume() {
  super.onResume();

  webView.resumeTimers();
}

@Override
protected void onPause() {
  super.onPause();

  webView.pauseTimers();
}
```

Activity 단위로 처리하는 것이 귀찮다면 application의 life cycle에 맞춰서 일괄적으로 처리해도 된다. 메뉴얼에 나와 있듯이 application 전체의 웹뷰에 일괄적으로 적용되므로.
