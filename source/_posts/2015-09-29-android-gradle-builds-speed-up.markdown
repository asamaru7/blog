---
layout: post
title: "Android Gradle 빌드 속도 높이기"
date: 2015-09-29 09:26:25 +0900
comments: true
categories: android
---

안드로이드 개발을 하면서 여러가지 불만이 있지만 그중에 가장 맘에 들지않는 것 중 하나가 빌드 속도이다. 프로젝트의 규모에 따라 다르겠지만 xcode와의 빌드 시간을 비교하면 전체 빌드의 시간은 비슷한 것 같으나 수시로 하게되는 빌드는 안드로이드 스튜디오가 훨씬 느리게 느껴진다. 안드로이드 개발시 빌드에 사용되는 Gradle은 많은 유연성을 제공하지만 빌드에 많은 프로세스 비용이 든다는 것이 단점이다. 그래서 빌드 속도를 높일 수 있는 방법을 찾아서 적용해 보았다.

그리고 빌드 시간에 크게 영향을 주는 것 중에는 proguard와 multidex가 포함된다. proguard는 코드 최적화/난독화 등을 위한 처리이며 multidex는 65K이상의 메소드를 사용할 경우에 대한 대응책으로 사용되며 자세한 내용은 [Building Apps with Over 65K Methods](https://developer.android.com/intl/ko/tools/building/multidex.html)에서 참고하면 된다. 메소드 수가 어떻게하면 65K를 넘나 싶을 수 있지만 금방 넘어선다. 라이브러리를 막 추가하다보면 금방 문제를 만나게 된다(proguard 등을 통해 메소드 수를 줄일 수 있다). 이 글에서도 나와있는 것이지만 빌드 속도 문제를 떠나서도 최대한 multidex를 사용하는 상황을 만들지 않는 것이 좋다. 그리고 나는 proguard를 항상 켜둔 상태도 개발을 하는 편이다. 프로젝트 막판에 proguard를 적용하게되면 proguard로 인한 여러가지 문제를 만날 수 있기 때문에 충돌을 미리 발견하기 위해서다. 하지만 이렇게하다보면 빌드 속도가 너무 떨어진다. 그래서 켰다가 껐다가 하긴하는데 너무 귀찮다.

그럼 본격적으로 설정을 시작해보자.

## 1. gradle.properties 파일을 변경

프로젝트 Root에 있는 gradle.properties을 편집한다. 기존에 파일이 없다면 추가한다. 여기에는 gradle 빌드 할 때 인수를 설정할 수 있다.
한가지 더 알려주자면 프로젝트별로 설정하는 것외에도 모든 프로젝트에 설정을 추가할 수도 있다. 해당 파일의 경로는 OSX 기준으로 ```~/.gradle/gradle.properties``` 이다. 윈도우나 리눅스도 비슷한 경로에 있을 것으로 생각된다.

**gradle.properties**

```ini
# Project-wide Gradle settings.
# IDE (eg Android Studio) users :
# Settings specified in this file will override any Gradle settings
# configured through the IDE.
# For more details on how to configure your build environment visit
# http : // www.gradle.org/docs/current/userguide/build_environment.html
# The Gradle daemon aims to improve the startup and execution time of Gradle.
# When set to true the Gradle daemon is to run the build.
# TODO : disable daemon on CI, Since Builds should BE clean and Reliable on servers
org.gradle.daemon = true

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value : -Xmx10248m -XX : MaxPermSize = 256M
org.gradle.jvmargs = -Xmx2048m -XX : MaxPermSize = 512m -XX + HeapDumpOnOutOfMemoryError -Dfile.encoding = UTF-8

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec : decoupled_projects
org.gradle.parallel = true

# Enables new incubating mode that makes Gradle selective when configuring projects.
# Only relevant projects are configured which results in faster builds for large multi-projects.
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html #sec : configuration_on_demand
org.gradle.configureondemand = true
```

위 설정에 대한 간략한 설명은 아래와 같다.

* **org.gradle.daemon** : 데몬 프로세스를 사용할지 여부 설정한다. true 설정시 gradle을 daemon 모드로 실행하여 빌드시 gradle을 다시 실행하는 시간을 줄여준다.
* **org.gradle.jvmargs** : 실행시 JVM 인수로 메모리를 설정을 늘려 메모리 부족으로 인한 속도저하를 막는 것이 목적이다. 따라서 적절한 양의 메모리를 할당해 주면 된다.
* **org.gradle.parallel** : gradle 병렬 빌드 모드를 설정한다. 여러 프로젝트를 빌드 할 때 효과가 있다.
* **org.gradle.configureondemand** : 관련 프로젝트가 있다면 필요한 부분만 빌드 설정한다.

크게 성능이 향상되는 것 같지는 않지만 조금의 성능 향상은 있는 것 같다. 사실 다음에 소개할 gradle 버전 업이 훨씬 체감 성능 향상에 도움을 준다.

## 2. Android Studio 1.3 / Gradle 2.4 이상 사용

Android Studio 1.3 / Gradle 2.4 이상으로 버전업되면서 대폭 성능 향상이 있었다. 실제로 나의 경우엔 상당한 속도 향상이 있었다. 그래도 proguard를 적용하게되면 느리긴 마찬가지긴 하다.
구글의 설명을 보려면 [Google I/O 2015 - What's New in Android Development Tools](https://www.youtube.com/watch?t=502&v=f7ihSQ44WO0)을 참고하면 된다. 단, 주의할 것은 Android Studio 1.3 이상을 사용한다고 Gradle 2.4 이상을 무조건 사용하는 것은 아니라는 것이다. 신규 프로젝트가 아니어서 그런지 나의 프로젝트에서는 2.2.1을 그대로 사용하고 있었다(File > Project Structure > Project > Gradle version에서 2.4로 변경함으로써 적용할 수 있다).

## 3. gradle를 오프라인 모드로 변경

다른 사람들은 이 방법이 아주 효과적이었다고 하는데 나의 경우는 크게 차이가 나지 않았다(proguard로 인한 속도 저하라서 이 방법에 큰 도움이 되지 않았던 것 같다). 어쨌든 이 설정을 적용하면 gradle에서 매번 최신 버전을 확인하러가는 것을 생략 해 준다. 단, 신규 dependency를 추가하거나 변경하는 경우는 이 설정을 해제해야 한다. 약간은 귀찮을 수 있지만 dependency 변경은 크게 자주 발생하는 경우는 아니므로 문제되지 않을 것으로 생각된다.

![Offline work](/img/2015-09-29-android-gradle-builds-speed-up-1.png)
Android Studio> Preferences> Gradle 의 Offline work에 체크.

## 4. [Speeding up Gradle builds](http://kevinpelgrims.com/blog/2015/06/11/speeding-up-your-gradle-builds/)

[Speeding up Gradle builds](http://kevinpelgrims.com/blog/2015/06/11/speeding-up-your-gradle-builds/)에서는 몇가지 방법을 더 안내하고 있다. 간략하게 요약하면 아래와 같다(위의 설명들과 유사한 부분도 많다). 상세한 설명은 위 링크를 참조하기 바란다.

### Maven Central vs. JCenter

mavenCentral() 대신 jcenter()를 사용해라.

### Get the latest version of Gradle

최신 버전의 Gradle을 사용하라.

### Gradle properties

아래의 Gradle properties를 적용하라(위의 설명이 더 상세하다).
```ini
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.jvmargs=-Xms256m -Xmx1024m
```

### How to use Gradle properties

Gradle properties를 프로젝트별로 설정하기보다 전역으로 설정하라.

### 다중 모듈 빌드

다중 모뮬을 사용하는 경우에 속도 향상 방법이 안내되어 있으니 필요한 경우에 원본글에 가서 참조 바란다.