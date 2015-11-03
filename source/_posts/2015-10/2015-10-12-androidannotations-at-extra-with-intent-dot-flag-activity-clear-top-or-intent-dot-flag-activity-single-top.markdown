---
layout: post
title: "안드로이드에서 인턴트 호출시 Intent.FLAG_ACTIVITY_CLEAR_TOP 또는 Intent.FLAG_ACTIVITY_SINGLE_TOP 사용시 Androidannotations @Extra가 동작하지 않는 문제"
date: 2015-10-12 10:14:56 +0900
comments: true
categories: android
---

[Androidannotations](http://androidannotations.org/)를 사용하면 `@Extra`를 사용해서 인자를 받을 수 있다. 그런데 여기서 주의할 점이 있다. 인턴트 호출시 `Intent.FLAG_ACTIVITY_CLEAR_TOP` 또는 `Intent.FLAG_ACTIVITY_SINGLE_TOP`를 사용하게되면 인턴트가 이미 존재할 경우 `@Extra`가 동작하지 않는다. 이와 관련해서 [Always call #onNewIntent(), even without @AfterExtras method(s)](https://github.com/excilys/androidannotations/issues/1578)에서도 이슈가 진행중이다. 앞서 이야기한 문제와 이 이슈는 정확하게 같은 내용은 아니지만 동일한 이유로 발생하며 유사한 내용이라고도 볼 수 있다.

간단히 요약하자면 `@Extra`는 관련 처리를 `setIntent()`와 `onCraete()`에서 하는데 `Intent.FLAG_ACTIVITY_CLEAR_TOP` 또는 `Intent.FLAG_ACTIVITY_SINGLE_TOP`를 사용하게되면 인턴트가 존재할 경우 두 함수가 실행되지 않는다는 것이다(`onCraete()` 대신에 `onNewIntent(Intent intent)`가 호출이 되고 그 다음 onResume() 이 호출이 된다).

현재까지는 [Androidannotations](http://androidannotations.org/)에서 해당 문제를 해결하지 않았으므로 그에 따른 대응이 필요하다(Androidannotations을 사용하지 않는 상황이라면 `onResume`에서 extra 값을 받아오도록 하면 당연히 문제가 없다).

현재로써는 특별한 방법이 없어 아래와 같이 `onNewIntent()`애서 직접 값을 받도록 처리했다.

```java
@Override
protected void onNewIntent(Intent intent) {
	super.onNewIntent(intent);
	moveOwnLocation = intent.getBooleanExtra("EXTRA_NAME", false);
}
```

하지만 이렇게 한다면 `@Extra`를 사용하는 의미가 없고 `@AfterExtras`도 정상적으로 사용할 수 없으므로 패치를 기다렸다가 코드를 다시 처리 해야할 것 같다.