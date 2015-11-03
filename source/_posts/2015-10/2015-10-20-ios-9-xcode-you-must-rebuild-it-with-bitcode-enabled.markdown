---
layout: post
title: "Xcode 7 - You must rebuild it with bitcode enabled 오류 해결"
date: 2015-10-20 09:08:30 +0900
comments: true
categories: ios
---
Xcode 7에서 빌드시 아래와 같은 오류가 날 수 있다.

```
ld: '/Volumes/Data/work/ios/bang9/Pods/GoogleMaps/Frameworks/GoogleMaps.framework/GoogleMaps(GMSCachedTile.o)' does not contain bitcode. You must rebuild it with bitcode enabled (Xcode setting ENABLE_BITCODE), obtain an updated library from the vendor, or disable bitcode for this target. for architecture armv7
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

내용을 확인해 보니 Xcode 7부터는 [Bitcode](https://developer.apple.com/library/prerelease/watchos/documentation/IDEs/Conceptual/AppDistributionGuide/AppThinning/AppThinning.html#//apple_ref/doc/uid/TP40012582-CH35-SW2)가 기본적으로 enabled 되어 있다는 것이다.

[iOS9 출시에 따른 개발자 대응 방안](http://blog.kollus.com/?p=1252)에 보면 Bitcode에 대해 설명되어 있다.

> iOS9 에서 LLVM Compiler에서 Bitcode를 생성을 지원한다. Bitcode를 사용하는 경우 AppStore에서 필요한 경우에 해당 코드를 사용하여 다시 최적화 된 바이너리를 생성하여 End user에게 전송해 주는 역할을 담당한다.
> Xcode에서 Bitcode를 포함한 iOS 앱을 AppStore로 전송하면, AppStore 내에서 사용자의 디바이스에 따라 최적화된 바이너리를 다시 빌드하는 과정을 거친다. 따라서, Bitcode가 적용된 앱을 앱스토어로 전송한 경우 개발자는 추후 새롭게 출시되는 디바이스의 특성에 따라 다시 빌드하는 수고를 덜어줄 것으로 예상된다.

결론은 가장 쉽게 해결하는 방법은 Bitcode를 Disabled로 변경하면된다.

프로젝트를 선택한 후 Build Settings 탭에서 bitcode로 검색하면 해당 항목을 찾을 수 있다. 여기서 값을 NO로 변경하면 된다. 찾기가 어렵다면 위 링크에 스샷으로 설명해주고 있으니 참고 바란다. 그리고 혹시 예전에 생성했던 프로젝트라면 해당 설정이 없을 수 있다. 그렇다면 [iOS9 ENABLE_BITCODE 설정을 찾을 수 없을 때 강제 추가하기](http://theeye.pe.kr/archives/2501)를 참고해서 강제로 추가하면 된다.

그런데 나의 경우는 GoogleMaps에서 문제가 발생한 경우다. 그래서 Bitcode를 Enabled 상태로 문제를 해결하는 방법을 찾고 싶었다. 그래서 조금 더 찾아보니 Google SDK to 1.10.2+ 이상을 사용하면 된다는 내용을 찾았다. 하지만 내가 사용하던 버전은 1.10.3이었다. 그래도 혹시나 싶어 cocoapod에서 업데이트 했더니 1.10.4로 업데이트가 되었다. 그래서 다시 빌드 시도. 그런데 결과는 역시나 동일한 오류가 난다.

[gmaps-api-issues - Bitcode Build](https://code.google.com/p/gmaps-api-issues/issues/detail?id=8219)에 보면 관련된 이슈가 진행중이다. 이 문제는 해당 라이브러리에서 지원해야만 해결할 수 있는 문제로 구글에서 패치가 될 때까지는 Bitcode를 Disabled 상태로 사용할 수 밖에 없다. 하지만 곧 해결될 것이라고 생각한다.

