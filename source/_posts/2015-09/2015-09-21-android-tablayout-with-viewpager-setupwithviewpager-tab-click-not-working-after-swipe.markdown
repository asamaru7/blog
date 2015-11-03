---
layout: post
title: "안드로이드 TabLayout에서 setupWithViewPager() 사용시 Swipe 후 Tab 클릭시 ViewPager가 변경되지 않는 버그 수정"
date: 2015-09-21 11:40:02 +0900
comments: true
categories: android
---
[Android Design Support Library](http://android-developers.blogspot.kr/2015/05/android-design-support-library.html)에 있는 [TabLayout](https://developer.android.com/intl/ko/reference/android/support/design/widget/TabLayout.html)과 ViewPager를 연동해서 사용하기 위해 [setupWithViewPager()](https://developer.android.com/intl/ko/reference/android/support/design/widget/TabLayout.html#setupWithViewPager%28android.support.v4.view.ViewPager%29) 함수를 사용한다.

```java
public void setupWithViewPager (ViewPager viewPager)
```
> TabLayout와 ViewPager를 연동한다.

이 함수는 아래의 동작을 수행한다.

* Add a ViewPager.OnPageChangeListener that will forward events to this TabLayout.
* Populate the TabLayout's tabs from the ViewPager's PagerAdapter.
* Set our TabLayout.OnTabSelectedListener which will forward selected events to the ViewPager

결론은 setupWithViewPager()를 사용하면 손쉽게 TabLayout와 ViewPager를 연동할 수 있다. 다시말해 ViewPager를 넘기면 이에 맞추어 TabLayout의 선택이 변경되고 TabLayout에서 Tab을 터치하면 이에 맞게 ViewPager가 변경된다.

하지만 이 기능에는 버그가 있다. 그냥 쉽게 넘어가면 안드로이드가 아니지...
이 문제도 항상 발생하는 것은 아니나 간헐적으로 ViewPager을 Swipe하여 변경을 하다가 Tab을 터치하면 Tab은 터치에 맞게 변경되나 ViewPaper는 함께 변경되지 않는 문제가 발생한다. 이 문제에 대해서는 https://code.google.com/p/android/issues/detail?id=183123에 버그 리포트 되어 있다.

패치를 기다리기 전에 문제를 해결할 필요가 있어 아래와 같이 직접 수정해서 사용했다.

```java
tabLayout.setOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
    @Override
    public void onTabSelected(TabLayout.Tab tab) {
        if (tab.getPosition() != viewPager.getCurrentItem()) {
            viewPager.setCurrentItem(tab.getPosition());
        }
    }

    @Override
    public void onTabUnselected(TabLayout.Tab tab) {}

    @Override
    public void onTabReselected(TabLayout.Tab tab) {
        if (tab.getPosition() != viewPager.getCurrentItem()) {
            viewPager.setCurrentItem(tab.getPosition());
        }
    }
});
```

간단히 원리를 설명하자면 다음과 같다.

tab이 변경되었음에도 ViewPager에 반영되지 않는 것이 문제이므로 OnTabSelectedListener를 추가해서 변경된 Tab과 ViewPager의 위치가 맞지 않으면 강제로 ViewPager의 위치를 이동하는 것이다.

그런데 최근 이 버그 이슈에 변경이 생겼는데 내용은 **Android Design Support Library 23.0.1 버전에 패치(2015년 9월 5일자)가 되었다는 것**. 확인해 보니 버그 패치가 되었다. 따라서 23.0.1 이상을 사용한다면 위의 방법을 사용할 필요는 없어졌다. setupWithViewPager를 사용할 수 없는 경우 등을 위해서 기록을 남겨둔다.

