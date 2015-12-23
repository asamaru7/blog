---
layout: post
title: "Android : is not translated in ... Lint Error 해결"
date: 2015-11-05 14:27:23 +0900
comments: true
categories: android
---

안드로이드에서 배포를 위한 빌드시에 아래와 같은 오류가 발생하는 경우가 있다. 상황에 따라 언어의 종류(en)는 다를 수 있다.

```
Error:(65) Error: "..." is not translated in "en" (English) [MissingTranslation]
```

이 오류는 말그대로 다국어 지원에 대한 처리가 제대로 되어 있지 않다는 오류이다. 일반적으로 다국어 지원을 위한 별도의 처리를 한적이 없다면 이 오류는 발생하지 않는 것이 당연하다.
하지만 이번에 이 오류를 만나고 찾아보니 많은 개발자들이 이 문제를 겪는 것 같다. 사실 나는 다국어 지원에 관련된 별도의 처리를 한 상황이었으므로 이 오류를 만나는 것이 당연한 상황이었다.
어쨌든 인터넷에 찾아보면 대부분 다음과 같이 해결법을 제시하고 있다.

* Lint 관련 설정은 이클립스 메뉴의 Window - Preference - Android - Lint 에서 변경할 수 있는데요..  여기서 MissingTranslation 항목을 찾아 Severity를 warning으로 변경하면 됩니다.
* [Android Studio "is not translated in "en" (English) [MissingTranslation]" 오류 해결하기](http://mytalkhome.tistory.com/816)

이 방법은 말그대로 제대로 처리되지 않은 부분을 오류에서 경고로 변경하여 빌드를 수행하는 것으로 좋지 못한 방법이다. 게다가 나의 경우는 OSX라서 그런지 안드로이드 스튜디오의 버전 때문인지 위치와 명칭이 많이 달랐다.

유사하지만 다른 방법도 있다. build.gradle에서 lint를 제외하는 것이다. [gradle build fails on lint task](http://stackoverflow.com/questions/20699147/gradle-build-fails-on-lint-task)

```
android {
  lintOptions {
      checkReleaseBuilds false
  }
}
```

그리고 또 다른 방법 한가지. [MissingTranslation for default language ( “…” is not translated in “en”)](http://stackoverflow.com/questions/28106875/missingtranslation-for-default-language-is-not-translated-in-en)
이 방법은 Strings.xml에서 locale을 아예 미리 입력해 버리는 것이다. 위 오류에 맞추어 en이라고 했지만 자신의 상황에 맞게 입력해야 한다.

```xml
<resources
    xmlns:tools="http://schemas.android.com/tools"
    tools:locale="en">
```

당연히 문제의 원인을 정확히 파악하여 해결하는 것이 가장 좋은 방법이다.
당장 급하고 원인을 찾지 못하겠다면 위의 방법들을 쓸 수도 있겠지만 계속 저렇게 사용하는 것은 권장하고 싶지는 않다.

이제부터는 내가 문제를 만난 상황이다. 사실 나 또한 다국어를 지원할 필요가 있었던 것은 아니다. 다만 사용한 라이브러리 중 하나가 다국어를 지원하고 있었다.
따라서 한국어 부분은 `values-ko/strings.xml`파일로 분리되어서 처리되고 있었다. 이 상황에서 내가 필요한 것은 설정된 문장의 일부를 변경하는 것이었다.
그래서 내 프로젝트의 `values/strings.xml`에 필요한 문장들을 재정의 했다. 오류는 나지 않지만 적용되지 않는다. 다시 내 프로젝트에도 `values-ko/strings.xml` 파일을 만들고 필요한 부분을 재정의 했다.
여기서부터 문제의 시작이다. 아래의 오류가 발생한다.

```
Error:(65) Error: "..." is not translated in "ko"
```

`values-ko/strings.xml` 파일에 모든 내용을 넣지 않고 필요한 부분만 넣었으므로 나머지 부분이 번역되지 않았다고 오류가 나는 것이다. 간단한 해결 방법은 `values-ko/strings.xml` 파일에 `values/strings.xml`의 내용을 모두 복사해 넣어준다. 그런데 이 방법은 싫다. 둘다 한국어인데 굳이 두군데를 관리하고 싶지 않다. 이런 경우라면 아래와 같이 `tools:ignore="MissingTranslation"`를 사용해서 문제를 해결할 수 있다.

**Strings.xml**

```xml
<resources
    xmlns:tools="http://schemas.android.com/tools"
    tools:ignore="MissingTranslation">
```

명확히 이 영역은 다국어 지원이 필요하지 않은 이므로 명시적으로 번역 누락을 무시하도록 하는 것이다. 어떻게 보면 상기 설명했던 오류를 무시하는 것과 같아 보일 수 있으나 이 방법은 무시할 범위를 명확히 인지하고 해당 영역만 필요에 의해 무시하도록 했다는 것이다.
단, 한가지 추가 작업이 필요하다. `values-ko/strings.xml` 파일에서 재정의 했던 항목들을 `values/strings.xml`에도 넣어주어야 한다는 것이다. 안그러면 아래와 같은 오류가 난다.

```
Error:(3) Error: "XXX" is translated here but not found in default locale [ExtraTranslation]
```

사실 불편함이 생기는 부분이지만 앞서 설명처럼 반대로 모두를 두군데서 관리하는 것보다 필요한 몇줄만 별도 관리하는 것을 선택했다.

**결론적으로 선택은 자유다. 위 방법들 중 필요에 맞게 선택해서 사용하면 되겠다.**
