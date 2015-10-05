---
layout: post
title: "Swift 2 : Binary operator '|' cannot be applied to two 'UIViewAutoresizing' operands 오류 해결"
date: 2015-10-05 12:44:59 +0900
comments: true
categories: [ios,swift]
---

이번에 iOS 작업중 Swift 2로 변경을 하면서 아래와 같은 오류를 만났다.

```
Binary operator '|' cannot be applied to two 'UIViewAutoresizing' operands
```

사실 이 부분말고도 여러가지 오류가 나왔지만 기본적으로 swift 버전업을 도와주는 헬프 기능 등을 통해 어느 정도는 쉽게 고칠 수 있었다.

어쨌든 이 오류는 아래의 코드를 보면 해결 방법을 바로 알 수 있다.

```swift
let view = UIView(frame: CGRect(x: 0, y: 0, width: 100, height: 100))
addSubview(view)
// Swift 2.0 미만
view.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight
// Swift 2.0 이상
view.autoresizingMask = [.FlexibleWidth, .FlexibleHeight]
```

이와 유사하게 UIUserNotificationType의 경우도 아래와 같이 수정이 필요하다.

```swift
// Swift 2.0 미만
let settings = UIUserNotificationSettings(forTypes: UIUserNotificationType.Alert | UIUserNotificationType.Badge, categories: nil)
// Swift 2.0 이상
let settings = UIUserNotificationSettings(forTypes: [.Alert, .Badge], categories: nil)
UIApplication.sharedApplication().registerUserNotificationSettings(settings)
if settings.types.contains(.Badge) {
    // whatever
}
```
