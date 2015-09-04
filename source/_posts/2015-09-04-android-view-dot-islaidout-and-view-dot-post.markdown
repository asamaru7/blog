---
layout: post
title: "안드로이드 View.isLaidOut / View.post"
date: 2015-09-04 10:12:29 +0900
comments: true
categories: android
---
안드로이드 View는 isLaidOut이라는 함수를 가지고 있다. 단, API 19(KITKAT)부터 사용가능하다. 사실 그 이하의 기기에서도 다른 방법을 통해서 사용가능하다. 아주 간단히. 이 부분은 나중에 다시 설명하겠다.

우선 isLaidOut 함수에 대해 안드로이드 메뉴얼에는 다음과 같이 나와있다.

> public boolean isLaidOut ()

> Added in API level 19
> Returns true if this view has been through at least one layout since it was last attached to or detached from a window.

쉽게 말해서 "해당 View가 layout이 그려졌는가?"를 반환하는 함수다.

다음은 post 함수에 대한 안드로이드 메뉴얼이다.

> public boolean post (Runnable action)

> Added in API level 1
> Causes the Runnable to be added to the message queue. The runnable will be run on the user interface thread.

Runnalbe을 넘겨 받아 UIThread에서 실행시켜준다고 한다.

그래서 어디에 써먹을 수 있나?
한가지 예를들어 보자면 TextView의 getLineCount()의 반환값 문제를 해결할 수 있다.

구글에서 "[textview getlinecount](https://www.google.co.kr/search?q=isLaidOut&gws_rd=ssl#newwindow=1&safe=off&q=textview+getlinecount)"로 검색하면 많이 나오는 것 중 하나가 "textview.getLineCount always 0 in android"라는 질문이다.

textview의 getLineCount()를 요청하면 항상 0이 나오는 문제가 있다는 얘기인데, 이런 문제의 원인은 getLineCount() 함수가 TextView가 그려진 후 그 상황에 맞는 라인수를 반환한다는 것이다. 따라서 그려지기 전에는 항상 0을 반환한다.

그럼 이 문제를 isLaidOut을 써서 해결해보자.

```java
TextView textView = new TextView(context);

...

textView.setText("test message");
if (textView.isLaidOut()) {
    Log.d("TEXTVIEW", "line count : " + textView.getLineCount());
} else {
    final TextView postTextView = textView;
    textView.post(new Runnable() {
        @Override
        public void run() {
            Log.d("TEXTVIEW", "line count : " + postTextView.getLineCount());
        }
    });
}
```

여러가지 상황이 있을 수 있다. 위의 예시와 다르게 layout xml에서 TextView가 정의될 수도 있고.
중요한 것은 TextView가 그려지기 전에 getLineCount() 함수를 사용하려는 것이다.

그런데 여기서도 한계는 있다. 값을 가져오는 부분이 비동기 방식이 된다는 것이다. 이를 해결하기 위해서는 다른 방법이 필요하다. 하지만 여기서는 isLaidOut에 대한 설명을 하고자 하는 것이므로 다음으로 넘긴다. 사실 찾아보면 여러가지 방법들이 제시되어 있는데 아주 깔끔한 방법은 현재로써는 찾기 힘들다.

위의 TextView 사례는 말그대로 예시일뿐 isLaidOut에 대한 활용 범위는 아주 다양할 수 있다.

마지막으로 isLaidOut을 API 19 이하에서 사용할 수 있는 방법은 다음의 예시를 참고하자.

```java
TextView textView = new TextView(context);

...

textView.setText("test message");
if (ViewCompat.isLaidOut(textView)) {
    Log.d("TEXTVIEW", "line count : " + textView.getLineCount());
} else {
    final TextView postTextView = textView;
    textView.post(new Runnable() {
        @Override
        public void run() {
            Log.d("TEXTVIEW", "line count : " + postTextView.getLineCount());
        }
    });
}
```

중요한 부분은 ViewCompat을 사용한다는 부분이다. 아주 간단한 방법으로 사용할 수 있으므로 하위 버전을 지원해야 한다하더라도 사용할 수 있다.

```java
ViewCompat.isLaidOut(textView)
```