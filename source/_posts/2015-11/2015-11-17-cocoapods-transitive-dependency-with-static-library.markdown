---
layout: post
title: "Cocoapods : Sub Module에서 GoogleMaps 의존성 사용시 Transitive dependency 문제 해결"
date: 2015-11-17 13:19:25 +0900
comments: true
categories: ios
---
**아래에 설명한 방법을 사용시 런타임시에 문제가 될 수 있어 다른 방법을 찾고 있는 중이니 참고만 하길 바란다.**

지난 글 [Cocoapods : The 'Pods' target has transitive dependencies that include static binaries 오류](/2015/11/17/cocoapods-the-pods-target-has-transitive-dependencies-that-include-static-binaries/)에서 언급한 transitive dependencies 문제를 해결하는 방법을 설명하려고 한다. 미리 이야기 하지만 사실 아래의 내용은 아주 깔끔하게 해결하는 방법은 아니다. 정확한 해결이 되려면 CocoaPods에서 정식 지원을 해야 해결될 것으로 보인다. 하지만 임시로라도 사용을 해야 한다면 아래의 내용이 도움이 될지도 모르겠다(어쨌든 난 이렇게 사용중이다).

우선 왜 이 문제를 만나게 되었는지 부터 설명하려고 한다.
지난글에서 설명 했던 것과 같이 Sub Module에서 GoogleMaps에 대한 의존성을 지정 해야하는 상황이 발생했다. 그래서 아래와 같이 `podspec` 파일을 만들었다.

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

  s.dependency 'GoogleMaps'
end
```

그런데 `[!] The 'Pods' target has transitive dependencies that include static binaries: (/~~~/Pods/GoogleMaps/Frameworks/GoogleMaps.framework)` 오류가 발생한다(**이전 글에서도 언급했지만 항상 발생하는 것이 아니라 Podfile에서 `use_frameworks!`를 사용할 경우에 발생한다.**). 그래서 [Cocoapods : The 'Pods' target has transitive dependencies that include static binaries 오류](/2015/11/17/cocoapods-the-pods-target-has-transitive-dependencies-that-include-static-binaries/)에서 언급한 것처럼 `pre_install`을 사용해서 오류는 제거했다. 하지만 실제 작업을 위해 `import GoogleMaps`를 하면 모듈을 찾지를 못한다. 여기서 부터 삽질이 시작되었다.

static binaries를 포함하는 모듈이 아닌 경우 부모 프로젝트(Sub Module을 사용하는)에서 해당 의존성이 지정되어 있다면 바로 import해서 사용이 가능하다(부모 프로젝트의 Podfile에 `pod 'GoogleMaps'`가 추가되어 있는 경우). 당연히 부모 프로젝트를 열어서 Sub Module을 수정하고 있는 경우를 말한다. 하지만 이 경우는 그것도 안된다(정확한 이유는 아직 모르겠다. static binaries를 포함하고 있어서 그런 것인지 GoogleMaps 모듈이 use_frameworks을 완전하게 지원하지 않아서 인지 명확하지는 않다). 따라서 어떻게 해서든 의존성을 지정해야 한다.

이를 해결하려고 여러가지 시도를 해봤으나 모두 실패했다. 그래서 다른 프로젝트들은 어떻게 해결했나 싶어 github에서 모듈들을 찾아다니다 [PXGoogleDirections](https://github.com/poulpix/PXGoogleDirections)를 발견했다. 내가 원했던 것처럼 CocoaPods 모듈에서 GoogleMaps에 대한 의존성을 지정한 모듈이다(사실 다른 모듈들도 찾았으니 그냥 `dependency`를 사용하고 있었다. 이 모듈들은 확인해보니 나처럼 `use_frameworks!`를 사용하는 상황에서는 동일한 문제가 발생한다). 그래서 [PXGoogleDirections](https://github.com/poulpix/PXGoogleDirections)의 소스를 조금 둘러보니 GoogleMaps의 소스를 프로젝트 내부에 포함하고 있었다. 사실 이 방법이 외부에서 사용시에는 가장 깔끔한 방법으로 보인다. 하지만 난 이렇게는 하고 싶지 않았다.

그래서 [PXGoogleDirections.podspec](https://github.com/poulpix/PXGoogleDirections/blob/master/PXGoogleDirections.podspec)를 참고해서 여러 번의 시도 끝에 나름의 방법을 찾았다.

결론은 `podspec`파일을 아래와 같이 설정하면 된다. 단, [Cocoapods : The 'Pods' target has transitive dependencies that include static binaries 오류](/2015/11/17/cocoapods-the-pods-target-has-transitive-dependencies-that-include-static-binaries/)에서 언급한 것처럼 `pre_install`을 사용해서 오류는 제거해야 한다.

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

  s.dependency 'GoogleMaps'
  s.frameworks            = "Accelerate", "AVFoundation", "CoreBluetooth", "CoreData", "CoreLocation", "CoreText", "Foundation", "GLKit", "ImageIO", "OpenGLES", "QuartzCore", "Security", "SystemConfiguration", "CoreGraphics", "GoogleMaps"
  s.resource_bundles      = { 'GoogleMaps' => ['$(PODS_ROOT)/GoogleMaps/Frameworks/GoogleMaps.framework/Resources/*.bundle'] }
  s.vendored_frameworks   = "$(PODS_ROOT)/GoogleMaps/Frameworks/GoogleMaps.framework"
  s.xcconfig              = { 'FRAMEWORK_SEARCH_PATHS' => '$(PODS_ROOT)/GoogleMaps/Frameworks' }
end
```

설명하자면 `dependency`를 통해 의존성을 설정한다. Cocoapods의 특성상 Sub Module의 의존성도 모두 `Pods`로 통합되어 추가된다(부모 프로젝트에서도 바로 사용 가능하다). 그런데 이렇게만 설정하면 정작 Sub Module에서는 GoogleMaps에 접근할 수 없으므로 관련된 설정을 `Pods`에 설치된 GoogleMaps에 맞추어준다. `frameworks`의 경우만 보더라도 GoogleMaps에서 이미 의존성이 다 지정되어 있음에도 불구하고 다시 다 설정해 주어야 한다([GoogleMaps.podspec.json](https://github.com/CocoaPods/Specs/blob/master/Specs/GoogleMaps/1.10.5/GoogleMaps.podspec.json) 참고)

어쨌든 이렇게 하면 문제는 해결된다. 서두에서 언급한 것처럼 내가 봐도 깔끔한 해결 방법은 아니다. 하지만 이런 불편함을 감수하고서라도 Sub Module로 분리하고 싶다면 위 방법을 참고하자. 원리를 보면 GoogleMaps가 아닌 다른 모듈(static binaries를 포함하는)도 동일하게 처리할 수 있다. 그리고 일단 Sub Module로 분리해서 사용하다 보면 CocoaPods에서 개선해줄 것으로 생각한다(관련되 Issue가 다수 존재하므로).
