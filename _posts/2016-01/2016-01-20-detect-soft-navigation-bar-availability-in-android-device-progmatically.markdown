---
layout: post
title: "안드로이드에서 Soft Navigation Bar 검사하기"
date: 2016-01-20T20:36:18+09:00
comments: true
categories: android
---

안드로이드 기기 중에는 Soft Navigation을 사용하는 것들이 있다. 보통은 뒤로, 메뉴, 홈 버튼 등이 스크린과 분리되어 물리적 버튼으로 구성되어 있으나 이 버튼들이 스크린 하단 영역에 포함되어 있는 경우다. 이런 기기에서는 상황에 딸 하단의 버튼 영역을 숨겨 보다 넓은 공간을 스크린으로 활용할 수 있다.

여기서 다루고자 하는 것은 이런 물리 버튼을 가진 기기와 Soft Navigation을 사용하는 기기를 구분하는 방법이다.

관련 정보를 찾아보면 명확하게 구분할 수 있는 방법을 제시하는 곳을 찾기가 어렵다(안드로이드에서 기기에 관련해서 명확한 구분을 할 수 있는 것을 찾는게 더 빠를지도). 그래서 몇가지를 조사해서 적용한 내용을 남기려고 한다. 이 부분은 현재 테스트할 수 있었던 기기에서만 확인한 정보로 부정확할 수 있음을 양해 바란다(나도 정말 정확한 방법을 찾고 싶다).

우선 아래의 코드를 보자.

```java
int id = mChildOfContent.getContext().getResources().getIdentifier("config_showNavigationBar", "bool", "android");
if (id > 0) {
	useSoftNavigation = mChildOfContent.getContext().getResources().getBoolean(id);
} else {
	if (Build.VERSION.SDK_INT < Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
		boolean hasBackKey = KeyCharacterMap.deviceHasKey(KeyEvent.KEYCODE_BACK);
		boolean hasHomeKey = KeyCharacterMap.deviceHasKey(KeyEvent.KEYCODE_HOME);
		useSoftNavigation = (!(hasBackKey && hasHomeKey));
	} else {
		useSoftNavigation = ViewConfiguration.get(mChildOfContent.getContext()).hasPermanentMenuKey();
	}
}
```

위 코드는 처음에 정리했던 코드다.

1차적으로 `config_showNavigationBar` 속성값을 이용해서 사용 유무를 판별한다. 개인적으로 그나마 가장 명시적인 값이라고 생각한다. 문제는 해당 값이 없는 기기가 있다거나 나중에 OS 버전이 올라가면서 속성값이 변경될 우려가 있다는 것이다. 그래서 이 부분을 보완하고자 다른 코드를 덧붙였다.

[hasPermanentMenuKey()](http://developer.android.com/intl/ko/reference/android/view/ViewConfiguration.html#hasPermanentMenuKey%28%29)를 사용하는 방법도 API 14 이상이라면 유용하다고 생각했으나 부정확했다. 갤럭시 노트 3에서 잘못된 값이 나왔다. 실제로 조사 결과 예상과 다른 값을 반환하는 경우가 다수 있었다(정확하게는 PermanentMenuKey와 Soft Navigation은 직접적인 관련이 없다는 것이 설명이다). 따라서 이 값은 사용이 부적절하다고 보인다.

[KeyCharacterMap](http://developer.android.com/intl/ko/reference/android/view/KeyCharacterMap.html)를 사용하는 방법은 잘 동작하는 것으로 보이나 정확한 방법이라고는 못하겠다.

그래서 실제 사용하는 코드는 [hasPermanentMenuKey()](http://developer.android.com/intl/ko/reference/android/view/ViewConfiguration.html#hasPermanentMenuKey%28%29)를 제외하고 아래와 같이 사용하고 있다(현재까지는).

```java
boolean useSoftNavigation;
int id = mChildOfContent.getContext().getResources().getIdentifier("config_showNavigationBar", "bool", "android");
if (id > 0) {
	useSoftNavigation = mChildOfContent.getContext().getResources().getBoolean(id);
} else {
	boolean hasBackKey = KeyCharacterMap.deviceHasKey(KeyEvent.KEYCODE_BACK);
	boolean hasHomeKey = KeyCharacterMap.deviceHasKey(KeyEvent.KEYCODE_HOME);
	useSoftNavigation = (!(hasBackKey && hasHomeKey));
}
```

또 다른 방법으로 Screen Size를 이용한 Navigation Bar의 높이를 구하는 방법이 있다.

```java
public static Point getNavigationBarSize(Context context) {
    Point appUsableSize = getAppUsableScreenSize(context);
    Point realScreenSize = getRealScreenSize(context);

    // navigation bar on the right
    if (appUsableSize.x < realScreenSize.x) {
        return new Point(realScreenSize.x - appUsableSize.x, appUsableSize.y);
    }

    // navigation bar at the bottom
    if (appUsableSize.y < realScreenSize.y) {
        return new Point(appUsableSize.x, realScreenSize.y - appUsableSize.y);
    }

    // navigation bar is not present
    return new Point();
}

public static Point getAppUsableScreenSize(Context context) {
    WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    Display display = windowManager.getDefaultDisplay();
    Point size = new Point();
    display.getSize(size);
    return size;
}

public static Point getRealScreenSize(Context context) {
    WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    Display display = windowManager.getDefaultDisplay();
    Point size = new Point();

    if (Build.VERSION.SDK_INT >= 17) {
        display.getRealSize(size);
    } else if (Build.VERSION.SDK_INT >= 14) {
        try {
            size.x = (Integer) Display.class.getMethod("getRawWidth").invoke(display);
            size.y = (Integer) Display.class.getMethod("getRawHeight").invoke(display);
        } catch (IllegalAccessException e) {} catch (InvocationTargetException e) {} catch (NoSuchMethodException e) {}
    }

    return size;
}
```

개인적으로는 스크린 사이즈를 이용하는 방법은 가급적 사용을 피하고 있다. OS 버전이 올라가는 경우와 기기의 다양성을 생각할 때 안정적으로 동작할 것이라는 생각이 들지 않기 때문이다. 하지만 대안이 없다면 사용을 고려하려고 한다.

현재까지는 위 방법으로 필요한 요건을 만족하고 있으니 당분간 지켜볼 예정이다. 항상 그러하듯 안드로이드는 개발이 문제가 아니라 파편화된 상황을 고려하는 작업이 가장 큰 골치거리인 것 같다.
