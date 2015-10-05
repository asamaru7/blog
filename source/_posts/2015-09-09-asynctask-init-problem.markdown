---
layout: post
title: "AsyncTask의 생성을 UIThread에서 하지 않으면 발생하는 문제 해결"
date: 2015-09-09 21:36:59 +0900
comments: true
categories: android
---

최근에 안드로이드의 앱 성능 개선에 관련하여 여러가지 자료를 확인중이다. 대표적인 것들이 memory leak에 관련된 문제와 thread 사용에 대한 것들이 있다. 오늘 하고자 하는 얘기는 이 thread 관련된 정보를 조사하다가 알게된 부분을 공유하고자 한다.

이 내용의 출처는 [여기]("https://gist.github.com/benelog/5954649")다.

AsyncTask가 UI 스레드가 아닌 곳에서 처음으로 호출된다면 아래와 같은 에러스택이 발생할 수 있다고 한다. 이건 또 무슨 말도 안되는 소린가? 정말 안드로이드는 말도 안되는 이상한 현상들이 너무나도 많다. 하지만 위에 안내한 출처에서 명확한 원인과 해결 방법을 제시하고 있다.

```
android.view.ViewRoot$CalledFromWrongThreadException: Only the original thread that created a view hierarchy can touch its views.
    at android.view.ViewRoot.checkThread(ViewRoot.java:3011)
    at android.view.ViewRoot.requestLayout(ViewRoot.java:634)
    at android.view.View.requestLayout(View.java:8284)
    at android.view.View.setFlags(View.java:4658)
    at android.view.View.setVisibility(View.java:3133)
    at android.app.Dialog.hide(Dialog.java:254)
```

```
 Handler{40797d88} sending message to a Handler on a dead thread
 java.lang.RuntimeException: Handler{40797d88} sending message to a Handler on a dead thread
     at android.os.MessageQueue.enqueueMessage(MessageQueue.java:196)
     at android.os.Handler.sendMessageAtTime(Handler.java:457)
     at android.os.Handler.sendMessageDelayed(Handler.java:430)
     at android.os.Handler.sendMessage(Handler.java:367)
     at android.os.Message.sendToTarget(Message.java:349)
     at android.os.AsyncTask$3.done(AsyncTask.java:214)
     at java.util.concurrent.FutureTask$Sync.innerSet(FutureTask.java:253)
     at java.util.concurrent.FutureTask.set(FutureTask.java:113)
     at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:311)
     at java.util.concurrent.FutureTask.run(FutureTask.java:138)
     at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1088)
     at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:581)
     at java.lang.Thread.run(Thread.java:1019)
```

## 원인

AsyncTask 내에는 sHandler라는 static 멤버 변수가 있다고 해서 실제로 확인해 봤다. 현재 출처에서 밝힌 소스와는 조금 다르게 변경되어 있었다. sHandler는 앱에서 AsyncTask를 최초 선언한 순간 객체가 할당되고, UI작업을 처리하는 onPostExecute()가 호출될 때 사용된다고 설명되어 있었으나 설명과 다르게 선언시에는 아래와 같이 초기화를 하지 않도록 변경되었다. 대신 내부에서 getHandler() 함수가 처음 실행될 때 초기화 된다.

```java
private static final InternalHandler sHandler;
...
private static Handler getHandler() {
    synchronized (AsyncTask.class) {
        if (sHandler == null) {
            sHandler = new InternalHandler();
        }
        return sHandler;
    }
}
...
private static class InternalHandler extends Handler {
     ...
}
```

> 앱을 실행하고 최초로 AsyncTask를 선언한 부분이 메인쓰레드가 아니라면 InternalHandler는 메인쓰레드가 아닌 쓰레드의 Handler를 가지고 있고 이 Handler로는 UI 작업을 하지 못하기 때문에 "android.view.ViewRoot$CalledFromWrongThreadException" 오류를 냅니다.

> 이 문제는 API Level 16미만 에서만 발생합니다. API Level 16이상에서는 메인스레드를 관리하는 ActivityThread 클래스가 시작할 때 main 메소드에서 static 메소드인 AsyncTask.init()을 호출하여 AsyncTask 클래스를 로드하고 있습니다. 관련 Commit은 다음 링크에서 확인하실 수 있습니다.

> https://github.com/android/platform_frameworks_base/commit/5e9120d4adfb07aeeadb0e0de1de2eb9ebbd80e0

이렇게 설명되어 있으나 위에 얘기한 것 처럼 현재는 다시 조금 변경되어 있었다. 정확히는 AsyncTask.init() 이 부분이 없다. init() 함수도 선언되어 있지 않다.

그렇다면 문제가 없는 것일까? 해서 다시 조금 찾아봤다. 이 부분에 대해서는 [여기]("http://sjava.net/?p=1570")에서 설명하고 있었다.
내용을 보니 5.1이 나오면서 내부적 처리가 변경된 것으로 보인다. 그리고 설명대로라면 사용상의 변경은 크지 않으므로 역시 초기화 과정은 필요없다.

덤으로 위 사이트에서 안내된 내용 중에 아래의 내용도 있다.

### Threading rules

> There are a few threading rules that must be followed for this class to work properly:

* The AsyncTask class must be loaded on the UI thread. This is done automatically as of JELLY_BEAN.
* The task instance must be created on the UI thread.
* execute(Params...) must be invoked on the UI thread.
* Do not call onPreExecute(), onPostExecute(Result), doInBackground(Params...), onProgressUpdate(Progress...) manually.
* The task can be executed only once (an exception will be thrown if a second execution is attempted.)

## 해결

주저리 주저리 얘기가 많았는데 그래서 결론은 무엇인가? 젤리빈(API 16) 이상은 UIThread 내부에서 생성해야 한다는 제약사항 없이 어디서나 사용해도 무방하다. 그럼 그 이하는 어떻게 하나?
아래의 코드를 actiity 또는 application 시작 지점에 추가 한다. 메인스레드에서 단순히 클래스 로딩을 한번만 해도 AsyncTask내의 static 멤버 변수가 정상적으로 초기화된다고 한다.
그래서 난 appication class의 onCreate 함수 내부에 아래의 코드를 추가해 두었다.

```java
if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN) {
    try {
        Class.forName("android.os.AsyncTask");
    } catch (ClassNotFoundException e) {
        e.printStackTrace();
    }
}
```
