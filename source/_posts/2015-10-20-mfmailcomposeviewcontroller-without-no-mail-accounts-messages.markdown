---
layout: post
title: "MFMailComposeViewController without 'No Mail Accounts' messages"
date: 2015-10-20 09:47:16 +0900
comments: true
categories: ios
---
iOS 개발시 앱 내에서 메일 발송폼을 보여주고자 할 때 사용하게 되는 것이 [MFMailComposeViewController](https://developer.apple.com/library/prerelease/ios/documentation/MessageUI/Reference/MFMailComposeViewController_class/index.html) 이다. 이 클래스를 swift에서 사용할 경우 대부분 아래와 같이 사용하게 된다.

```swift
let mc = MFMailComposeViewController()
mc.mailComposeDelegate = self
mc.setToRecipients([to])
if (subject != nil) {
    mc.setSubject(subject!)
}
if (body != nil) {
    mc.setMessageBody(body!, isHTML: false)
}
if MFMailComposeViewController.canSendMail() {
    getRootViewController()?.presentViewController(mc, animated: true, completion: nil)
} else {
    let alertView = UIAlertController(title: "안내", message: "현재 디바이스에서 이메일을 보낼수가 없습니다. 설정에서 이메일 관련 설정을 확인해주세요.", preferredStyle: .Alert)
    alertView.addAction(UIAlertAction(title: "Ok", style: .Default, handler: nil))
    presentViewController(alertView, animated: true, completion: nil)
}
```

그런데 위 코드처럼 사용하게 되면 설정된 메일 계정이 없어 메일 발송이 불가능할 경우 'No Mail Accounts' 메시지가 먼저 나오게 된다(쉽게 말해서 메시지가 두개가 뜬다). 그렇다면 'No Mail Accounts' 메시지는 나오지 않게 하고 내가 지정한 메시지가 나오게 하려면 어떻게 해야할까?

```swift
if MFMailComposeViewController.canSendMail() {
    let mc = MFMailComposeViewController()
    mc.mailComposeDelegate = self
    mc.setToRecipients([to])
    if (subject != nil) {
        mc.setSubject(subject!)
    }
    if (body != nil) {
        mc.setMessageBody(body!, isHTML: false)
    }
    getRootViewController()?.presentViewController(mc, animated: true, completion: nil)
} else {
    let alertView = UIAlertController(title: "안내", message: "현재 디바이스에서 이메일을 보낼수가 없습니다. 설정에서 이메일 관련 설정을 확인해주세요.", preferredStyle: .Alert)
    alertView.addAction(UIAlertAction(title: "Ok", style: .Default, handler: nil))
    presentViewController(alertView, animated: true, completion: nil)
}
```

위 코드처럼 `MFMailComposeViewController.canSendMail()` 호출 이후에 `MFMailComposeViewController()`를 생성하면 'No Mail Accounts' 메시지는 나오지 않고 내가 지정한 메시지가 나타나게된다. 정확한 이유는 확인하지 못했지만 어쨌든 이렇게 하면 된다.

***

그리고 MFMailComposeViewController 이야기가 나온 김에 한가지 문제를 더 알아보자.

MFMailComposeViewController를 사용해서 시뮬레이터에서 실행해보면 이상하게도 아래의 오류가 날 수 있다.

```
viewServiceDidTerminateWithError: Error Domain=_UIViewServiceInterfaceErrorDomain Code=3 "(null)" UserInfo={Message=Service Connection Interrupted}
```

우선 [I have REAL misunderstanding with MFMailComposeViewController in Swift (iOS8) in Simulator](http://stackoverflow.com/questions/25604552/i-have-real-misunderstanding-with-mfmailcomposeviewcontroller-in-swift-ios8-in/25864182#25864182)를 살펴보자. 이 문제에 대한 설명이 되어 있다.
여기서는 Obj-C로 설명되어 있긴하지만 swift로 내용을 변경하는 것은 어렵지 않을 것이다. 그런데 문제는 나의 이렇게 해도 해결이 되지 않는다는 것이다. 사실 위 글을 잘 읽어보면 MFMailComposeViewController을 재사용할 경우에 대한 문제로 시뮬레이터에서 발생하는 문제와는 상관이 없다. 그래서 여러곳을 찾아보니 시뮬레이터만 문제가되고 실 기기에서는 해당 오류가 나지 않는다는 이야기들이 있다. 그리고 iOS 8.3에서 해결되었다는 등의 이야기도 있다. 그런데 나는 iOS 9 기준으로 테스트를 해봤지만 해결되지 않았다. [MailCompositionService quit unexpectedly](https://forums.developer.apple.com/thread/4415)를 보면 아직도 해결되지 않은 것으로 보인다. 하지만 기기에서만 문제되지 않는다면 나도 일단은 상관없다고 생각한다.

