---
layout: post
title: "Swift 2 : 'lastPathComponent' is unavailable: Use lastPathComponent on NSURL instead. 오류 해결"
date: 2015-10-05 13:14:55 +0900
comments: true
categories: [ios,swift]
---

[Swift 2 : Binary operator '|' cannot be applied to two 'UIViewAutoresizing' operands 오류 해결](/2015/10/05/binary-operator-cannot-be-applied-to-two-uiviewautoresizing-operands/)에 이어 Swift 2로 넘어가면서 만난 또 다른 오류.

```
'lastPathComponent' is unavailable: Use lastPathComponent on NSURL instead.
```

관련해서 찾아보니 [No more stringByAppendingPathComponent in Xcode 7 beta 5?](https://forums.developer.apple.com/thread/13580)라는 글이 있었다. 내용을 보니 해당 함수가 없어져서 다른 방법으로 수정해야 한다는 것. 내용중 [tieferbegabt](https://forums.developer.apple.com/people/tieferbegabt)라는 사람이 간단히 해결할 수 있는 코드를 올려 놓았다.

```swift
extension String {
    var lastPathComponent: String {
        get {
            return (self as NSString).lastPathComponent
        }
    }
    var pathExtension: String {
        get {
            return (self as NSString).pathExtension
        }
    }
    var stringByDeletingLastPathComponent: String {
        get {
            return (self as NSString).stringByDeletingLastPathComponent
        }
    }
    var stringByDeletingPathExtension: String {
        get {
            return (self as NSString).stringByDeletingPathExtension
        }
    }
    var pathComponents: [String] {
        get {
            return (self as NSString).pathComponents
        }
    }
    func stringByAppendingPathComponent(path: String) -> String {
        let nsSt = self as NSString
        return nsSt.stringByAppendingPathComponent(path)
    }

    func stringByAppendingPathExtension(ext: String) -> String? {
        let nsSt = self as NSString
        return nsSt.stringByAppendingPathExtension(ext)
    }
}
```

Objective-C의 category나 swift의 extension은 개인적으로 정말 좋은 기능이라고 생각한다. 하지만 위의 코드는 임시로 사용하고 가급적 위 코드의 내용을 참고해서 오류가 나는 부분을 직접 변경하는 것을 권장하고 싶다. 어짜피 나중에는 애플에서 권장하는대로 코딩을 해야할테니 정확한 방법을 익히도록 처리하는 것이 좋다는 얘기다.

아래는 내가 사용한 코드의 일부를 예시로 남긴다.

```swift
// before
let filename = file.lastPathComponent.stringByDeletingPathExtension
// after
let filename = ((file as NSString).lastPathComponent as NSString).stringByDeletingPathExtension
```