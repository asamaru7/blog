---
layout: post
title: "안드로이드 : TextView 터치시 가로 스크롤이 되지 않는 문제 수정(ViewPager 등에서)"
date: 2016-07-12 11:34:06 +09:00
comments: true
categories: android
---

오늘도 역시 안드로이드는 실망시키지 않는다. 오늘의 문제는 이렇다.

>가로 스크롤되는 ViewPager의 Item View에 TextView가 포함되도록 구성되어 있을 경우 TextView 위에서 터치를 하면 가로 스크롤이 동작하지 않는 문제가 발생한다. 조금 더 정확히 이야기하자면 `singleLine` 속성이 true로 설정된 TextView들이 가로 스크롤을 정상 동작하지 않도록 만든다.

처음엔 click 이벤트로 인한 문제로 생각했다. 실제로 아래에 깔린 View의 click 이벤트를 제거하니 스크롤이 정상적으로 동작했다. 그런데 다른 UI에서 동일한 형태로 사용중이나 그곳에서는 해당 문제가 발생하지 않기에 다른 원인이 있을 것이라는 판단으로 조금 더 찾아봤다.

결국 원인을 찾고보니 `android:scrollHorizontally` 속성이 true로 설정될 경우 해당 문제가 발생했다. TextView의 scroll 처리 영역과 ViewPager의 scroll 처리가 충돌하는 것이다. 그런데 나는 이 속성을 true로 주지 않았기 때문에 이상하다고 생각하고 `TextView.java` 파일의 내부를 보다가 아래의 코드를 찾았다.

**TextView.java**

```java
private void applySingleLine(boolean singleLine, boolean applyTransformation,
        boolean changeMaxLines) {
    mSingleLine = singleLine;
    if (singleLine) {
        setLines(1);
        setHorizontallyScrolling(true);
        if (applyTransformation) {
            setTransformationMethod(SingleLineTransformationMethod.getInstance());
        }
    } else {
        if (changeMaxLines) {
            setMaxLines(Integer.MAX_VALUE);
        }
        setHorizontallyScrolling(false);
        if (applyTransformation) {
            setTransformationMethod(null);
        }
    }
}
```

그렇다. `singleLine` 속성을 사용하면 자동적으로 `setHorizontallyScrolling(true);`가 적용되는 것이다. 여담이지만 `android:scrollHorizontally` 설정 상태를 확인하기 위해 `TextView.java`에 있는 아래의 함수를 호출해 봤더니 해당 함수를 못찾는다. 최신 SDK에 들어간 것도 아니고 public 인데도 불구하고... 역시 이상한 안드로이드.

```java
public boolean getHorizontallyScrolling() {
    return mHorizontallyScrolling;
}
```

어쨌든 이를 해결하기 위해 아래와 같이 style을 정의해서 TextView에 적용해 봤다.

```xml
<style name="TextViewBaseStyle">
  <!-- 가로 스크롤 문제를 발생시키는 속성 -->
  <item name="android:singleLine">true</item>
  <item name="android:ellipsize">end</item>
  <!-- 가로 스크롤 문제를 개선하기 위한 시도 -->
  <item name="android:scrollHorizontally">false</item>
  <item name="android:clickable">false</item>
  <item name="android:focusable">false</item>
  <item name="android:focusableInTouchMode">false</item>
</style>
```

결론은 안된다. `android:scrollHorizontally` 값이 위에 보여준 코드에 의해 무시되는 결과를 가져오는 것이다.

따라서 해결 방법은 아래의 방법 밖에 없다.

```java
textView.setHorizontallyScrolling(false);
```

그렇다. 프로그램에서 직접 `android:scrollHorizontally`를 false로 설정하는 것 외에는 다른 방법이 없다. `TextView.java` 내부에서 직접 true를 지정하고 있으므로 해당 코드를 오버라이딩 할 것이 아니라면 이 방법 밖에는 없다. 생성자 내부에서 처리 순서가 아래와 같기 때문에 `singleLine` 속성을 사용한다면 다른 방법이 없는 것이다. 도대체 TextView 개발자는 무슨 생각으로 코드를 짠 것인가?

```java
...
case com.android.internal.R.styleable.TextView_scrollHorizontally:
    if (a.getBoolean(attr, false)) {
        setHorizontallyScrolling(true);
    }
    break;
...
applySingleLine(singleLine, singleLine, singleLine);
...          
```
