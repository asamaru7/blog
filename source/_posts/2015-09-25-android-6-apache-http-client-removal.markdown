---
layout: post
title: "Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거"
date: 2015-09-25 13:47:37 +0900
comments: true
categories: android
---
지난 포스팅 [Android 6(API 23)의 getColor() deprecated 대응 + getDrawable() deprecated](/2015/08/28/android-getcolor-getdrawable-deprecated/)에서 잠깐 언급했던 [Apache HTTP 클라이언트 제거](https://developer.android.com/intl/ko/preview/behavior-changes.html#behavior-apache-http-client)에 대해 이야기하고자 한다.

우선 안드로이드에 안내하고 있는 원문은 아래와 같다.

* 영문 : [Apache HTTP Client Removal](https://developer.android.com/preview/behavior-changes.html#behavior-apache-http-client)
* 한글 : [Apache HTTP 클라이언트 제거](https://developer.android.com/intl/ko/preview/behavior-changes.html#behavior-apache-http-client)

한글 문서의 내용은 아래와 같다.

> Apache HTTP 클라이언트에 대한 지원을 제거합니다. 앱이 이 클라이언트를 사용하고 Android 2.3(API 레벨 9) 이상을 대상으로 하는 경우, HttpURLConnection 클래스를 대신 사용하세요. 이는 투명한 압축과 응답 캐싱을 통해 네트워크 사용량을 줄이고 전력 소모를 최소화하기 때문에 API가 더 효율적입니다. Apache HTTP API를 계속 사용하려면 우선 다음과 같은 컴파일-시간 종속성을 build.gradle 파일에서 선언해야 합니다.
>```gradle
android {
    useLibrary 'org.apache.http.legacy'
}
```

이 부분이 제거되면서 문제가 되는 부분은 위의 안내와 같이 gradle에 임시 코드를 넣음으로써 해결이 가능하다. 하지만 제거 과정이 여러가지 문제를 일으켰다. 사실 안드로이드에서는 해당 기능을 Deprecated하고 대체  기능의 사용을 권장하고 있었으나 이를 사용하는 오픈소스 라이브러리들이 미리 대응을 하지 않았던 것이 문제가 되었다. 나의 경우는 [ACRA](https://github.com/ACRA/acra)와 [Android Asynchronous Http Client](http://loopj.com/android-async-http/)가 해당 기능을 사용해서 구현되어 있어서 ```org.apache.http.legacy```를 통해 급한 문제들은 해결했었다.

현재 기준으로 [Android Asynchronous Http Client](http://loopj.com/android-async-http/)는 1.4.9로 버전업 되면서 Http에 관련된 부분을 대체 라이브러리로 교체함으로써 문제가 해결되었고 [ACRA](https://github.com/ACRA/acra)의 경우는 4.6.2로 버전 기준으로 처리가 되었다고 어디서 본것 같았는데 실제로는 빌드 과정에서 오류가 발생했다. 그래서 다시 알아보니 4.7.0 버전에서 HtttpUrlConnection를 사용함으로써 Android M (6.0)을 정식 지원한다고 안내되어 있다. 하지만 아직 RC2로 정식 버전업이 되지 않았다. 나의 경우는 조금만 더 기다리면 useLibrary 'org.apache.http.legacy'를 사용하지 않아도 될 것으로 예상된다.

사실 [Android Asynchronous Http Client](http://loopj.com/android-async-http/)도 현재 버전에서는 문제가 있다. 공식 사이트에서는 해당 현상에 대한 이야기는 없으나 나의 경우엔 proguard 적용시 완료 callback이 호출되지 않는 문제가 있었다. 관련해서는 [Android Asynchronous Http Client(android-async-http) 1.4.9 사용시 Proguard를 적용하면 onSuccess 또는 onFailure이 호출되지 않는 문제 해결](/2015/09/25/android-async-http-1-dot-4-9-not-called-onsuccess-or-onfailure/)에 별도로 포스팅한다.

어쨌든 이 문제는 시간이 지나면서 오픈 소스들이 대응을 시작하면 대부분 해결될 것으로 생각된다.