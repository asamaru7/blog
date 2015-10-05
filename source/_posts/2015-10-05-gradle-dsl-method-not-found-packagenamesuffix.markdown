---
layout: post
title: "Gradle DSL method not found: 'packageNameSuffix()' 오류 해결"
date: 2015-10-05 08:13:08 +0900
comments: true
categories: android
---
안드로이드에서 빌드시 packageName을 동적으로 변경하기 위해 packageNameSuffix를 사용하는 경우가 있다. 예를들어 배포된 앱과 개발중인 앱을 동시에 사용하기 위해 packageNameSuffix를 사용할 수 있다.

아래의 예시를 보자.

```
android {
    buildTypes {
        debug {
            packageNameSuffix '.debug'
            versionNameSuffix '-debug'
        }
    }
}
```

debug 모드에서 빌드할 경우에는 packageName 뒤에 `.debug`를 붙이도록 설정한 것이다. 이렇게 함으로써 release와 debug가 packageName이 달라져서 두개의 앱으로 인식되므로 모두를 설치할 수 있다.
이 방법을 모를때는 매번 앱을 지우고 새로 깔고... 귀찮은 작업을 반복하며 작업을 했었다.

그런데 이렇게 사용하면 아래의 경우를 만날 수 있다.


```
 Gradle sync failed: Gradle DSL method not found: 'packageNameSuffix()'
            Consult IDE log for more details (Help | Show Log)
```

이유는 packageNameSuffix라는 속성이 applicationIdSuffix로 변경되었기 때문이다. 관련 메뉴얼은 [ApplicationId versus PackageName](http://tools.android.com/tech-docs/new-build-system/applicationid-vs-packagename)에서 볼 수 있다.

그래서 아래와 같이 수정하면 정상적으로 사용이 가능하다.

```
android {
    buildTypes {
        debug {
            applicationIdSuffix '.debug'
            versionNameSuffix '-debug'
        }
    }
}
```