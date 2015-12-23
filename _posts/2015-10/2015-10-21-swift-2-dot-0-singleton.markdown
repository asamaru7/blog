---
layout: post
title: "Swift 2.0에서 상속 가능한 Singleton 생성하기"
date: 2015-10-21 16:28:03 +0900
comments: true
categories: [ios,swift]
---
오늘은 swift에서 Singleton 객체를 생성하는 방법을 설명하고자 한다.

우선 Objective-C에서는 어떻게 생성하는지는 아래를 보면 알 수 있다.

우선 Singleton Class 정의.

```ObjC
@implementation SingletonCls

+ (id)sharedManager {
    static SingletonCls *staticManager = nil;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        staticManager = [[self alloc] init];
    });
    return staticManager;
}

@end
```

그리고 사용시.

```ObjC
[SingletonCls sharedManager];
```

그럼 Swift에서는 어떻게 하는지를 살펴보자. 사실 아주 간단하다.

Singleton Class 정의.

```swift
class SingletonCls {
    static let sharedInstance = SingletonCls()
}
```

그리고 사용시.

```swift
SingletonCls.sharedInstance
```

그런데 오늘 하고자하는 이야기는 이게 아니다. 기본적인 Singleton Class를 정의하는 것은 검색하면 많이 나온다. 하지만 내가 필요했던 것은 상속이 가능한 Swift Singleton Class다. 아래의 예를 보자.

```swift
class SingletonCls {
	static let sharedInstance = SingletonCls()

	var X:Int?
}

class SingletonClsChild : SingletonCls {
	var Y:Int = 9
}

let A = SingletonClsChild.sharedInstance;
print(A);
print((A as! SingletonClsChild).Y);
```

```
test.SingletonCls
Could not cast value of type 'test.SingletonCls' (0x10d89d2e0) to 'test.SingletonClsChild' (0x10d89d390).
```

위 코드는 실행하면 오류가 난다. `SingletonClsChild.sharedInstance`의 결과가 `SingletonCls` 인스턴스이기 때문이다.

우선 이 문제를 해결하기 위한 기본 코드부터 보자. [Swift: Singleton Inheritance](http://www.scriptscoop.net/t/23f5fc2cdd82/swift-singleton-inheritance.html)에 나온 코드를 약간 수정했다.

```swift
public class SingletonCls {
	static var _singleton_instance = [String: SingletonCls]()
	public class var shareInstance:SingletonCls {
		get {
			let classname = NSStringFromClass(self)
			if ((_singleton_instance[classname]) != nil) {
				return (_singleton_instance[classname])!
			}
			let singletonObject = self.init()
			_singleton_instance[classname] = singletonObject
			return singletonObject
		}
	}

	required public init() { }
}

public class SingletonClsChild : SingletonCls {
}
```

```swift
SingletonCls.sharedInstance
SingletonClsChild.sharedInstance
```

위 코드에서 제시한 방법을 사용하면 상속이 가능한 Singleton Class를 정의할 수 있다. 사실 여기에 약간의 기능이 더 추가되어 있다. 호출하는 Class에 따라 각각의 Instance를 생성해서 보관하는 부분이다. 예를 들어 아래의 코드를 보자.

```swift
public class SingletonCls {
	static var _singleton_instance = [String: SingletonCls]()
	public class var shareInstance:SingletonCls {
		get {
			let classname = NSStringFromClass(self)
			if ((_singleton_instance[classname]) != nil) {
				return (_singleton_instance[classname])!
			}
			let singletonObject = self.init()
			_singleton_instance[classname] = singletonObject
			return singletonObject
		}
	}

	required public init() { }

	var X:Int = 1
}

public class SingletonClsChild : SingletonCls {
	var Y:Int = 9
}

let A = SingletonClsChild.shareInstance;
print(A.X);
print((A as! SingletonClsChild).Y);
A.X = 2
let B = SingletonCls.shareInstance;
print(B.X);
```

결과.

```
1
9
1
```

결과를 보면 맨 마지막 값이 2가 아닌 1이 나오는 것을 확인 할 수 있다. 이것은 Singleton이 만들어 졌으나 `SingletonCls`와 `SingletonClsChild`가 각각 만들어 졌음을 뜻한다.

이런 추가적인 부분을 제외하고 기본적인 형태만 사용하고자 할 경우에는 아래와 같이 하면 된다.

```swift
public class SingletonCls {
	static var _singleton_instance: SingletonCls?
	public class var shareInstance:SingletonCls {
		get {
			if (_singleton_instance == nil) {
				_singleton_instance = self.init()
			}
			return _singleton_instance!
		}
	}

	required public init() { }
}
```

```swift
SingletonCls.sharedInstance
```

위 코드를 기준으로 오류가 나던 코드를 다시 만들어 보자.

```swift
public class SingletonCls {
	static var _singleton_instance: SingletonCls?
	public class var shareInstance:SingletonCls {
		get {
			if (_singleton_instance == nil) {
				_singleton_instance = self.init()
			}
			return _singleton_instance!
		}
	}

	required public init() { }

	var X:Int?
}

public class SingletonClsChild : SingletonCls {
	var Y:Int = 9
}

let A = SingletonClsChild.shareInstance;
A.X = 1
print(A)
print(A.X);
print((A as! SingletonClsChild).Y);
```

아래와 같은 결과가 출력된다. 원하던 결과를 얻었다.

```
test.SingletonClsChild
Optional(1)
9
```
