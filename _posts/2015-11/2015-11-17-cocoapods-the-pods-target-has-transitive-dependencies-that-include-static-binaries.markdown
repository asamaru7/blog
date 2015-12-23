---
layout: post
title: "Cocoapods : The 'Pods' target has transitive dependencies that include static binaries 오류"
date: 2015-11-17 13:17:38 +0900
comments: true
categories: ios
---
iOS용 앱 개발을 하면서 CocoaPods을 사용하고 있다. 그리고 CocoaPods을 이용해서 반복적인 기능의 구현을 Sub Module로 분리하여 프로젝트를 진행하고 있다. Sub Module 분리에 대해서는 [Xcode에서 CocoaPods를 이용해 sub module 만들기](/2015/10/21/xcode-create-sub-module-using-cocoapods/)에서 설명 했었다.

이렇게 만든 Sub Module에서 가지는 의존성은 `dependency` 속성을 이용해서 지정한다. 예를들면 아래와 같다.

**ModuleName.podspec**

```ruby
Pod::Spec.new do |s|
  s.name     = 'ModuleName'
  s.version  = '1.0.0'
  s.license = 'MIT'
  s.summary  = 'ModuleName Summary'
  s.homepage = 'https://~~~'
  s.author   = { 'ㅇㅇㅇ' => 'nobody@nobody.com' }
  s.source   = { :git => 'https://~~~/ModuleName.git', :tag => s.version }
  s.ios.deployment_target = '8.0'
  s.source_files = 'Source/ModuleName/*.swift', 'ModuleName/**/*.swift'
  s.requires_arc = true

  s.dependency 'DependencyModuleName'
end
```

그런데 이렇게 설정해서 사용할 경우 CocoaPods에서 아래와 같은 오류가 나는 경우가 있다. **항상 발생하는 것이 아니라 Podfile에서 `use_frameworks!`를 사용할 경우에 발생한다.**

```
[!] The 'Pods' target has transitive dependencies that include static binaries: (/~~~/Pods/DependencyModuleName/Frameworks/DependencyModuleName.framework)
```

대표적으로 GoogleMaps 모듈을 `dependency`로 사용하면 이 오류를 만나게 된다. 이유를 간단하게 설명하자면 의존성을 지정한 모듈이 static binaries를 포함하고 있기 때문에 발생하는 오류다. 현재 사용중인 CocoaPods의 버전은 0.39.0인데 아직까지 이 상황에 대해서는 지원을 하지 않는 것으로 보인다. 이와 관련하여 [Reject installation if a static library is used as a transitive dependency while using frameworks](https://github.com/CocoaPods/CocoaPods/issues/2926)라는 Issue가 진행중이다.

어쨌든 일단 CocoaPods에서 이 오류가 나지 않도록 하는 방법은 다음과 같다. 부모 프로젝트의 Podfile에 아래와 같이 추가 한다.

**Podfile**

```ruby
pre_install do |installer|
	def installer.verify_no_static_framework_transitive_dependencies; end
end
```

관련글 : [Prevent Transitive Dependency Errors in Swift Project with Vendored Frameworks](https://github.com/CocoaPods/CocoaPods/issues/3289)

pre_install를 이미 사용중이라면 거기에 def 라인만 추가하면 된다.

사실 이 방법은 일단 오류가 나오지 않도록 검사를 하지 않는 것일 뿐 근본적인 해결이 된 것은 아니다. 이와 관련한 해결 방법은 관련성이 있으나 다른 부분을 포함하고 있어 [Cocoapods : Sub Module에서 GoogleMaps 의존성 사용시 Transitive dependency 문제 해결](/2015/11/17/cocoapods-transitive-dependency-with-static-library/)에 따로 남긴다.
