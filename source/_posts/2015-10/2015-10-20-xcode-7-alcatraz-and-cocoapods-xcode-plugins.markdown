---
layout: post
title: "xcode 7 : Alcatraz 와 CocoaPods Xcode plugins"
date: 2015-10-20 20:17:02 +0900
comments: true
categories: ios
---

[CocoaPods 사용법](/2015/08/28/cocoapods-usage/)에서 CocoaPods를 설치하고 사용하는 법에 대해 간단하게 안내했었다. 오늘은 이 CocoaPods을 XCode에서 조금이나마 편하게 쓰기 위한 플러그인을 소개 하려고 한다. 덤으로 [Alcatraz](http://alcatraz.io/)라고하는 Xcode용 패키지 메니저도 함께 소개한다.

우선 [Alcatraz](http://alcatraz.io/) 부터 소개하려고 한다. CocoaPods Xcode plugins을 직접 설치하는 방법도 있으나 Alcatraz를 사용하면 더 쉽게 할 수 있기 때문이다.

## Alcatraz

공식 사이트에는 **The package manager for Xcode** 라고 소개하고 있다. 말그대로 Xcode를 위한 패키지 매니저로 여러가지 플러그인, Color 테마, 템플릿들을 바로 설치할 수 있도록 도와준다.

### 설치

공식 사이트에 안내되어 있는대로 아래의 명령을 실행하는 것으로 설치가 완료된다.

```bash
$ curl -fsSL https://raw.githubusercontent.com/supermarin/Alcatraz/deploy/Scripts/install.sh | sh
```

 설치후 Xcode는 재시작 해주면 아래와 같은 화면이 나온다.

![Alcatraz](/img/2015-10-20-xcode-7-alcatraz-and-cocoapods-xcode-plugins-1.png)

설치한 플러그인을 load 할 것인지 물어본다. 당연히 "Load Bundle"을 해주면 이제부터 사용 가능하다. Xcode의 Window 메뉴에 보면 아래와 같이 "Package Manager"라는 메뉴가 추가되어 있다.

![Alcatraz](/img/2015-10-20-xcode-7-alcatraz-and-cocoapods-xcode-plugins-2.png)

## CocoaPods Xcode plugins 설치

Alcatraz에서 바로 설치 가능한 CocoaPods 플러그인은 현재 2가지가 있는 것으로 보이는데 그 중 [cocoapods-xcode-plugin](https://github.com/kattrali/cocoapods-xcode-plugin)를 먼저 설치해 보자. 사이트에 보면 설치 방법이 나와 있는데 당연히 Alcatraz를 통해 설치하는 것이 쉽다.

"Window > Package Manager" 메뉴를 실행하면 아래와 같은 화면이 나온다. 여기서 cocoapods로 검색하면 두가지의 플러그인이 보인다.

![Alcatraz](/img/2015-10-20-xcode-7-alcatraz-and-cocoapods-xcode-plugins-3.png)

이 중에서 위에 CocoaPods를 먼저 설치해 보자. 그냥 "INSTALL"이라고 되어 있는 버튼을 누르면 설치가 완료된다. 그리고 Xcode를 재시작하면 다시 아래와 같은 화면이 나온다. 당연히 "Load Bundle"을 선택한다.

![Alcatraz](/img/2015-10-20-xcode-7-alcatraz-and-cocoapods-xcode-plugins-4.png)

이제는 플러그인이 설치가 완료되었기 때문에 "Product > CocoaPods" 메뉴를 볼 수 있다. 이 메뉴를 열어보면 아래와 같은 화면이 나온다. 여기서 유의할 점은 GEM_PATH를 자신의 환경에 맞게 바꿔야 한다는 점이다. 기본은 "/usr/bin"인 것 같은데 나의 경우는 "/usr/local/bin"에 있어서 지정을 했다. 경로를 모른다면 `which pod`라는 명령을 shell에서 실행해보면 확인 할 수 있다.

![Alcatraz](/img/2015-10-20-xcode-7-alcatraz-and-cocoapods-xcode-plugins-5.png)


다음은 [CocoaPodUI](https://github.com/Galeas/CocoaPodUI) 플러그인이다. 설치 과정은 위의 플러그인 설치 과정과 동일하다. 그런데 문제는 현재 시점에서 확인해보니 정상적인 설치가 되지 않는다. Xcode 7과의 호환성 문제인지 플러그인은 정상 설치가 된 것으로 나오는데 설치 경로에 가보면 폴더가 비어 있다. 스샷만 보면 이 플러그인이 기능이 더 다양해 보이는데 사용을 해보지 못해 아쉽다.

하지만 [cocoapods-xcode-plugin](https://github.com/kattrali/cocoapods-xcode-plugin)만 사용하더라도 기존 보다는 편하다(굳이 따로 shell을 열지 않아도 되니).