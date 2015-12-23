---
layout: post
title: "안드로이드 테마 정의시 parent를 지정하지 않을 경우 Error: Style Resource definition cycle 발생"
date: 2015-09-25 14:18:08 +0900
comments: true
categories: android
---
이번 포스팅은 정확하지 않은 정보일 확률이 높다. 하지만 비슷한 경우를 만나게되면 임시 해결 방법으론 도움이 될 것 같아 글을 남겨 본다.
이번에 작업하면서 발생한 문제를 해결하는 과정에서 이것저것 해보면서 알게된 부분을 정리해보려고 한다. 일단 문제를 만난 상황부터 이야기하자면 이렇다.

작업 중에 DialogTheme를 정의해서 사용할 일이 있었다. 그래서 다음과 같이 정의해서 사용중이었다. Theme가 무엇인지에 대해서는 http://developer.android.com/intl/ko/guide/topics/ui/themes.html 를 참고하자.

** values/styles.xml **

```XML
<style name="af_DialogTheme.Base">
    <item name="android:windowNoTitle">true</item>
    <item name="android:windowFullscreen">false</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:colorBackgroundCacheHint">@null</item>
    <item name="android:windowIsTranslucent">true</item>
</style>
<style name="af_DialogTheme" parent="af_DialogTheme.Base"/>
```

굳이 `af_DialogTheme.Base`를 정의하고 다시 `af_DialogTheme`에서 이를 상속받아 처리하는 것에는 이유가 있다. Theme에서 사용하는 속성들 또는 상황이 API 버전에 따라 다르기 때문이다. 예를 들어 내가 버전별로 다르게 사용한 style은 아래와 같다.

** values-v19/styles.xml **
```XML
<style name="af_DialogTheme" parent="af_DialogTheme.Base">
    <item name="android:windowTranslucentStatus">true</item>
</style>
```

** values-v21/styles.xml **
```XML
<style name="af_DialogTheme" parent="af_DialogTheme.Base">
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:windowTranslucentStatus">false</item>
</style>
```

위 처럼 일부 속성만 replace하려면 공통 부분을 부모 스타일로 정의하고 받아서 쓰도록 해야한다. 같은 테마 이름을 사용하게되면 대체 xml 문서(values-v19/styles.xml, values-v21/styles.xml)에서 정의된 속성을 반영하는게 아니라 통째로 덮어써서 공통 부분은 정의가 안된 것과 동일하게 처리된다. 이렇게 통째로 덮어쓰지 않고 부분만 변경되게 하기 위해 parent 속성을 사용하는 것이다.

여기까지가 문제가 되는 부분에 대한 설명이다. 위의 내용을 보고 문제가 될 수 있는 부분을 찾을 수 있겠는가? 이유를 안다면 아래의 내용을 볼 필요가 없다. 나는 몰랐기 때문에 당혹스러웠다.

이 상태로 빌드해서 테스트하면 아무 이상도 없고 예상대로 동작한다. 그런데 release를 위해 빌드를 하는 순간 아래의 에러를 만나게 된다.

```
Error:(11) Error: Style Resource definition cycle: AppThemeDialog => af_DialogTheme => af_DialogTheme.Base => af_DialogTheme [ResourceCycle]
    <style name="AppThemeDialog" parent="af_DialogTheme"/>
                                 ~~~~~~~~~~~~~~~~~~~~~~~
   Explanation for issues of type "ResourceCycle":
   There should be no cycles in resource definitions as this can lead to
   runtime exceptions.
```

당황스럽다. 분명 테스트시에는 한번도 본 적 없는 오류다. 내용을 보자. `ResourceCycle`에 관련된 문제로 보인다. 맨 위의 문장과 함께 보면 Resource의 순환참조라는 이야기로 보인다. 하지만 위의 코드들을 보면 알겠지만 순환참조라고 할만한 내용은 없다. 난 절대로 오류 메시지처럼 참조 시키지 않았다.

처음엔 이유를 몰라 어떻게 해야 할지 몰랐다. `af_DialogTheme.Base => af_DialogTheme`라고 나오는데 그렇게 지정하지 않았는데 왜 알아서 참조를 한다고 난리일까? 고민을 하던 중 옆에 있던 후배가 하는 말이 "저기 이름에 있는 . 때문에 그런것 아니냐?"라는 것이다. 난 말도 안된다고 했다. 어떻게 그렇게 해석 될 수 있느냐? 게다가 .Base라는 구문은 안드로이드 내부 테마들이 정의될 때 사용하던 네이밍 규칙을 따라 한 것인데 그럴리가 없다는 것이 내 생각이었다. 하지만 **결함의 발견은 절대 그럴리가 없다는 부분부터 시작해야 한다.**

결론은 후배의 말이 맞았다. name을 `af_DialogTheme.Base`에서 `af_DialogTheme_Base`로 변경하자 오류는 사라졌다. 아... 어의없다.
보다 확실히 하기 위해 아래와 같이 name을 둔 채로 parent를 추가했다. 당연히 상속받을 것은 없으므로 공백으로...

** values/styles.xml **
```XML
<style name="af_DialogTheme.Base" parent="">
    <item name="android:windowNoTitle">true</item>
```

이렇게 처리해도 오류는 사라졌다. 그럼 이제 경험에 의한 결론을 내려보자(서두에 이야기한 것 처럼 그냥 내가 추측하는 것이니 틀릴 확률이 높다는 것을 감안하고 보자).

> style 정의시 name에 .을 사용하고 parent가 지정되지 않았다면 . 앞부분의 name을 parent로 정의한 것으로 보고 상속을 시도한다.

결론적으로 내 의도는 .Base가 붙은 녀석이 부모가 되는 것을 원하고 네이밍한 것이 반대로 자식이 되어 순환참조를 발생시키게 한 것이다.

그런데 상황을 보자면 위에 정리한 내용이 맞다고 보아진다. 그런데 이상하다. 왜 release 모드에서만 오류가 나는가? 그래서 오류 부분을 조금 더 자세히 보니 `:app:lintVitalRelease` 영역에서 오류가 난다. 그렇다. [lint](https://ko.wikipedia.org/wiki/Lint) 오류다. 오류가 의심되는 코드를 검증하는 과정에서 오류를 발생시킨 것이다.

여기서 최종적인 나의 생각(추측)을 정리하겠다.

> 예전(구버전 안드로이드)에는 위의 설명대로 .을 기준으로한 theme(style) 상속의 개념이 사용되었기 때문에 lint에 추가되어 있었다. 그런데 시간이 지나면서 이 기능은 제거되고 parent라는 속성이 추가되었으나 lint에서는 검증 코드가 제외되지 않았다.

이렇게 생각하는 이유는 실제로 lint 영역에서만 오류가 나지 동작시에는 아무런 문제가 없다.

### 그래서 어떻게 하면 되나?

> style를 사용한 theme 정의시 parent가 없다면 name에 .을 사용하지 말거나 공백으로라도 parent 속성을 사용하자.

`Style Resource definition cycle` 오류를 만난다면 위의 글을 참고해서 해결에 도움이 되었으면 하는 바램이다. 나도 오늘 후배의 한마디가 아니었다면 아직도 헬게이트를 경험하고 있을지도 모른다.
