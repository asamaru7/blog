---
layout: post
title: "CocoaPods의 Swift compiler flags(DEBUG) 설정하기"
date: 2015-10-22 11:28:37 +0900
comments: true
categories: [ios,swift]
---
[Xcode에서 CocoaPods를 이용해 sub module 만들기](http://blog.asamaru.net/2015/10/21/xcode-create-sub-module-using-cocoapods/)라는 글에서 Sub Module을 만드는 방법을 설명했었다. 그런데 이렇게 연결된 Module을 사용하는 과정에서 불편한 부분이 생겼다. 다름아닌 `#if DEBUG`를 Sub Module에서 적용이 되지 않는 것이다. 이 부분은 생각해보면 당연하다 별개의 Module을 빌드에서 연결하는 것이니 `DEBUG` 상수를 사용하기 위한 설정을 별도로 해야 하는 것이다(`DEBUG` 상수 설정 방법은 [Swift 프로젝트의 디버그(DEBUG) 플래그](http://seorenn.blogspot.kr/2014/11/xcode-swift-debug.html)을 참고하면 된다). 그래서 CocoaPods에서 추가해준 프로젝트에 `DEBUG` 관련 설정을 해주니 원하는대로 `#if DEBUG`를 사용할 수 있었다. 그런데 여기서 모든 문제가 해결된 것이 아니었다. `pod update` 실행시 Module이 재설치 되면서 관련 설정이 다시 초기화 되는 것이다. 이걸 매번 해줄 수도 없고... 그래서 조금 찾아보니 [Setting Swift compiler flags in CocoaPods](http://marginalfutility.net/2015/10/11/swift-compiler-flags/)라는 글에서 해결 방법을 제시하고 있었다.

결론을 이야기하자면 `Podfile`에서 `post_install`을 사용해서 `DEBUG` 상수를 자동으로 추가하도록 하는 것이다. `Podfile`에 아래의 내용을 추가하면 된다.

```ruby
post_install do |installer|
	installer.pods_project.targets.each do |target|
		if target.name == '{원하는 모듈명}'
			target.build_configurations.each do |config|
				if config.name == 'Debug'
					config.build_settings['OTHER_SWIFT_FLAGS'] = '-DDEBUG'
					else
					config.build_settings['OTHER_SWIFT_FLAGS'] = ''
				end
			end
		end
	end
end
```