---
layout: post
title: "안드로이드 앱 종료 방법"
date: 2015-12-15 19:38:39 +0900
comments: true
categories: android
---
안드로이드에서 앱의 종료는 보통 Root Activity에서 [finish()](http://developer.android.com/reference/android/app/Activity.html#finish%28%29)를 사용한다. 그런데 앱의 종료는 이외에도 여러가지 방법이 있고 각각이 다른 상황을 만들어 낸다. 당연히 구글에서는 [finish()](http://developer.android.com/reference/android/app/Activity.html#finish%28%29)를 권장한다고 한다. 하지만 상황적으로 프로세스를 완전히 종료해야 하는 경우가 있을 수 있다. 아래에 설명하고자 하는 것들은 안정적으로 사용할 수 있는 방법이라고 장담하지는 못한다. 충분히 테스트된 코드가 아니라 인터넷 상에서 소개되는 방법들을 정리한 것이다. 물론 기본적인 테스트는 했다.

우선 Activity만 종료하는 방법부터 알아보자.

### [finishAffinity()](http://developer.android.com/reference/android/app/Activity.html#finishAffinity%28%29)를 사용하는 방법

Root Activity에서 [finish()](http://developer.android.com/reference/android/app/Activity.html#finish%28%29)를 사용해서 종료하는 것은 굳이 설명하지 않아도 될 것으로 생각한다. 단, 이 방법은 현재 Activity가 Root Activity가 아니면 Root Activity를 찾아가는 과정이 필요하므로 복잡해질 수 있다. 예를들어 아래와 같이 처리한다(이 코드는 테스트하지 않았다. 그리고 호출하는 Activity와 Root Activity에서 각각 처리해야 한다).

```java
// Root Activity를 호출
Intent intent  = new Intent(this, FirstActivity.class);
intent.putExtra(EXTRA_FINISH, true);
intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);        
startActivity(intent);
finish();
```

```java
// Root Activity에서 인자를 받아 종료
if (getExtras() != null && getIntentExtra(EXTRA_FINISH, false)) {
   finish();
}
```

이런 번거로움을 해결해 줄 수 있는 것이 [finishAffinity()](http://developer.android.com/reference/android/app/Activity.html#finishAffinity%28%29)다. 이 함수를 사용하면 어느 Activity에서든 모든 부모 Activity를 닫을 수 있다. 단, 이 함수는 API 16부터 사용 가능하다. 하지만 support library v4를 사용하면 이하 버전에서도 이 함수를 사용할 수 있다.

```java
// only API 16+
activity.finishAffinity();

// support library v4
ActivityCompat.finishAffinity(activity);
```

### 홈 화면 Activity 띄우기

이 방법은 Activity의 종료라고 하기에는 조금 애매한 방법이다. 일단 아래의 소스를 보자.

```java
Intent homeIntent = new Intent(Intent.ACTION_MAIN);
homeIntent.addCategory(Intent.CATEGORY_HOME);
homeIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
startActivity(homeIntent);
```

소스를 보면 알겠지만 말그대로 홈 화면 Activity를 띄우는 것이다. 어쨌든 사용자가 보기에는 앱이 종료된 것처럼 보인다. 뒤에 남겨진 프로세스가 계속 살아남는지 Activity finish와 동일한 생명주기를 갖는지는 테스트 해보지 않았다.

### [finishAndRemoveTask ()](http://developer.android.com/reference/android/app/Activity.html#finishAndRemoveTask%28%29)를 사용하는 방법

[finishAndRemoveTask ()](http://developer.android.com/reference/android/app/Activity.html#finishAndRemoveTask%28%29)는 Activity를 종료하고 Task Manager(최근 앱 사용 목록)에서도 해당 앱을 제거한다. **단, Task를 종료하지만 Process까지 종료하지는 않는다.** 앱을 [finishAndRemoveTask ()](http://developer.android.com/reference/android/app/Activity.html#finishAndRemoveTask%28%29)로 종료하고 Task Manager를 보면 해당 앱이 없어 Process가 종료된 것처럼 보이지만 이 상태에서 다시 앱을 실행하면 Application Class의 onCreate()가 실행되지 않는다(Process가 종료되었다면 이 함수가 다시 실행되었을 것이다). 메뉴얼에는 아래와 같이 나와있다.

> Call this when your activity is done and should be closed and the task should be completely removed as a part of finishing the Activity.

그리고 이 함수는 API 21에서 추가된 함수로 아직까지는 호환성 함수는 없는 것으로 보인다. 그나마 찾아본 바로는 chromium 소스 코드 중 [ApiCompatibilityUtils.java](https://chromium.googlesource.com/chromium/src/base/+/master/android/java/src/org/chromium/base/ApiCompatibilityUtils.java)에 있는 아래의 코드가 있다. 하지만 사용에 큰 의미는 없어보이니 참고만 하자.

```java
public static void finishAndRemoveTask(Activity activity) {
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP) {
        activity.finishAndRemoveTask();
    } else if (Build.VERSION.SDK_INT == Build.VERSION_CODES.LOLLIPOP) {
        // crbug.com/395772 : Fallback for Activity.finishAndRemoveTask() failing.
        new FinishAndRemoveTaskWithRetry(activity).run();
    } else {
        activity.finish();
    }
}

private static class FinishAndRemoveTaskWithRetry implements Runnable {
    private static final long RETRY_DELAY_MS = 500;
    private static final long MAX_TRY_COUNT = 3;
    private final Activity mActivity;
    private int mTryCount;
    FinishAndRemoveTaskWithRetry(Activity activity) {
        mActivity = activity;
    }
    @Override
    public void run() {
        mActivity.finishAndRemoveTask();
        mTryCount++;
        if (!mActivity.isFinishing()) {
            if (mTryCount < MAX_TRY_COUNT) {
                ThreadUtils.postOnUiThreadDelayed(this, RETRY_DELAY_MS);
            } else {
                mActivity.finish();
            }
        }
    }
}
```

### Process 종료하기

이제부터는 앱을 종료하고 Process까지 완전히 종료시키는 방법들이다. 이 부분에 대해서는 의견이 다양한데 앱 종료시 처리되어야 할 프로세스들이 정상적으로 동작하지 못할 수 있다는 우려로 사용을 자제하라는 의견도 있고 알아서 처리하므로 상관없다는 의견도 있다. 테스트를 아직 해보지 못해 어떤 문제가 발생하는지에 대해서는 설명할 수 없으니 사용시 유의하자.

[How to close Android application?](http://stackoverflow.com/a/5036668)에 소개된  Class 소스의 일부를 보자.

```java
public static void killApp(boolean killSafely) {
    if (killSafely) {
        /*
         * Notify the system to finalize and collect all objects of the app
         * on exit so that the virtual machine running the app can be killed
         * by the system without causing issues. NOTE: If this is set to
         * true then the virtual machine will not be killed until all of its
         * threads have closed.
         */
        System.runFinalizersOnExit(true);

        /*
         * Force the system to close the app down completely instead of
         * retaining it in the background. The virtual machine that runs the
         * app will be killed. The app will be completely created as a new
         * app in a new virtual machine running in a new process if the user
         * starts the app again.
         */
        System.exit(0);
    } else {
        /*
         * Alternatively the process that runs the virtual machine could be
         * abruptly killed. This is the quickest way to remove the app from
         * the device but it could cause problems since resources will not
         * be finalized first. For example, all threads running under the
         * process will be abruptly killed when the process is abruptly
         * killed. If one of those threads was making multiple related
         * changes to the database, then it may have committed some of those
         * changes but not all of those changes when it was abruptly killed.
         */
        android.os.Process.killProcess(android.os.Process.myPid());
    }
}
```

이 함수에서 Process를 종료하는 방법은 크게 두가지로 나뉜다. `System.exit()`를 사용하는 방법과 `android.os.Process.killProcess`를 사용하는 방법이다. 함수를 보면 알다시피 `System.exit()`를 사용하는 것이 더 안전한 방법으로 보인다. 그런데 이 부분에 대해서도 사람들의 의견이 차이가 있다. `System.runFinalizersOnExit(true)` 대신 `System.runFinalization()`를 호출하여 강제로 Finalization을 수행하는 방법을 설명하는 사람도 있고 이렇게하면 불안정하게 동작할 수 있으니 그냥 `System.exit()`만 호출하라는 사람도 있고... 어쨌든 개인적으로는 위 함수가 가장 적절하게 구성되어 있다고 생각한다. **단, 주의사항 한가지. 이 부분은 직접 테스트 해본 것은 아니나 두개 이상의 Activity가 떠 있는 상황에서 Process를 종료시키면 Process가 살아난다는 이야기도 있다.** 그런 이유가 아니더라도 Activity의 종료 프로세스를 제대로 동작시키는 것이 좋다는 생각으로 나는 아래와 같이 처리하고 있다.

```java
ActivityCompat.finishAffinity(this);
System.runFinalizersOnExit(true);
System.exit(0);
```

현재까지는 이 방법으로 이상없이 사용하고 있으나 서두에서 언급한 것처럼 충분한 테스트를 거친 내용들이 아니므로 사용시에는 유의하기 바란다.
