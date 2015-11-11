---
layout: post
title: "안드로이드 Crash Report 도구 : ACRA에서 Fabric(Crashlytics)으로의 전환"
date: 2015-11-11 20:33:16 +0900
comments: true
categories: ["android", "ios", "tip"]
---
지난 글 [ACRA : Please configure 'buildConfigClass' in your ACRA config 오류](/2015/10/01/android-acra-please-configure-buildconfigclass-in-your-acra-config/)와 [Android 6(API 23 : marshmallow) : Apache HTTP 클라이언트 제거](/2015/09/25/android-6-apache-http-client-removal/)에서 언급했던 것처럼 안드로이드 Crash Report 도구로 ACRA를 사용중이었다.
ACRA 사용중에 만난 오류를 해결하기 위해 시간을 들여서 원인을 찾고 개발자에게 전달해서 개선을 요청할 정도로 나름 애용하려던 도구였는데 오늘 [Fabric(Crashlytics)](https://fabric.io)으로 바꿔버렸다.

사실 처음부터 대체할 목적이 있었던 것은 아니었다. 안드로이드용으로 제작된 앱을 iOS용으로도 제작할 일이 있어 개발을 진행하던 중 안드로이드의 ACRA 같은 도구가 iOS에도 있을 것이라는 생각에 몇가지를 찾아보고 있었다. 그때 눈에 띄는 것이 [Crashlytics](https://try.crashlytics.com/) 였다([Crashlytics 소개 + Android Studio에서 적용하는 방법](https://gist.github.com/rino0601/018c7f22aeb23cf2e2a0)).

그런데 이 Crashlytics라는 서비스를 운영하는 회사가 트위터에 인수가 되었다([앱 충돌 리포트 서비스 Crashlytics, 트위터에 인수되다](http://besuccess.com/2013/01/28496/)). 그래서 조금 더 알아보니 트위터에서 [Fabric](https://fabric.io)이라는 것을 새로 내놓았다.

[Fabric](https://fabric.io)이 무엇인지에 대해서는 트위터 한글 블로그의 "[패브릭(Fabric)을 소개합니다.](https://blog.twitter.com/ko/2014/introducing-fabric-kr)"를 보면 잘 설명되어 있다.

> 패브릭(Fabric)은 앱 개발자들이 흔히 직면하는 안정성, 사용자 확보, 수익성, 사용자 인증의 이슈들>을 해결해 줄 세 가지의 모듈형 키트들로 이루어져 있습니다. 패브릭은 크래시리틱스(Crashlytics), 모펍(MoPub), 트위터 등의 서비스를 통합해 개발자들이 더 안정적인 앱을 만들도록 돕습니다. 패브릭은 앱 개발자들이 세계 최고의 모바일 애드 익스체인지(ad exchange)를 통해 수익을 확보할 수 있게 하며, 트위터 로그인 기능과 실시간 콘텐츠 스트림 기능을 통해 더 많은 사용자에 콘텐츠를 전달할 수 있게 하거나 더욱 간단히 사용자를 인증할 수 있도록 해줍니다.

나는 우선 최초 목적이었던 iOS를 위한 Crash Report 도구의 설치를 위해 xcode 프로젝트에 [Fabric](https://fabric.io)을 추가했다. 설치 과정은 복잡하지는 않으나 몇가지 설정할 부분들이 있어서 자칫 까다로워질 수 있지만 [Fabric](https://fabric.io)에서 관련 도구를 워낙에 잘 제공 해줘서 시키는대로 따라만 하면 큰 무리없이 적용할 수 있다. "기회가 되면 설치 과정을 글로 남길까?" 생각했었지만 설치 도구가 워낙 잘되어 있어 "굳이 내가 다시 설명할 필요가 있을까?"라는 생각이다. 그 정도로 잘 되어있다. 다만 기본 설치 후 Debug 모드에서는 로그 수집을 하지 않도록 설정하는 등의 몇가지 안내가 필요한 부분들이 있는데 이건 시간이되면 따로 글을 남기려고 한다. 사실 이 부분도 메뉴얼로 모두 제공되고 있으나 막상 찾으려니 귀찮은 것들이다.

결론적으로는 아주 만족스러웠다. Crash Report가 잘되는 것은 물론이고 Hook을 걸 수 있도록 하는 기능도 제공되고 있어서 기존에 ACRA에서 연결해 두었던 자체 로그 수집기로도 기존처럼 정보를 전달하는 것이 가능했다(정확히 이야기 하자면 기존과 동일한 내용을 전달하는 것은 아니고 오류 발생 이벤트만 전달된다). 그리고 [Fabric](https://fabric.io)에는 [Crashlytics](https://try.crashlytics.com/) 외에도 [Answers](https://answers.io/)라는 모듈도 함께 제공된다(사실 더 많은 것들이 있다). 이 모듈은 구글 어날리틱스 처럼 앱에 대한 이벤트를 수집하여 보고서를 제공해 준다. 결정적으로 이 모든 것이 무료.

그래서 안드로이드용 앱에서도 ACRA를 걷어내고 Fabric을 적용했다. 역시 아주 만족스럽다. ACRA에서 보내주는 무지막지한 Crash 로그 대신 잘 정리된 로그를 확인할 수 있게 되었다.

앞선 설명처럼 [Fabric](https://fabric.io)에는 여러가지 모듈들이 있는데 이들 중 일부는 각각 독립적인 서비스를 가지고 있다([Crashlytics](https://try.crashlytics.com/)와 [Answers](https://answers.io/) 처럼). 이 부분에 관련해서는 트위터 한글 블로그의 "[패브릭(Fabric)을 소개합니다.](https://blog.twitter.com/ko/2014/introducing-fabric-kr)"의 내용 마지막에 아래와 같이 안내 되어있다.

> 패브릭(Fabric)은 트위터만의 작품이 아닙니다. 패브릭(Fabric)이 가능하도록 키트(Kits)들의 관리, 설치, 업데이트에 관여하는 모든 SDK 벤더들이 만들어낸 것이라고 생각합니다. 당신이 SDK를 관리하는 사람이고, 트위터와 함께 일하고 싶다면 패브릭 파트너십 담당(partners@fabric.io)에 메일을 보내 주시길 바랍니다. 개발자 여러분들의 연락을 기다리고 있겠습니다.

따라서 각각의 서비스를 사용해도 무방할 것으로 보인다. 하지만 [Fabric](https://fabric.io)을 사용함으로써 통합 관리를 할 수 있으며 설치 과정이 아주 단순해진다.

**결론 : Crash Report 도구가 필요하다면, iOS와 Android 모두 한 곳에서 관리하고 싶다면, 사용자 이벤트 로깅도 하고 싶다면, [Fabric](https://fabric.io)을 적극 추천하고 싶다.**
