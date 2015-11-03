---
layout: post
title: "java.lang.IllegalStateException: Can not perform this action after onSaveInstanceState 오류 해결"
date: 2015-10-13 16:53:54 +0900
comments: true
categories: android
---
안드로이드 Fragment 작업 중에 `java.lang.IllegalStateException: Can not perform this action after onSaveInstanceState` 오류가 발생했다. 상황은 이렇다. Fragment를 가진 Activity에서 새로운 Activity를 띄우고 해당 Activity에서 `setResult`를 통해 값을 반환했다. 새로운 Activity를 열었던 Activity에서는 `protected void onActivityResult(int requestCode, int resultCode, Intent intent)`를 통해 값을 전달 받아 새로운 Fragment를 불렀다. 그런데 위 오류가 난다. 아래는 작성했던 코드의 일부를 예시를 위해 수정한 것이다(실행가능한 코드가 아니다).

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (resultCode == RESULT_OK) {
    	FragmentManager ft = getChildFragmentManager();
		ft.beginTransaction()
				.replace(R.id.fragmentContainer, (Fragment) fragment)
				.commit();
    }
    super.onActivityResult(requestCode, resultCode, intent);
}
```

관련된 정보를 찾아보니 아래와 같은 문서들이 보였다.

* [java.lang.IllegalStateException: Can not perform this action after onSaveInstanceState](http://binsolb.tistory.com/entry/javalangIllegalStateException-Can-not-perform-this-action-after-onSaveInstanceState)
* [Fragment 파헤치기 – 3. FragmentManager, FragmentTransaction에 대해서](http://www.kmshack.kr/2013/08/fragment-%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0-3-fragmentmanager-fragmenttransaction%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C/)

**간단히 요약하자면 `commit()` 대신 `commitAllowingStateLoss()`을 사용하면 된다.** 원인에 대해서는 위의 글들을 참고하면 상세히 설명되어 있다. 그래서 고쳐진 코드는 다음과 같다.

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (resultCode == RESULT_OK) {
    	FragmentManager ft = getChildFragmentManager();
		ft.beginTransaction()
				.replace(R.id.fragmentContainer, (Fragment) fragment)
				.commitAllowingStateLoss();
    }
    super.onActivityResult(requestCode, resultCode, intent);
}
```

안드로이드는 이런 문제들에 대해서 알아서 좀 대응할 수 없는건가? 아쉽다.
그런데 함수 이름에도 나와 있는 것 처럼 `commitAllowingStateLoss()`를 사용하면 상태값을 잃을 수 있다.

[FragmentTransaction 메뉴얼](http://developer.android.com/intl/ko/reference/android/app/FragmentTransaction.html#commitAllowingStateLoss%28%29)에 아래와 같이 나와있다.

> public abstract int commitAllowingStateLoss ()
> 
> Like commit() but allows the commit to be executed after an activity's state is saved. This is dangerous because the commit can be lost if the activity needs to later be restored from its state, so this should only be used for cases where it is okay for the UI state to change unexpectedly on the user.

`commitAllowingStateLoss()`를 사용하지 않고 해결하는 방법은 없을까? 생각해보면 실행되는 시점의 문제이므로 시점을 조금 지연하는 방법을 쓸 수도 있다.

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
    if (resultCode == RESULT_OK) {
        Handler handler_ = new Handler(Looper.getMainLooper());
        handler_.postDelayed(new Runnable() {
            @Override
            public void run() {
                FragmentManager ft = getChildFragmentManager();
                ft.beginTransaction()
                        .replace(R.id.fragmentContainer, (Fragment) fragment)
                        .commitAllowingStateLoss();
            }
        }, 0);
    }
    super.onActivityResult(requestCode, resultCode, intent);
}
```

위 코드를 보면 Handler의 `postDelayed()` 함수를 사용해서 처리시점을 지연시켰다(사실 시간은 0이므로 작업을 잠시 뒤로 미룬것이다). 이렇게 해도 위 오류는 발생하지 않는다.

어떤 방법이 맞는지에 대해서는 아직은 정확히 모르겠다(이렇게하면 상태를 잃어버리는 것과 무관해 지는지 명확하지 않다는 뜻이다). 선택은 자유다.
