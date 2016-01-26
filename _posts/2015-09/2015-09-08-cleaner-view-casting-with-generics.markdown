---
layout: post
title: "안드로이드에서 findViewById 사용시 Generics을 이용해 Type Casting 없애기"
date: 2015-09-08 22:27:15 +0900
comments: true
categories: android
---

안드로이드 작업을 하다보면 findViewById를 아주 빈번하게 사용하게 된다. 이 작업이 생각보다 귀찮다보니 "[butterknife](http://jakewharton.github.io/butterknife/)"나 "[androidannotations](http://androidannotations.org/)" 같은 라이브러리를 사용하게 된다.(당연히 그 함수를 사용이 귀찮다는 이유만은 아니지만)

아래의 방법은 저런 라이브러리를 사용할 때만큼 여러가지 일을 할 수는 없지만 findViewById를 사용함에 가장 귀찮은 작업인 View Type Casting을 하지 않아도 된다.

우린 일반적으로 아래와 같은 방식으로 함수를 사용한다.

```java
TextView textView = (TextView) findViewById(R.id.textview);
```

이를 개선하기 위해 아래의 함수 하나를 추가한다. 어디든 상관 없이 사용하고자 하는 클래스의 내부에 넣는다. 사실 사용시마다 이 함수를 추가하는 작업이 더 귀찮을 수 있다. 그래서 난 기본 Activity와 Fragment 안에 넣어두고 사용한다. (난 여러가지 이유로 작업시 base activity, fragment를 만들어 두고 실제 작업시 상속받아 사용한다. 이렇게하면 이번 경우와 같이 유틸성 함수를 함께 쓰기도 좋고 제어하기도 좋기 때문이다.)

```java
@SuppressWarnings("unchecked")
public final <E extends View> E findView (int id) {
    return (E) findViewById(id);
}
```

그리고 아래와 같이 사용할 수 있다.

```java
TextView textView = findView(R.id.textview);
Button button = findView(R.id.button);
ImageView image = findView(R.id.imageview);
```

사실 별차이 아니다. 하지만 작업 해본 사람은 안다. Type Casting을 일일이 넣는게 얼마나 귀찮은지.
