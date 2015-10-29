---
layout: post
title: "Otto Event bus를 Android Annotations와 함께 사용시 unvalidated Warning이 발생할 경우"
date: 2015-09-24 20:33:06 +0900
comments: true
categories: android
---

이번에 진행중인 안드로이드 앱 개발 프로젝트에서 [Android Annotations](http://androidannotations.org/)과 [Otto](http://square.github.io/otto/)를 함께 사용중이다. 함께 사용하는 방법에 대한 가이드는 [Integrating Otto and AndroidAnnotations](https://github.com/excilys/androidannotations/wiki/OttoIntegration)에 안내되어 있다. 그런데 빌드를 하면 Error는 발생하지 않는데 아래와 비슷한 Warning이 다수 나왔다.

```
Warning:(43, 17) Element SubscribeHandler unvalidated by
```

Gradle Console에서는 아래와 같은 오류를 보였다.

```
Note: Validating with SubscribeHandler: [...]
...
warning: Element SubscribeHandler unvalidated by
    public void userInfoChanged(final RefreshEvent event) {
```

사실 실행에도 문제가 없고 Warning 일 뿐이라서 처음엔 무시했다. 하지만 Warning이 계속 마음에 걸려 원인을 확인하고 수정해 보기로 했다. 사실 최대한 Warning은 없애야 한다. 당연히 경고를 해주고 있는 것이니 문제를 파악하고 개선 해야한다. 그럼에도 미뤄두었던 이유는 사실 시간이 조금 부족했기 때문이다(근본적인 이유는 귀찮음이겠지만).

아직 근본적인 해결을 하지 못함

___

[How to use Otto event bus with Android Annotations](http://stackoverflow.com/questions/26862782/how-to-use-otto-event-bus-with-android-annotations) 라는 StackOverflow 글을 보면 AndroidAnnotaions 3.1에서 버그가 있었고 3.2에서 수정되었다고 한다. 사실 이 글을 보면 Warning에 관련된 것이 아니고 생각대로 이벤트 수신이 되지 않는다는 질문이다. 


