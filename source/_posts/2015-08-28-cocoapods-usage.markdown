---
layout: post
title: "CocoaPods 사용법"
date: 2015-08-28 06:34:30 +0900
comments: true
categories: ios
---
설치
---

```bash
[sudo] gem install cocoapods
pod setup
```

사용법
----

### 패키지 검색

> http://cocoapods.org/

### Podfile 설정

```bash
cd 프로젝트 폴더
vi Podfile
```

아래의 내용입력.

	platform :ios, '7.0'
	pod 'HZWebViewController', '~> 0.0.2'

### Pod 설치

```bash
pod install
```

### Pod 업데이트

```bash
pod update
```

실행
---

	프로젝트명.xcworkspace

프로젝트명.xcodeproj가 아닌 프로젝트명.xcworkspace로 프로젝트를 열어야 정상적으로 빌드 및 실행이 된다.


> 참고 : http://www.shako.net/blog/archives/224
