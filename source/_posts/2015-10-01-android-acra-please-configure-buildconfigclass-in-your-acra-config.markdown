---
layout: post
title: "ACRA : Please configure 'buildConfigClass' in your ACRA config 오류"
date: 2015-10-01 19:48:09 +0900
comments: true
categories: android
---
[Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거](/2015/09/25/android-6-apache-http-client-removal/) 포스트에서 언급했던 것처럼 개발 중인 앱에서 Crash Report를 위해 [ACRA](https://github.com/ACRA/acra)를 사용중이다. 아직 4.7.0으로 정식 버전업이 되지는 않았지만 4.7.0 RC1 버전이 maven에 올려져 있어서 적용해 보았다.
사실은 미리 적용할 예정은 없었으나 [Android Gradle 빌드 속도 높이기](/2015/09/29/android-gradle-builds-speed-up/)와 관련하여 Gradle을 2.4로 버전업 하면서 release 빌드 시에 다른 오류(setLatestEventInfo 함수가 제거됨)가 나타나서 어쩔 수 없이 버전업을 해야했다.

그런데 버전업을하고 나서 Crash 테스트를 하는 도중 또 다른 오류를 만났다. 기존에도 오류가 나고 있었는지 버전업 후의 문제인지는 확실치는 않다. 안드로이드 작업은 끝없는 오류 해결의 연속인 듯하다. 오류는 아래와 같다.

```java
E/ACRA: Not adding buildConfig to log. Class Not found : net.yourdomain.BuildConfig. Please configure 'buildConfigClass' in your ACRA config
```

우선 ACRA를 초기화하는 코드를 살펴보자. 당연하지만 실제 적용코드가 아닌 부분적으로 정리된 코드다.

```
ACRAConfiguration config = ACRA.getNewDefaultConfig(this);
config.setFormUri("http://dev.yourdomain.net/AppCrash");
ACRA.init(this, config); // The following line triggers the initialization of ACRA
```

@ReportsCrashes 어노테이션을 사용하지 않고 동적으로 초기화시켜주는 코드다. 실제로 Crash를 발생시키면 위에서 보여준 오류가 난다. 사실 이 문제는 원인을 확인한 결과 Proguard가 적용되었을 때만 오류가 발생한다. 아래의 ACRA 소스 코드의 일부를 보자.

**[CrashReportDataFactory.java](https://github.com/ACRA/acra/blob/master/src/main/java/org/acra/collector/CrashReportDataFactory.java)**

```java
private Class<?> getBuildConfigClass() throws ClassNotFoundException {
    final Class configuredBuildConfig = ACRA.getConfig().buildConfigClass();
    if ((configuredBuildConfig != null) && !configuredBuildConfig.equals(Object.class)) {
        // If set via annotations or programatically then it will have a real value,
        // otherwise it will be Object.class (annotation default) or null (explicit programmatic).
        return configuredBuildConfig;
    }

    final String className = context.getClass().getPackage().getName() + ".BuildConfig";
    try {
        return Class.forName(className);
    } catch (ClassNotFoundException e) {
        ACRA.log.e(LOG_TAG, "Not adding buildConfig to log. Class Not found : " + className + ". Please configure 'buildConfigClass' in your ACRA config");
        throw e;
    }
}
```

`final String className = context.getClass().getPackage().getName() + ".BuildConfig";` 이 부분을 보면 패키지명에 BuildConfig를 더해 Class를 찾고 있다. 이 부분이 문제다. Proguard에서 BuildConfig를 난독화해버려서 리플렉션으로 찾을 수 없는 것이다.
해결을 위한 아래의 코드를 보자.

```java
ACRAConfiguration config = ACRA.getNewDefaultConfig(this);
config.setBuildConfigClass(BuildConfig.class);
config.setFormUri("http://dev.yourdomain.net/AppCrash");
ACRA.init(this, config); // The following line triggers the initialization of ACRA
```

`config.setBuildConfigClass(BuildConfig.class);` 이 부분을 추가했다. ACRA 코드에서 보듯이 setBuildConfigClass로 직접 BuildConfig를 넘겨주면 패키지명으로 찾지 않는다. 따라서 Proguard가 적용되어도 문제가 없다.

___

이 오류는 이것으로 해결이 가능하다. 하지만 나는 지금 다른 문제로 다시 고군분투 중이다.
오류 발생시 HTTP/POST를 통해 오류 관련 정보를 전송하도록 사용중이었다. 그런데 앞서 이야기 한것과 같이 이번에 버전업이 되면서 HTTP 접속 관련 부분이 변경되었다. 여기에 문제가 있다.

```java
...
urlConnection.setChunkedStreamingMode(0);
...
```

위 부분은 ACRA에서 HTTP 전송시 사용하는 HttpRequest.java 의 일부분이다. `setChunkedStreamingMode`에 대해서는 여기서 설명하기엔 너무 길고 간단히 요약하자면 chunked 상태로 데이터가 전송된다.
그런데 이 상태로 전송되면 현재 내가 사용하고 있는 서버에서 POST 값이 모두 비어 있다. request의 body가 수신되지 못하는 것이다. 이 부분은 나의 환경인 php-fpm가 proxy로 연결되어 있는 것과 관련이 있는 것으로 보인다. 이 부분에 대해서는 여러가지로 시도해 보았으나 해결이 되지 않았고 일단은 몇개의 클래스를 재정의해서 문제를 막아 놓았다. 그리고 관련해서는 ACRA에 Issue로 등록해 두었다. 개선이 될런지는 미지수인데 안된다면 앞으로 사용상에 걸림돌이 될 것 같다. 이 부분에 관련된 해결책이 나온다면 다시 포스팅을 하도록 하겠다.
