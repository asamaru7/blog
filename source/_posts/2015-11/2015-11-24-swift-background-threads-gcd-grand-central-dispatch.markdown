---
layout: post
title: "Swift : Async - Background Threads - GCD(Grand Central Dispatch)"
date: 2015-11-24 07:35:18 +0900
comments: true
categories: ["swift", "ios"]
---
오늘은 swift에 비동기 처리에 사용하는 [Async](https://github.com/duemunk/Async)라는 라이브러리를 소개하고자 한다. [Async](https://github.com/duemunk/Async)는 "Syntactic sugar in Swift for asynchronous dispatches in Grand Central Dispatch"라고 소개되어 있다. [Async](https://github.com/duemunk/Async)를 소개하기 전에 swift에서의 기본적인 비동기 처리에 대해 먼저 설명한다.

swift는 비동기(Asynchronous) 처리에 사용하는 [GCD(Grand Central Dispatch)](https://developer.apple.com/library/ios/documentation/Performance/Reference/GCD_libdispatch_Ref/)를 사용할 수 있다. GCD(Grand Central Dispatch)는 C로 구성된 스레드 관리 기술로 iOS4 부터 지원한다. NSThread, NSOperation 보다 쉽게 쉽게 사용할 수 있다.

스레드는 다양한 병렬 작업에 사용하지만 특히 앱 개발시에는 더욱 자주 사용하게 된다. 안드로이드와 iOS는 UI처리 등의 앱의 실행을 main 스레드에서 처리한다. 그런데 이 main 스레드에서 무거운 작업을 하게 된다면 UI의 갱신이 지연되므로 화면의 멈춤 현상이 발생한다. 특히 안드로이드의 경우는 main 스레드에서 네트워크 처리 등을 할 수 없도록 제한이 걸려있다(제한을 풀 수 있으나 ANR 문제 등으로 결국은 사용하지 못하는 것과 같다). 이러한 문제를 해결하기 위해서는 스레드의 사용이 필수다.

그럼 [GCD(Grand Central Dispatch)](https://developer.apple.com/library/ios/documentation/Performance/Reference/GCD_libdispatch_Ref/)에 대해서 알아보자.

GCD는 기본적으로 아래의 queue를 가지고 있다.

* **Main**: tasks execute serially on your application’s main thread

* **Concurrent**: tasks are dequeued in FIFO order, but run concurrently and can finish in any order.

* **Serial**: tasks execute one at a time in FIFO order

GCD에 대한 자세한 설명은 워낙에 많으니 자세히 설명하지 않고 간단한 예시만 보여주고자 한다.

일단 swift 이전에 objective-c에서는 아래와 같이 사용한다.

```objective-c
dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
	// do some task
	dispatch_async(dispatch_get_main_queue(), ^{
		// update some UI
	});
});
```

동일한 동작을 swift에서 사용하면 아래와 같다.

```swift
let priority = DISPATCH_QUEUE_PRIORITY_DEFAULT
dispatch_async(dispatch_get_global_queue(priority, 0)) {
	// do some task
	dispatch_async(dispatch_get_main_queue()) {
		// update some UI
	}
}
```

block object의 표현만 차이가 날 뿐 사실상 거의 차이가 없다.

위 코드를 간단히 설명하자면 global queue에서 작업을 수행하고 main queue에서 UI 변경 작업을 하도록 한 코드다.

뭐 크게 사용이 어렵지도 않고 크게 불편하지는 않다. 하지만 이런 과정을 더욱 쉽게 구성할 수 있도록 도와주는 것이 [Async](https://github.com/duemunk/Async)다. 상세한 예시는 해당 사이트를 방문하면 다양하게 소개하고 있다.

그 중에서 Async의 장점을 잘 보여주는 예시를 하나 소개한다.

```swift
let seconds = 0.5
Async.main(after: seconds) {
    println("Is called after 0.5 seconds")
}.background(after: 0.4) {
    println("At least 0.4 seconds after previous block, and 0.9 after Async code is called")
}
```

"Is called after 0.5 seconds" 메시지를 main 스레드에서 0.5초 뒤에 출력한 후 0.4초 뒤 background 스레드에서 "At least 0.4 seconds after previous block, and 0.9 after Async code is called"를 출력하는 예시다. 이 예시를 보면 알 수 있듯이 [Async](https://github.com/duemunk/Async)는 chaining을 지원하며 스레드를 작업 완료에 따라 순차적으로 실행 할 수 있도록 도와준다.

스레드 작업을 취소하는 예시 하나만 더 아래에 소개한다.

```swift
// Cancel blocks not yet dispatched
let block1 = Async.background {
    // Heavy work
    for i in 0...1000 {
        println("A \(i)")
    }
}
let block2 = block1.background {
    println("B – shouldn't be reached, since cancelled")
}
Async.main {
    // Cancel async to allow block1 to begin
    block1.cancel() // First block is _not_ cancelled
    block2.cancel() // Second block _is_ cancelled
}
```

위에서 소개한 것처럼 [Async](https://github.com/duemunk/Async)는 swift에서의 thread 작업을 아주 쉽게 할 수 있도록 도와준다.

한가지 라이브러리를 더 소개하자면 위 라이브러리와는 성격이 조금 다르지만 안드로이드의 AsyncTask 같은 작업이 필요하다면 [SwiftTask](https://github.com/ReactKit/SwiftTask)를 참고해보면 도움이 될 것 같다. [SwiftTask](https://github.com/ReactKit/SwiftTask)는 "Promise + progress + pause + cancel + retry for Swift."라고 소개하고 있다.
