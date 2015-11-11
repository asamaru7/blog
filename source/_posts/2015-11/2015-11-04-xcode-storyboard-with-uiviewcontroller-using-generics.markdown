---
layout: post
title: "Xcode 7.1의 StoryBoard에서 UIViewController(using Generics)를 Custom Class로 연결할 때 발생하는 오류"
date: 2015-11-04 20:46:51 +0900
comments: true
categories: ios
---
현재 xcode의 최신 버전은 7.1이다. 이 버전에서(이하 버전은 확인하지 못했다) 스토리보드와 [Generics](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html)를 사용한 UIViewController를 연결하는 부분에서 버그가 있다. 버그는 인터페이스 빌더에서 찾지 못하는 문제와 강제 추가시 `Unknown class <MyClass> in Interface Builder file` 오류를 발생시키는 것이다. 자세한 내용은 아래에 설명하겠다.

일단 [Generics](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html)가 어떤 것인지 정보를 더 얻고 싶다면 [Swift - Generics 정리](http://minsone.github.io/mac/ios/swift-generics-summary/)를 참고하자.

항상 이런 글을 쓰려고하면 상황을 설명하기가 어렵다. 그렇다고 설명없이 코드만 적어놓으면 어떻게 사용되는지를 알 수 없으니 일단 최선을 다해 보겠다.

UIPageViewController를 사용하고자 하는 상황을 가정하고 설명한다.

1. 스토리보드에서 "Page View Controller"를 추가했다.
2. 그 다음에 해야할 작업은 UIPageViewController class를 하나 추가한다.
3. 추가한 class를 인터페이스 빌더에서 Custom Class로 연결한다.

위 상황의 결과가 아래의 이미지다. UIPageViewController class로 PageViewController라는 class를 추가한 것이다.

![xcode](/img/2015-11/04-xcode-storyboard-with-uiviewcontroller-using-generics-1.png)

비교를 위해 소스도 추가 한다. 사실 볼 것도 없다. 내부 기능은 설명에 필요하지 않아 모두 제거 했다.

```swift
import UIKit

class PageViewController: UIPageViewController {
}
```

이 상황에서 빌드하고 실행하면 아무런 문제가 없다. 당연하다. 가장 일반적인 상황이니까.

이제부터가 내가 버그라고 주장하는 부분의 시작이다. 아래의 코드를 보자.

```swift
import UIKit

class PageViewController: UIPageViewController {
}

class PageViewControllerChild: PageViewController {
}

class PageViewControllerT<T>: UIPageViewController {
}

class PageViewControllerTChild: PageViewControllerT<String> {
}
```

3개의 class를 추가했다. 하지만 여전히 아무런 기능은 없다. 이 상황에서 위의 이미지와 동일한 상황을 캡춰한 것이 아래 이미지다.

![xcode](/img/2015-11/04-xcode-storyboard-with-uiviewcontroller-using-generics-2.png)

비교가 되는가? 달라진 점은 우측의 Custom Class 영역의 Class에서 선택할 수 있는 대상 Class 목록이다.
그런데 위의 소스를 자세히 보고 이 이미지를 봤다면 뭔가 이상함을 느낄 것이다.

**바로 `PageViewControllerTChild`가 목록에 없다는 것이다.** 내가 캡춰를 잘못한 것이 아니다. 실제로 나타나지 않는다.

그렇다면 이게 내가 말하고자 하는 버그인가? 아니다. 그냥 목록에만 나오지 않는 것이라면 조금 귀찮을 뿐 문제되지는 않는다.
자 이제 다시 테스트 해보자. 목록에는 없지만 실제로 class는 존재하므로 강제로 타이핑해서 `PageViewControllerTChild`를 집어 넣자.
다시 빌드하고 실행. 그런데 기존과 다르게 오류가 난다.

```
2015-11-04 21:08:24.886 Test[32048:90982] Unknown class _TtC4Test24PageViewControllerTChild in Interface Builder file.
```

앱을 죽이지는 않으나 해당 View가 아무것도 나오지 않는다.
오류의 내용은 인터페이스 빌더에서 알 수 없는 `_TtC4Test24PageViewControllerTChild` class에 접근 한다는 것.
이상한 일이다. 분명 해당 class는 존재한다. 오류에 나온 `_TtC4Test24PageViewControllerTChild`과 이름은 다르지만 분명 같은 class에 접근하려는 것이다.
이 문제가 바로 내가 버그라고 이야기하는 부분이다.

요약하자면 다음과 같다. **Generics를 사용하는 UIViewController는 인터페이스 빌더에 연결되지 않는다.**

이 문제 하나로 인해 인터페이스 빌더와 스토리보드를 다 걷어내거나 이것만 따로 처리하기는 싫다.
자.. 이제부터 그럼 해결을 해보자. 해결을 위해서는 원인을 알아야 한다.

중요한 내용은 [“Unknown class <MyClass> in Interface Builder file” error at runtime](http://stackoverflow.com/a/1725893)에 설명되어 있다.
이 글은 내가 말하는 Generics와 관련된 상황이 아닌 조금 더 일반적인 상황에 대한 것으로 약간의 차이가 있다. 하지만 거의 유사하므로 해결에 도움을 얻을 수 있었다.
게다가 기본적인 설명은 Objective-C 기준으로 되어있고 swift의 경우는 `init(coder aDecoder: NSCoder)`를 추가하는 것으로 설명하고 있지만 이 것은 위 문제를 해결하는 것에는 도움이 되지 않는다.
어쨌든 이 글의 결론을 이야기 하자면 이렇다. 인터페이스 빌더에서 해당 class를 제대로 찾지 못하고 있기 때문에 linking이 제대로 되지 못하고 있다는 것이다.
따라서 해당 class에 직접 접근하는 코드를 넣어주어야 한다는 것이다. 그래서 이 글에서는 불필요한 함수 하나를 추가하고 사용 전에 강제로 호출함으로써 문제를 해결할 수 있다고 되어 있다.

위 글에서 설명한 것을 기초로 해결을 위한 코드는 다음과 같다.

```swift
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

	var window: UIWindow?
//	let x = PageViewControllerTChild.description()

	override init() {
		super.init()

		PageViewControllerTChild.description()
	}

	func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
		// Override point for customization after application launch.

//		PageViewControllerTChild.description()

		return true
	}
}
```

**해결 방법은 AppDelegate의 `init()` 내부에서 `PageViewControllerTChild`의 함수를 하나 호출한다.**

호출하는 함수는 어떠한 것이라도 상관없다. 하지만 호출 시점은 아주 중요하다. 호출 시점은 해당 화면이 보여지기 전(초기화 전) 이어야 한다.
위 코드는 시작 화면으로 사용한 화면을 대상으로 하고 있기 때문에 `init()`에 추가 했다. 하지만 시작 화면이 아니라면 `func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool`에 추가되어도 상관없다. 하지만 어짜피 특별한 기능을 수행할 것이 아니므로 `init()`에 넣어주는게 속 편할 것이다. 앞서 설명과 같이 어떻게 넣을 수 있는지를 설명하기 위해서 비슷한 코드가 여러군데 있다(대신 주석으로 제외시켜 둔 것이다).

사실 나는 이 해결 방법을 고심해서 찾았지만 실제로는 적용하지 않았다. 설계 구조를 변경해서 Generics를 제거하는 쪽으로 결정했다. 필히 Generics이 필요한 상황이 아니었기 때문에 굳이 이렇게까지 할 필요는 없다고 생각했기 때문이다.

어쨌든 비슷한 문제를 겪고 있다면 위의 설명을 참고로 해결 방법을 찾길 바란다.
