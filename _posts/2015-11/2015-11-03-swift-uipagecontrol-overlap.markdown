---
layout: post
title: "Swift UIPageViewController에서 UIPageControl 오버랩하기"
date: 2015-11-03 17:12:21 +0900
comments: true
categories: ios
---

UIPageViewController 사용시에 하단에 현재 페이지의 위치를 알려주는 UIPageControl가 별도의 공간을 차지하고 표시된다.

![UIPageControl](/img/2015-11-03-swift-uipagecontrol-overlap-1.png)

이 부분의 공간을 제거하고 내용 페이지의 위에 오버랩하려면 아래와 같이 `viewDidLayoutSubviews`에 필요한 소스를 추가하면 된다. 기본적으로 UIPageControl는 투명이라 자연스럽게 덮힌다.

```swift
class PageViewController: UIPageViewController {
  override func viewDidLayoutSubviews() {
		// UIPageControl overlap
		let v = self.view
		let subviews = v.subviews
		var sv: UIView? = nil
		var pc: UIView? = nil
		for t: UIView in subviews {
			if (t.isKindOfClass(UIScrollView)) {
				sv = t
			} else if (t.isKindOfClass(UIPageControl)) {
				pc = t
			}
		}
		if ((sv != nil) && (pc != nil)) {
			sv!.frame = v.bounds
			v.bringSubviewToFront(pc!)
		}
		super.viewDidLayoutSubviews()
	}
}
```

Objective-c에서의 처리 방법은 [How do I make the bottom bar with dots of a UIPageViewController translucent?](http://stackoverflow.com/a/24851985)를 참고.
