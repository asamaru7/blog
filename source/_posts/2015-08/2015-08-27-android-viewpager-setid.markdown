---
layout: post
title: "Android ViewPager를 직접 생성시 android.content.res.Resources$NotFoundException: Unable to find resource ID #0xffffffff 오류 발생"
date: 2015-08-27 10:56:56 +0900
comments: true
categories: ["android"]
---

일반적으로 ViewPager 사용시 layout xml에서 정의해서 사용한다.
하지만 간혹 필요에 따라 ViewPager을 프로그램으로 생성해서 사용하는 경우 있다.

```java
ViewPager viewPager = new ViewPager(this);
```

그런데 이렇게 사용할 경우 아래와 같은 오류를 만나게 된다.

```java
android.content.res.Resources$NotFoundException: Unable to find resource ID #0xffffffff
            at android.content.res.Resources.getResourceName(Resources.java:3216)
            at android.support.v4.app.FragmentManagerImpl.moveToState(FragmentManager.java:1008)
            at android.support.v4.app.FragmentManagerImpl.moveToState(FragmentManager.java:1197)
            at android.support.v4.app.BackStackRecord.run(BackStackRecord.java:738)
            at android.support.v4.app.FragmentManagerImpl.execPendingActions(FragmentManager.java:1562)
            at android.support.v4.app.FragmentManagerImpl.executePendingTransactions(FragmentManager.java:535)
            at android.support.v4.app.FragmentPagerAdapter.finishUpdate(FragmentPagerAdapter.java:141)
            at android.support.v4.view.ViewPager.populate(ViewPager.java:1106)
            at android.support.v4.view.ViewPager.populate(ViewPager.java:952)
            at android.support.v4.view.ViewPager.onMeasure(ViewPager.java:1474)
            at android.view.View.measure(View.java:18573)
...
```

처음엔 웬 리소스를 못 찾는다는 에러가 나오는지 한참을 헤맸다.
결국 알아낸 문제는 사실 개인적으로 조금 어이가 없었다. xml에서 정의된 ViewPager는 인스턴스화되면서 임시 id가 알아서 지정되는 것으로 보이나 프로그램에서 생성한 ViewPager는 그 과정이 누락되는 것이다.
어이없는 상황. 그러나 해결법은 간단하다. id를 지정해 주면 된다.

그래서 아래처럼 해봤다.

```java
ViewPager viewPager = new ViewPager(this);
viewPager.setId(1);
```

하지만 그렇게 간단히 해결되면 안드로이드가 아니지...
그래서 다음과 같은 방법으로 id를 생성해 주어야 한다.

```java
public class IdGen {
	final static private AtomicInteger sNextGeneratedId = new AtomicInteger(1);

    static private int _generateViewId() {
        for (; ; ) {
            final int result = sNextGeneratedId.get();
            // aapt-generated IDs have the high byte nonzero; clamp to the range under that.
            int newValue = result + 1;
            if (newValue > 0x00FFFFFF) newValue = 1; // Roll over to 1, not 0.
            if (sNextGeneratedId.compareAndSet(result, newValue)) {
                return result;
            }
        }
    }

    static public int generateViewId() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) {
            return _generateViewId();
        } else {
            return View.generateViewId();
        }
    }
}
```

```java
ViewPager viewPager = new ViewPager(this);
viewPager.setId(IdGen.generateViewId());
```

드디어 이상없이 동작한다.

