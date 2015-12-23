---
layout: post
title: "안드로이드에서 Dialog 사용시 WindowManager$BadTokenException 발생"
date: 2015-09-04 20:49:21 +0900
comments: true
categories: android
---

안드로이드에서는 거의 모든 작업에 context를 사용한다. 그런데 이 context는 크게 application contet와 activity context가 있다. 문제는 사용시에 구분해서 사용하지 않는다는 것이다. 명시적으로 특정 context를 요구하지 않는다. 이로 인해 많은 혼란이 있고 crash도 많이 발생한다.

사실 오류를 줄이려면 가능한한 activity context를 사용하는 것이 좋다.(경험상...) 하지만 안드로이드에서는 가급적 application context를 사용하기를 권장한다.

가장 대표적인 이유는 메모리릭 때문이다. 메모리릭에 대한 문제는 context의 종류에 직접적인 관련이 있는 것은 아니나 activity 내부에서 객체를 생성하면서 자신을 context로 넘겨줄 경우 순환참조 등의 이유로 객체가 소멸하지 못할 수 있다. 메모리릭 문제는 상상보다 더 다양한 경우에 발생하는데 여기서 논하고자하는 범위를 벋어나니 일단 넘어가자. 사실 검색해 보면 많은 자료가 있다.
어쨌든 생성된 객체가 죽지 못한다면 activity도 소멸하지 못하므로 대량의 메모리 점유를 경험하게 될 수 있다. 당연히 앱이 크지 않다면 OOM(Out Of Memory)을 쉽게 만나지는 않을 것이다.
사설이 길었는데 어쨌든 이러한 이유로 나는 가급적 application context를 사용하려고 한다.
문제는 여기서 시작되었다.

기존에 WebView를 생성할 때는 activity를 넘겨주었었다. 이 코드를 얼마전 확인하고 application context로 변경했다. 그리고 빌드, 실행. 문제가 없었다. 잘 나왔다. 안심했다.

그런데 오늘 동료 직원이 이상한 부분이 있다고 확인을 요청했다.

> WebView 내부에 있는 select box를 터치하면 앱이 죽는다.

처음엔 뭔가 했다. 그런데 오류를 확인하니 다음과 같았다.

```
W/System.err﹕ android.view.WindowManager$BadTokenException: Unable to add window -- token null is not for an application
W/System.err﹕ at android.view.ViewRootImpl.setView(ViewRootImpl.java:691)
W/System.err﹕ at android.view.WindowManagerGlobal.addView(WindowManagerGlobal.java:288)
W/System.err﹕ at android.view.WindowManagerImpl.addView(WindowManagerImpl.java:69)
W/System.err﹕ at android.app.Dialog.show(Dialog.java:312)
W/System.err﹕ at org.chromium.content.browser.input.SelectPopupDialog.show(SelectPopupDialog.java:133)
W/System.err﹕ at org.chromium.content.browser.ContentViewCore.showSelectPopup(ContentViewCore.java:2437)
W/System.err﹕ at org.chromium.base.SystemMessageHandler.nativeDoRunLoopOnce(Native Method)
W/System.err﹕ at org.chromium.base.SystemMessageHandler.handleMessage(SystemMessageHandler.java:53)
W/System.err﹕ at android.os.Handler.dispatchMessage(Handler.java:102)
W/System.err﹕ at android.os.Looper.loop(Looper.java:145)
W/System.err﹕ at android.app.ActivityThread.main(ActivityThread.java:5942)
W/System.err﹕ at java.lang.reflect.Method.invoke(Native Method)
W/System.err﹕ at java.lang.reflect.Method.invoke(Method.java:372)
W/System.err﹕ at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:1399)
```

이런 Dialog를 생성하려는 시점에서 context가 적절하지 못하다. 그렇다. WebView에서 select box를 선택하면 앱의 경우는 선택 dialog가 자동으로 뜬다. 이때 이 dialog를 생성할 때 WebView 생성시 넣어 줬던 context를 사용하는 것이다.

아... 그럼 처음부터 application context를 넣지 못하도록 하던지... 정말 안드로이드는 누가 설계 했는지 너무 엉망이다. UIThread 문제, Network Main Thread 문제.. 등등 상식적으로 해결 방법이 있을 법한데 모두 개발자가 알아서 하란다. 이런...

어쨌든 Dialog 생성시에는 activity context를 사용해야 한다. 일반 dialog는 테스트시에 바로 표시가 나니 금방 고칠 수 있지만 이런 경우는 참 난해하다.

결론은 WebView 생성시에는 activity context를 넣자.