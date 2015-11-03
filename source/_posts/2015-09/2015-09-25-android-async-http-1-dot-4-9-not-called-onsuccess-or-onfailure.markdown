---
layout: post
title: "Android Asynchronous Http Client(android-async-http) 1.4.9 사용시 Proguard를 적용하면 onSuccess 또는 onFailure이 호출되지 않는 문제 해결"
date: 2015-09-25 12:10:09 +0900
comments: true
categories: android
---
안드로이드 앱 개발시 사용하던 [android-async-http](https://github.com/loopj/android-async-http)가 최근 1.4.9 버전으로 버전업되었다. 1.4.8 이하 버전을 사용할 경우 이전에 포스팅한 [Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거](/2015/09/25/android-6-apache-http-client-removal/)와 관련된 문제가 있다.

그런데 나는 이 1.4.9 버전을 사용하면서 다른 문제가 생겼다. 빌드에서 오류나 경고는 전혀 나타나지 않지만 URL 호출을 하면 onStart, onProgress까지는 들어오는데 onSuccess, onFailure를 호출해 주지 않았다. 그런데 이 현상이 proguard를 적용할 때만 발생한다는 것이다. 정밀하게 테스트해보지 않아 정확한 원인을 찾지는 못했지만 대략적인 상황을 보면 proguard에 의해 난독화 처리되는 부분이 문제로 보인다(그런데 실제로 내부 소스를 살펴보면 reflection 등을 사용하거나해서 난독화에 영향을 받을 만한 부분을 찾지 못했다).

우선 내가 사용했던 proguard의 설정 중 영향을 줄만한 부분은 다음과 같다. 나머지는 대부분 keep 등의 설정으로 [android-async-http](https://github.com/loopj/android-async-http)에 영향을 줄 만한 부분은 없다.

```
-optimizationpasses 5
-repackageclasses ''
-allowaccessmodification
-overloadaggressively
-verbose
```

사실 이 문제에 대해서 검색해보면 다른 이야기들이 많다. 대부분 호출이 되지 않는다는 질문을 하는 사람들의 경우는 onSuccess, onFailure의 오버로딩에 관련된 문제이다. 실제로 android-async-http는 ResponseHandler에 따라 여러 개의 onSuccess, onFailure 함수들을 가지고 있다. 이 함수들은 반환되는 데이터의 형태에 따라 다른 함수를 호출해주도록 되어있다. 이 부분은 편리하긴하나 개인적으론 조금 꺼려지는 형태다. 질문이 많이 올라오는 것처럼 반환 형태에 맞는 함수를 구현하는 것을 누락시킬 수 있기 때문이다. 어쨌든 나의 경우는 이에 해당하지 않았다. 확인을 위해 라이브러리 소스를 일부 수정해서 테스트 했으나 그 전단계까지도 들어오지 않았다.

이 문제는 proguard를 적용했을 때만 발생하는 문제였으므로 아래와 같이 proguard에 추가해주면 간단히 해결된다.

```
-keep class com.loopj.android.http.** { *; }
-keep interface com.loopj.android.** { *; }
```

그런데 개인적으로 이 해결법은 어떤 것이 문제인지 확인하지도 못했을 뿐아니라 문제를 해결하기 위해 통째로 proguard에서 제외하는 것이 맘에들지 않았다. 그래서 수십번의 빌드를 통해 어느 클래스가 문제를 일으키는지 찾아냈다. 아.. 인간 승리다. 수십여개의 클래스들을 넣어보고 빼보고...

결론은 아래의 코드를 proguard에 추가하면 문제가 해결된다.

```
-keep class com.loopj.android.http.HttpGet { *; }
```

대충 소스를 보니 HttpGet는 이번에 Apache HTTP 클라이언트가 제거되면서 이를 대체하기 위한 라이브러리를 교체하면서 추가된 클래스로 보인다. 그런데 소스를 봐도 이게 왜 proguard에 영향을 받는지 잘 모르겠지만 위의 코드를 넣음으로써 해결이 되는 것은 확인했다. 더 자세히 코드를 추적해 간다면 원인을 찾을 수 있을지도 모르지만 굳이 거기까지 내가할 필요는 없다고 보고 github에 이슈를 등록하려고 한다. 해당 개발자들이 다음버전에 문제를 해결해 주기를 바라며...

## UPDATE - 2015-10-15

오늘 사용자에게서 오류가 보고 되었다. 문제는 파일업로드가 되지 않는다는 것인데 문제의 원인은 위 글의 내용과 동일하다. 정확히는 안드로이드 버전 문제도 포함된다. 하위 버전의 안드로이드에서는 위의 설정만으로는 해결이 되지 않았던 것이다. 결론은 아래의 내용을 proguard에 대체해서 넣어야 한다는 것. 상황적으로 봤을 때 내가 사용한 범위를 벗어나면 proguard와 충돌하는 부분이 더 있을 수 있을 것 같다(하지만 지금 내가 다 찾기엔 무리이므로 android-async-http 개발자분들에게 넘긴다).

```
-keep class cz.msebera.android.httpclient.HttpResponse { *; }
-keep class com.loopj.android.http.HttpGet { *; }
-keep class com.loopj.android.http.HttpDelete { *; }
```
