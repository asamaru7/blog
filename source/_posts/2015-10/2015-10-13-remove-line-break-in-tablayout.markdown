---
layout: post
title: "안드로이드 TabLayout 사용시 Tab Text가 두줄로 나오는 문제 해결"
date: 2015-10-13 11:35:54 +0900
comments: true
categories: android
---
TabLayout에 대한 사용법은 [Google Play Style Tabs using TabLayout](https://guides.codepath.com/android/Google-Play-Style-Tabs-using-TabLayout)에 잘 나와 있으므로 생략한다.

안드로이드의 TabLayout 사용시 Tab 안의 Text가 두줄로 나오는 문제가 있다. 정확하게 이야기하자면 Desigon Support Library 23.0.1 미만에서 문제가 있다(자세한 내용은 아래에서 설명한다). 예를들어 아래와 같은 경우다.

![Remove line break in TabLayou](/img/2015-10-13-remove-line-break-in-tablayout-1.png)

위 이미지는 [Remove line break in TabLayout](http://stackoverflow.com/questions/31698756/remove-line-break-in-tablayout)에서 질문을 위해 올린 이미지인데 새로 캡춰해서 넣기 귀찮아서 복사해 왔다. 이 글에서도 동일한 문제에 대해 질문하고 있는데 이 문제는 `app:tabMode="fixed"`를 사용할 때 발생한다. 당연히 `app:tabMode="scrollable"`를 사용하면 해결될 수 있는 문제이지만 Text가 짧으면 가로 사이즈에 맞춰서 fit하고 싶을 경우는 무조건 scrollable을 사용할 순 없는 것이다. 이 질문에 대한 답변에 보면 [setCustomView (View view)](https://developer.android.com/intl/ru/reference/android/support/design/widget/TabLayout.Tab.html#setCustomView%28android.view.View%29)를 사용하는 방법을 안내하고 있다. 그냥 글자를 한줄로 나오게만 하고 싶은 것이라면 이 방법을 사용하는 것도 해결 방법이 될 수 있지만 fixed와 scrollable을 선택적으로 사용하는 것에는 사용될 수 없다(사실 그런 기능은 원래 없다).

다시 정리하자면 Tab의 개수나 Tab의 Text의 길이가 유동적인 경우에 들어갈 수 있는 공간이 충분하다면 fixed를 사용하고 길다면 scrollable을 사용하고 싶은 경우에는 어떻게 해야할까? 이 문제를 해결해주는 오픈소스 [android-tablayouthelper](https://github.com/h6ah4i/android-tablayouthelper)가 있다.

[android-tablayouthelper](https://github.com/h6ah4i/android-tablayouthelper)를 사용하면 Tab 들의 길이에 맞춰서 fixed와 scrollable을 자동 변경해 준다.

그런데 여기서도 문제가 있다. 이 라이브러리에서는 Tab의 길이를 내부적으로 계산해서 fixed와 scrollable를 선택해 주는데 fixed일때와 scrollable일때 가로 사이즈가 차이가 날 수 있다(내부적으로 스타일이 약간 다르게 지정되는 것으로 보인다). 특히 Tab의 Text가 여러줄이 될 수 있도록 되어 있으면 문제가 더 심하게 나타난다(경험적으로). 이 문제를 개선하려면 Tab의 Text를 무조건 한줄로 나오게 하면 된다. 아래의 예시를 보자.

```xml layout.xml
<android.support.design.widget.TabLayout
        android:id="@+id/tabs"
        style="@style/MyCustomTabLayout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content">
</android.support.design.widget.TabLayout>
```

```xml styles.xml
<style name="MyCustomTabLayout" parent="Widget.Design.TabLayout">
    <item name="tabTextAppearance">@style/MyCustomTabTextAppearance</item>
</style>
<style name="MyCustomTabTextAppearance" parent="TextAppearance.Design.Tab">
    <item name="android:singleLine">true</item>
    <item name="android:maxLines">1</item>
</style>
```

위 방법으로 Tab의 Text를 1줄로 표시할 수 있다. 그런데 이 부분에 또 문제가 있다. Desigon Support Library 23.0.1 미만에서는 maxLines가 적용되지 않는다. 이유는 [TabLayout hard codes maxLines to 2](https://code.google.com/p/android/issues/detail?id=175516)를 보면 알 수 있다. 예전 버전에서는 TabLayout 소스 코드에 MAX_TAB_TEXT_LINES가 상수로 2로 선언되어 있었다. 내용에 보면 v22.2.1에 수정되었다고 했다가 해결되지 않았고 v23.0.1에서 반영되었다. v23.0.1에서 해결된 것은 직접 확인했다. 관련된 부분이 필요해서 기존에 프로젝트에서 tablayouthelper를 상속받아 직접 처리 했었던 부분을 제거하고 정상 동작하는 것을 확인했다.

매번 이야기하는 것이지만 안드로이드는 정말 너무 엉망이다. 이런 문제들을 너무 많이 봤다.

**결론은 Desigon Support Library 23.0.1 이상을 사용한다면 문제들을 해결할 수 있다.**

자 마지막으로 한가지만 더 설명하겠다. 위의 예시는 TabLayout을 layout xml에서 직접 사용할 때 처리하는 방법이다. 그렇다면 소스 코드에서 TabLayout 인스턴스를 만들어야 할 경우는 어떻게 style을 적용할까? 현재 시점에서는 기본적으론 방법이 없다. 아래의 코드를 보자.

```java
TabLayout tabLayout = new TabLayout(getContext());
try {
    Class<?> clazz = Class.forName(TabLayout.class.getName());
    Field field = clazz.getDeclaredField("mTabTextAppearance");
    field.setAccessible(true);
    field.set(tabLayout, R.style.MyCustomTabTextAppearance);
} catch (Exception e) {
	e.printStackTrace();
}
```

그렇다 직접 지정할 방법이 없어서 reflection을 사용했다. 정말 이렇게까지 하고 싶지는 않아서 다른 방법들을 찾아봤지만 아직은 발견하지 못했다.

다만, 안드로이드 메뉴얼 중 [View](http://developer.android.com/intl/ru/reference/android/view/View.html#View%28android.content.Context,%20android.util.AttributeSet,%20int,%20int%29)를 보면 `int defStyleRes`를 네번째 인자로 가지는 생성자가 있는 것을 발견했다. 단, api 21 이후부터 추가된 생성자다. 예상하기론 defStyleRes를 지정할 수 있으면 MyCustomTabLayout를 지정해서 소스 코드에서도 스타일을 지정할 수 있을 것 같긴한데 TabLayout은 `public TabLayout (Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes)` 생성자를 제공하지 않는다(v23.0.1 기준).

TabLayout의 `public TabLayout(Context context, AttributeSet attrs, int defStyleAttr)` 생성자에 있는 내용을 보면 아래의 코드가 있다.

```java
TypedArray a = context.obtainStyledAttributes(attrs, styleable.TabLayout, defStyleAttr, style.Widget_Design_TabLayout);
```

여기서 `style.Widget_Design_TabLayout` 대신 defStyleRes를 넘겨받아 넣어주도록만 해줘도 가능할 것 같은데 아직은 지원하지 않는 것이다.

어쨌든 현재 시점을 기준으로 해결 방법은 위의 예시처럼 reflection을 사용하는 방법뿐이다.
