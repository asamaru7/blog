---
layout: post
title: "안드로이드 ViewPager.setOnPageChangeListener() Deprecated 대응"
date: 2015-09-21 11:20:00 +0900
comments: true
categories: android
---
[Android Support Library 22.2.0](https://developer.android.com/intl/ko/tools/support-library/index.html) 이후부터 ViewPager.setOnPageChangeListener() 함수가 Deprecated 되었다. 안드로이드는 무슨 Deprecated가 이렇게 빈번한지... 하지만 이번 변경은 옳은 결정이라고 생각한다. 그냥 Deprecated된 것이 아니라 대체할 수 있는 함수가 함께 추가되었다(더 유연한).

**[ViewPager.setOnPageChangeListener() - Deprecated](https://developer.android.com/intl/ko/reference/android/support/v4/view/ViewPager.html#setOnPageChangeListener%28android.support.v4.view.ViewPager.OnPageChangeListener%29)**

```java
public void setOnPageChangeListener (ViewPager.OnPageChangeListener listener)
```
> ViewPager의 페이지가 변경(선택된 페이지의 변경 : UI의 변경이 아닌)되거나 스크롤이 이동될 때 불려지는 listener를 지정한다.

기존 setOnPageChangeListener의 문제점은 listener를 하나만 사용할 수 있다는 것이다. 그래서 이번에 Deprecated되면서 여러개의 listener를 사용할 수 있도록 변경되었다.

대체 방법으로 아래의 함수들이 추가되었다.

**[ViewPager.addOnPageChangeListener()](https://developer.android.com/intl/ko/reference/android/support/v4/view/ViewPager.html#addOnPageChangeListener%28android.support.v4.view.ViewPager.OnPageChangeListener%29)**

```java
public void addOnPageChangeListener (ViewPager.OnPageChangeListener listener)
```

> OnPageChangeListener를 추가한다.

**[ViewPager.clearOnPageChangeListeners()](https://developer.android.com/intl/ko/reference/android/support/v4/view/ViewPager.html#clearOnPageChangeListeners%28%29)**

```java
public void clearOnPageChangeListeners ()
```

> 등록된 OnPageChangeListener를 모두 제거한다.

**[ViewPager.removeOnPageChangeListener()](https://developer.android.com/intl/ko/reference/android/support/v4/view/ViewPager.html#removeOnPageChangeListener%28android.support.v4.view.ViewPager.OnPageChangeListener%29)**

```java
public void removeOnPageChangeListener (ViewPager.OnPageChangeListener listener)
```

> 지정된 OnPageChangeListener를 제거한다.

사용법은 설명하지 않아도 바로 이해할 수 있을 생각된다. setOnPageChangeListener와 addOnPageChangeListener의 인자가 동일하므로 함수명만 바꾸면 그대로 동작한다. 단, 기존 것은 setOnPageChangeListener는 removeOnPageChangeListener와 addOnPageChangeListener 동작을 합친 것처럼 동작했으니 동일한 역할이 필요하다면 removeOnPageChangeListener와 addOnPageChangeListener를 함께 사용해야 한다.