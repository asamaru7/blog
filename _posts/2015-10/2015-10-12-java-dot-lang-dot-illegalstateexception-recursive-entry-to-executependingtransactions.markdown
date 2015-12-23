---
layout: post
title: "java.lang.IllegalStateException: Recursive entry to executePendingTransactions 오류"
date: 2015-10-12 12:07:06 +0900
comments: true
categories: android
---
안드로이드 작업중 `java.lang.IllegalStateException: Recursive entry to executePendingTransactions` 오류를 만났다. 오류가 발생한 상황은 다음과 같다.

작업중 Fragment에서 하위에 또 다른 Fragment를 추가할 일이 생겼다. 이 작업 중에 하위에 추가되는 Fragment에서 `executePendingTransactions()` 함수를 호출하니 위 오류가 발생했다. 이해를 위해 처리 과정 중 문제가 발생한 부분만 적는다.

```java
FragmentManager ft = getActivity().getSupportFragmentManager();
ft.beginTransaction()
        .add(R.id.fragmentContainer, (Fragment) fragment)
        .commit();
ft.executePendingTransactions();
```

FragmentManager를 얻기 위해 현재 Fragment의 Activity를 가져와 `getSupportFragmentManager()`를 사용했다. 이 부분이 문제가 생기는 이유다. 이런 경우는 아래와 같이 처리할 수 있다.

```java
FragmentManager ft = getChildFragmentManager();
ft.beginTransaction()
        .add(R.id.fragmentContainer, (Fragment) fragment)
        .commit();
ft.executePendingTransactions();
```

`getChildFragmentManager()`를 사용해서 FragmentManager를 얻어서 처리하면 위 오류는 발생하지 않는다.

이와 관련된 설명은 [Nested Fragments](http://developer.android.com/intl/ru/about/versions/android-4.2.html#NestedFragments)를 보면 된다. 4.2에 변경된 내용으로 나와 있지만 support library를 사용한다면 하위 호환이 가능한 상황이라 문제되지 않는다.

추가적으로 [public abstract boolean executePendingTransactions()](http://developer.android.com/intl/ko/reference/android/app/FragmentManager.html#executePendingTransactions%28%29)에 대해서 궁금하다면 [프래그먼트 트랜잭션 수행](http://developer.android.com/intl/ko/guide/components/fragments.html#Transactions))를 참고하면 된다.

> commit()을 호출해도 그 즉시 트랜잭션을 수행하지는 않습니다. 그보다는, 액티비티의 UI 스레드("주요" 스레드)를 스레드가 할 수 있는 한 빨리 이 트랜잭션을 수행하도록 일정을 예약하는 것에 가깝습니다. 하지만 필요한 경우 UI 스레드로부터 executePendingTransactions()를 호출하면 commit()이 제출한 트랜잭션을 즉시 실행할 수 있습니다. 트랜잭션이 다른 스레드의 작업에 대한 종속성이 아니라면 굳이 이렇게 해야만 하는 것은 아닙니다.
