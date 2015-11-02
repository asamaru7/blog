---
layout: post
title: "iOS 9 : The resource could not be loaded because the App Transport Security policy requires the use of a secure connection 오류"
date: 2015-10-19 09:24:41 +0900
comments: true
categories: iOS
---
iOS 9을 대상으로 개발시 아래와 같은 오류를 만날 수 있다.

```
ERRO AppDelegate[application(_:didFinishLaunchingWithOptions:):32]: Optional(Error Domain=NSURLErrorDomain Code=-1022 "The resource could not be loaded because the App Transport Security policy requires the use of a secure connection." UserInfo={NSUnderlyingError=0x7fddb1cb34b0 {Error Domain=kCFErrorDomainCFNetwork Code=-1022 "(null)"}, NSErrorFailingURLStringKey=http://yourdomain.com/session/get, NSErrorFailingURLKey=http://yourdomain.com/session/get, NSLocalizedDescription=The resource could not be loaded because the App Transport Security policy requires the use of a secure connection.})
```

iOS 9과 OS X 10.11 이후에 App Transport Security 정책이 추가되어 발생하는 오류로 관련된 정보는 [App Transport Security Technote](https://developer.apple.com/library/prerelease/ios/technotes/App-Transport-Security-Technote/index.html)에서 자세히 볼 수 있다. 안내에 나와 있듯이 현재 개발중인 기능이라 추후 변경 가능성이 있다고 되어있다.

> App Transport Security is a feature that improves the security of connections between an app and web services. The feature consists of default connection requirements that conform to best practices for secure connections. Apps can override this default behavior and turn off transport security.
>
> Transport security is available in iOS 9.0 or later, and in OS X v10.11 and later.

해결방법은 아래와 같다.

Info.plist 파일에 NSAppTransportSecurity 항목을 추가해서 필요한 설정을 해준다. NSAppTransportSecurity의 구조는 아래와 같다.

| Key | Type |
|-----|------|
| NSAppTransportSecurity | Dictionary |
| &nbsp; NSAllowsArbitraryLoads | Boolean |
| &nbsp; NSExceptionDomains | Dictionary |
| &nbsp;&nbsp;&nbsp;&nbsp; &lt;domain-name-for-exception-as-string&gt; | Dictionary |
| &nbsp;&nbsp;&nbsp;&nbsp; NSExceptionMinimumTLSVersion | String |
| &nbsp;&nbsp;&nbsp;&nbsp; NSExceptionRequiresForwardSecrecy | Boolean |
| &nbsp;&nbsp;&nbsp;&nbsp; NSExceptionAllowsInsecureHTTPLoads | Boolean |
| &nbsp;&nbsp;&nbsp;&nbsp; NSIncludesSubdomains | Boolean |
| &nbsp;&nbsp;&nbsp;&nbsp; NSThirdPartyExceptionMinimumTLSVersion | String |
| &nbsp;&nbsp;&nbsp;&nbsp; NSThirdPartyExceptionRequiresForwardSecrecy | Boolean |
| &nbsp;&nbsp;&nbsp;&nbsp; NSThirdPartyExceptionAllowsInsecureHTTPLoads | Boolean |

정확하게 설명하자면 두가지 방법이 있다.

* NSAppTransportSecurity > NSAllowsArbitraryLoads를 추가해서 NSAllowsArbitraryLoads 값을 YES로 넣어준다.
  * 앱 내의 모든 네트워크 통신에 대한 제한을 푼다.
* NSAppTransportSecurity > NSExceptionDomains를 추가하고 세부항목을 설정한다.
  * 지정된 도메인의 네트워크 통신에 대한 제한을 푼다.
  * NSExceptionMinimumTLSVersion: TLS 최소 버전을 문자열로 입력한다. 아래 값들 중 하나를 넣을 수 있거나 생략할 수 있다.
    * TLSv1.0
    * TLSv1.1
    * TLSv1.2 (생략할 경우의 기본값)
  * NSExceptionRequiresForwardSecrecy: forward secrecy 라는 비밀키 암호화 설정이다. 기본으 YES이며 NO를 선택시 사용할 수 있는 ciphers 목록은 아래와 같다.
    * TLS_RSA_WITH_AES_256_GCM_SHA384
    * TLS_RSA_WITH_AES_128_GCM_SHA256
    * TLS_RSA_WITH_AES_256_CBC_SHA256
    * TLS_RSA_WITH_AES_256_CBC_SHA
    * TLS_RSA_WITH_AES_128_CBC_SHA256
    * TLS_RSA_WITH_AES_128_CBC_SHA
  * NSExceptionAllowsInsecureHTTPLoads: HTTPS(SSL) 연결이 아니더라도 통신을 허용 것인지에 대한 설정이다. 기본값은 NO이다.
  * NSIncludesSubdomains: 이 사이트의 하부도메인들에도 이 설정을 적용할 것인지에 대한 설정이다. 기본값은 NO이다.
  * NSThirdPartyExceptionMinimumTLSVersion: 써드파티 TLS 버전을 설정한다.
  * NSThirdPartyExceptionRequiresForwardSecrecy: 써드파티 Forward Secrecy 설정이다.
  * NSThirdPartyExceptionAllowsInsecureHTTPLoads: 써드파티 HTTPS 연결을 강제를 할 것이지에 대한 설정이다.

필요에 따라 방법을 선택하면 된다.
