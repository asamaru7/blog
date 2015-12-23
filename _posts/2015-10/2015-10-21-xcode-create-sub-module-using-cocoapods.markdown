---
layout: post
title: "Xcode에서 CocoaPods를 이용해 sub module 만들기"
date: 2015-10-21 11:23:33 +0900
comments: true
categories: ios
---
이번엔 Xcode로 앱 제작시 Sub Module을 만드는 방법을 설명하고자 한다.

그전에 우선 어떤 경우에 Sub Module을 사용하려고 하는지 부터 이야기를 해야 할 듯하다. 나의 경우는 여러 프로젝트에서 공통적으로 사용 할만한 유틸성 클래스들을 주로 묶어서 별도 모듈을 만들어 사용한다. 이렇게하면 비슷한 작업의 반복을 줄일 수 있고  기능도 통합적으로 관리할 수 있어 유지보수가 편하다. 이것은 예를들어 설명한 것일뿐 여러가지 용도로 사용될 수 있다.

Android Studio의 경우 Module을 추가하고 gradle을 설정함으로써 간단하게 서브 모듈을 만들 수 있다. 그런데 Xcode에서는 그렇게 쉬운 방법을 찾질 못했다. 당연히 방법이 있는데 내가 못 찾은 것일 수 있다. 내가 찾아본 방법은 대부분 Framework 프로젝트를 만들어서 사용할 프로젝트에서 추가해서 사용하는 방법들이었다. 그런데 이 방법들은 초기 설정 과정이 다소 복잡하고 Sub Module의 소스를 수정하려면 따로 build를 해서 넣어야 하는 불편함이 있었다.

그래서 여러가지 글들을 찾아 다니다가 [CocoaPods: Working With Internal Pods Without Hassle](http://albertodebortoli.github.io/blog/2014/03/11/cocoapods-working-with-internal-pods/)을 찾았다. 여기서는 [CocoaPods](https://cocoapods.org/)를 이용해서 Internal Pods를 만들어 모듈을 적용하는 방법을 설명하고 있다. 내가 찾던 것과 가장 유사한 방법으로 바로 적용해 봤다. 단, 이 글에서 설명하는 것 중 CocoaPods Repository를 설정하는 과정은 필요하지 않아 제외했다(사실 귀찮음이 가장 큰 이유다). 하지만 모듈의 버전을 관리하며 체계적으로 적용할 필요가 있다면 CocoaPods Repository를 만들어 관리하는 것을 권장한다.

본격적으로 설명에 앞서 이 방법을 사용할 때의 장점에 대해 간략히 설명하고자 한다.

* Sub Module과 메인 프로젝트를 하나의 Xcode에서 작업 가능하다.
* Sub Module의 소스 변경이 있어도 별도로 빌드할 필요가 없다(메인 프로젝트 빌드에 바로 반용된다).
* Sub Module과 메인 프로젝트의 형상 관리는 각각 적용된다.

이제부터 위 글에서 설명하는 내용을 보고 내가 적용한 방법을 설명하겠다.

## 환경

일단 내가 설명하기 위해 작업한 환경은 아래와 같다. 하지만 꼭 아래 환경이 맞춰져야하는 것은 아니다. Xcode의 기능을 직접적으로 사용한다기 보다 [CocoaPods](https://cocoapods.org/)에 의해서 대부분 처리되기 때문이다.

* OSX 10.11
* Xcode 7
* CocoaPods 0.39.0
* Swift
* iOS 8 (Deploy Target)
* Git

## Sub Module

이제부터 본격적으로 Sub Module을 만드는 과정을 살펴보자.

### CocoaPods / Git 설치

당연히 이미 설치되어 있다면 다시 설치할 필요는 없다.

CocoaPods 설치는 [CocoaPods 사용법](/2015/08/28/cocoapods-usage/)에서 간단히 안내했던 내용이지만 아주 간단하다.

```bash
$ [sudo] gem install cocoapods
$ pod setup
```

Git는 [Git Downloads](http://git-scm.com/download)에서 자신의 환경에 맞는 설치 파일을 다운받아 간단히 설치 가능하다. 그리고 Git는 submodule을 사용해서 프로젝트와 Sub Module을 연결하고 함께 형상 관리를 하기 위한 것으로 SVN과 같은 다른 형상 관리 도구를 사용한다면 그것을 그대로 사용해도 된다. 다만 아래의 설명에서 Git 처리 부분을 해당 형상 관리 도구에 맞추어 적용하면 된다(형상 관리를 하지 않겠다면 하지 않아도 된다. 하지만 권장하지는 않는다).

### Xcode 프로젝트 만들기

이 부분은 특별히 설정하지 않아도 될 듯하다. 자신의 필요에 맞는 프로젝트를 만들거나 기존의 프로젝트를 그대로 사용해도 무방하다.
다만 신규로 개설했다면 git repository에 등록하자. 앞서 설명과 마찬가지로 SVN이라면 SVN에 등록해도 된다.
나의 경우는 [gitlab.com](https://gitlab.com/)을 사용중이라 여기에 맞춰 예를들면 아래와 같은 과정을 거친다.

* gitlab에서 신규 프로젝트 개설
* 생성한 프로젝트를 아래와 같이 git에 연결한다.

```bash
$ cd {프로젝트명}
$ git init
$ git remote add origin https://gitlab.com/{사용자}/{프로젝트명}.git
$ git add .
$ git commit
$ git push -u origin master
```

### Sub Module Xcode 프로젝트 만들기

Sub Module로 사용할 프로젝트를 하나 더 생성한다. 나의 경우는 Cocoa Touch Framework로 생성했다. Cocoa Touch Static Library 등의 다른 형식은 적용해보지 않아서 동일하게 적용이 되는지는 모르겠다. 특별한 이유가 없다면 Cocoa Touch Framework로 생성한다.

![](/img/2015-10-21-xcode-create-sub-module-using-cocoapods-1.png)

이후 부터는 화면에서 안내하는대로 프로젝트를 개설하면 되므로 자세한 설명은 생략하겠다. 생성을 마쳤다면 이 프로젝트도 "Xcode 프로젝트 만들기" 부분에서 예를 들었던 내용처럼 git에 연결한다.

#### podspec 생성

Sub Module을 만들었다면 CocoaPods을 통해 연결할 수 있도록 podspec을 생성해야 한다.
Sub Module 프로젝트 폴더에 가서 {모듈명}.podspec 파일을 생성하고 아래와 같이 내용을 넣어준다. 이 부분도 상황에 따라 내용을 변경해도 상관없다.

```ruby
Pod::Spec.new do |s|
  s.name     = '{모듈명}'
  s.version  = '1.0.0'
  s.license = 'MIT'
  s.summary  = '{설명}'
  s.homepage = 'https://gitlab.com/subva/SUBiOSFramework'
  s.author   = { '{작성자}' => '{작성자}{도메인}' }
  s.source   = { :git => '{git repository}', :tag => s.version }
  s.ios.deployment_target = '8.0'
  s.source_files = '{모듈명}/*.swift'
  s.requires_arc = true
end
```


### Sub Module 연결

위 과정을 문제없이 진행했다면 git에 연결된 두개의 프로젝트(메인 프로젝트, Sub Module 프로젝트)를 가지고 있을 것이다. 이제는 본격적으로 둘을 연결하는 과정이다.

#### git submodule 추가

메인 프로젝트 폴더로 이동하여 git submodule로 Sub Module을 clone한다.

```bash
$ cd {프로젝트명}
$ git submodule add https://gitlab.com/{사용자}/{프로젝트명}.git {Sub Module명}
$ git submodule init
$ git submodule update
```

#### CocoaPods로 Sub Module 연결

메인 프로젝트 폴더에 `Podfile`을 생성하고 아래와 같이 내용을 입력한다. Pods에 대한 설정 내용은 프로젝트에 따라 달라 질 수 있다. 중요한 부분은 `use_frameworks!`, `pod '{Sub Module명}', :path => './{Sub Module명}'` 이다. 그리고 platform의 '8.0' 부분도 빠지면 오류가 날 수 있는데 이 부분은 Sub Module의 deploy target에 맞춰져야 한다.

```ruby
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '8.0'
use_frameworks!

pod '{Sub Module명}', :path => './{Sub Module명}'
```

파일을 생성했다면 아래의 명령을 실행해서 Pod를 실행한다.

```bash
$ pod install
```

### 설정 확인

이제 정상적으로 연결되었는지 확인하면 된다. CocoaPods을 사용해 봤다면 알겠지만 CocoaPods을 사용 할 때는 xcodeproj가 아닌 xcworkspace로 프로젝트를 열어야 한다. 위 과정이 정상적이었다면 아래와 같이 Pods 영역에 "Development Pods"라는 것이 추가되어 있고 그 안애 추가한 Sub Module이 보일 것이다. 여기까지 확인되었다면 Sub Module 연결 과정은 모두 끝났다.

마지막으로 한가지만 더 이야기하겠다. 프로젝트를 열어서 해당 모듈을 사용하려면 당연히 소스에서 `import`를 해야하는데 처음엔 연결이 되지 않는 것처럼 보일 수 있다. 이 부분은 모듈이 아직 빌드가 되지 않아서 그런 것이니 빌드를 한번 해주고나면 정상적으로 사용이 가능할 것이다.

위에서 Git나 CocoaPods에 대한 설명을 하느라 조금 길어졌지만 이 두가지를 사용할 줄 알고 있다면 설정 과정은 생각보다 아주 간단하다. Android Studio와 비교하면 과정도 거의 유사하다는 것을 알 것이다.