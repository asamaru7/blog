---
layout: post
title: "Xcode 7.1에서 Google Maps SDK 사용시 빌드가 되지 않는 결함"
date: 2015-11-02 16:57:18 +0900
comments: true
categories: ios
---
얼마전 iOS 앱 개발에 사용하던 xcode를 7.1로 업데이트 했다. 그런데 앱에서 사용중이던 Google Maps SDK가 빌드되지 못해 앱을 실행할 수가 없었다. 문제는 header 생성 부분인데 해결 방법을 찾지 못해 다시 7.0을 재설치해서 사용하고 있었다. 그렇게 지내던 중 오늘 갑자기 생각이 나서 다시 확인해 봤다. 다행히 그 사이에 Google에서 update를 내 놓았다. 이 문제가 수정된 버전은 1.10.5 버전이다. 그리고 관련된 issue는 [Issue 8524:	Bug: Running under Xcode 7 beta 6 with Google Maps SDK results in broken debugging.](https://code.google.com/p/gmaps-api-issues/issues/detail?id=8524&can=1&q=Could%20not%20build%20Objective-C%20module&colspec=ID%20Type%20Status%20Introduced%20Fixed%20Summary%20Stars%20ApiType%20Internal)이다.

오류 메시지는 `Include of non-modular header inside framework module 'GoogleMaps'`이다.

대략 아래의 이미지처럼 오류가 난다(이미지는 캡춰하기 귀찮아 인터넷에 있는 이미지를 가져왔다).

![오류](/img/2015-11-02-google-maps-sdk-with-xcode-7-dot-1-bug-1.png)

혹 xcode 7.1 사용시 이런 오류가 나온다면 Google Maps SDK를 1.10.5 이상으로 업데이트 후 빌드 해보기 바란다.

이 문제에 대한 원인은 처음 오류를 만났을 때 다른 사람들이 이야기하는 것을 봤었는데 정확한 내용이 기억이 나지 않는다. 대충 기억이 나는 것은 xcode가 7.1로 버전업 되면서 swift 모듈에 header 처리하는 부분이 변경되었다고 했던 것 같은데... 나중에라도 원인을 알게되면 다시 남기도록 하겠다.

Apple Developer Forums에서 나온 [Include of non-modular header inside framework module](https://forums.developer.apple.com/thread/23554) issue도 있다. 혹시 GoogleMaps가 아닌 모듈에서 동일한 오류가 난다면 참고.
