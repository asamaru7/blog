---
layout: post
title: "android.view.WindowManager$BadTokenException: Unable to add window 오류"
date: 2015-11-03 09:00:30 +0900
comments: true
categories: android
---

안드로이드에서 아래와 같은 오류가 나는 경우가 있다.

`android.view.WindowManager$BadTokenException: Unable to add window -- token android.os.BinderProxy@420d8488 is not valid; is your activity running?`

대부분은 Dialog를 띄우러고 할 때 발생한다. 소스로 보자면 아래와 같은 경우다.

```java
new AlertDialog.Builder(context)
    .setTitle("알림")
    .setMessage("알림 메시지")
    .setNegativeButton("취소", null)
    .show();
```

위 소스를 실행 했을 때 BadTokenException 오류가 발생한다면 대부분은 context에 Activity Context를 넣지 않고 Application Context를 넣었을 경우다. 이와 관련해서 [안드로이드에서 Dialog 사용시 WindowManager$BadTokenException 발생](/2015/09/04/android-dialog-windowmanager-badtokenexception/)이라는 글을 적은 적이 있었다. 이런 경우라면 처음부터 오류가 발생하기 때문에 발견하고 수정하기가 쉽다.

그런데 분명 Activity Context를 넣어주었음에도 불구하고 불특정하게 오류가 발생하는 상황이 있다. 나의 경우는 다음과 같은 상황에서 이 문제가 발생했다.

앱 시작시 splash 화면에서 네트워크 활성 여부를 검사해서 비활성(서버 접속 불가)되어 있다면 알림 Dialog를 띄우고 앱을 종료하도록 했다. 그런데 여기서 불특정하게 오류가 발생하여 앱이 알림 Dialog를 띄우지 못하고 죽어 버리는 현상이 발생했다.

ACRA를 통해 보고된 오류 메시지를 확인하니 위에서 언급했던 오류가 발생하고 있었다. 그래서 원인을 찾기 위해 소스 코드를 확인해 보았으나 아무리 봐도 문제가 될 부분을 찾을 수 없었다. 그래서 구글에서 관련 정보를 찾아보니 [“android.view.WindowManager$BadTokenException: Unable to add window” on buider.show()](http://stackoverflow.com/a/18665887)에 원인과 해결 방법이 나와 있었다.

결론은 context의 null 검사 뿐만 아니라  [isFinishing()](http://developer.android.com/intl/ko/reference/android/app/Activity.html#isFinishing%28%29)도 함께 검사 해줘야 한다는 것이다.

적용된 코드는 아래와 같다.

```java
if ((context != null) && (!context.isFinishing())) {
  new AlertDialog.Builder(context)
      .setTitle("알림")
      .setMessage("알림 메시지")
      .setNegativeButton("취소", null)
      .show();  
}
```

사실 이것 만으로 오류가 모두 해결된 것인지는 확인하지 못했다(오류 재현이 너무 힘들다).   하지만 안드로이드에서 발생하는 비슷한 다른 오류들을 감안하면 이것이 원인이 맞을 것이라고 생각한다.
