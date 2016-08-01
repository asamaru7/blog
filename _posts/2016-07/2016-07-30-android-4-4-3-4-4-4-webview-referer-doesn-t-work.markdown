---
layout: post
title: "Android 4.4.3, 4.4.4 Webview Referer 오류 수정"
date: 2016-07-30 07:47:48 +09:00
comments: true
categories: android
---

안드로이드 WebView를 사용하면서 특정 페이지로의 접근시 Referer를 지정해서 넘기도록 처리해서 사용중인 앱이 있다. 그런데 테스트 도중 이상한 문제가 발생했다. Android 4.4.4에서만 지정한 Referer를 무시하고 넘기지 않는 것이다. 그래서 조금 찾아보니 아래와 같은 글들이 있었다.

* [Webview/UIWebview Header에 HTTP Referer 추가](https://withwontae.wordpress.com/tag/webview/)

>Android OS 4.4 이상의 단말에서는 Webview가 Chromium기반으로 변경되면서 Referer 추가해도 HTTP Header에 설정이 되지 않는 문제 발생( 이건 targetSDK 버전을 올려야 적용 )
>
>http://lapture.net/?p=2619
>
>버그라고들 이야기 하는데 버그가 아닌 것 같다. 보안상의 문제로 Chrominum Webview에서는 ‘Referer’ Key는 추가로 설정하지 못하도록 방지한 느낌이 든다.  ( 그냥 혼자만의 생각 – 혹시 아시는 분은 연락주세요 ㅜㅡㅜ )

여기서는 버그가 아닌 보안 상의 문제로 보인다고 했지만 아래의 글을 보면 결국 버그인 것으로 보인다(보안 상 문제가 있다는 생각으로 개발자가 뺐을 수도 있겠지만...).

* [Nexus 5 referer string value is coming as null even if we pass it](https://code.google.com/p/android/issues/detail?id=72323)

> Project Member #2 sgu...@android.com
> This is fixed and will be released in next version of Android. Thanks,

이 글에서 보면 `Project Member`가 다음 버전에 수정하겠다는 답변을 달아 놓았다.
그리고 이글에서 보면 4.4.3과 4.4.4에서만 이 현상이 나타난다는 댓글도 있다. 모든 기기를 테스트할 수는 없으나 내가 확인한 기기들에서는 4.4.2는 이상이 없고 4.4.4에서는 실제로 이상이 있었다.

---

결론은 4.4.3, 4.4.4 기기에서는 Referer를 사용할 수 없다는 것인데 이렇게 되면 이 방법을 아예 사용할 수가 없는 것과 같다. 그래서 방법을 찾아봤지만 해결책을 제시한 곳을 찾을 수 없었다.

하지만 수많은 테스트 결과 찾은 방법이 있어 아래에 공유한다.

```java
Map<String, String> extraHeaders = new HashMap<>();
String referer = "~~~";
extraHeaders.put("Referer", referer);

if (("4.4.3".equals(android.os.Build.VERSION.RELEASE))
		|| ("4.4.4".equals(android.os.Build.VERSION.RELEASE))) {   // 4.4.3 ~ 4.4.4 에서 Referer가 누락되는 문제를 수정하기 위함
	extraHeaders.put("Referer ", referer);
}

view.loadUrl(url, extraHeaders);
```

아주 간단하다. "Referer" 대신 "Referer "를 사용하는 것이다. HTTP 프로토콜에서 Referer는 다음과 같은 형식이다. `Referer : ~~~` 따라서 Referer 뒤에 공백하나 더 들어가도 규칙엔 문제가 없으므로 정상 동작한다.

다행히 안드로이드에서 문자열을 trim하지 않고 비교하고 있어서 간단하게 해결된다. 개발자의 실수가 다행인 경우도 있을 수 있구나.
