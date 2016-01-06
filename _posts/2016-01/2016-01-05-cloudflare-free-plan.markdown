---
layout: post
title: "CloudFlare Free Plan"
date: 2016-01-05T23:29:14+09:00
comments: true
categories: tip
---
블로그를 Github Pages를 이용해 운영하면서 [CDN](https://ko.wikipedia.org/wiki/%EC%BD%98%ED%85%90%EC%B8%A0_%EC%A0%84%EC%86%A1_%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC)을 적용하려고 여러가지를 알아보고 있었다. 사실 Github 자체가 기본적으로 CDN을 사용하고 있는 것으로 안다. [USE A CDN ON GITHUB PAGES](https://helloanselm.com/2013/use-a-cdn-on-github-pages/)에서도 그렇게 설명하고 있다. 그리고 이 글에서는 그럼에도 불구하고 CDN을 별도로 붙이는 것이 필요한 이유도 설명하고 있다.

사실 나의 경우엔 페이지 로딩 속도에 큰 불만이 있는 것이 아니므로 굳이 별도의 CDN을 붙여야 할 이유는 없지만 CDN 적용을 테스트 해보기 위한 용도로 적용을 고려중이었다.

예전부터 소문으로 들었던 [CloudFlare](https://www.cloudflare.com/)를 적용해보려고 틈틈이 조사를 해오고 있었다. 사실 장점이야 너무나도 잘 알려져 있으므로 문제가 생길 수 있는 단점 부분을 주로 조사를 하다보니 몇가지 신경쓰이는 것들이 보였다. 우선 이 부분들을 이야기하기 전에 잘 알려진 장점부터 간략히 이야기하고자 한다(관련성이 있어서).

* 무료다. 아주 강력한 장점이다. CDN 서비스를 무료로 사용할 수 있다니.
* 대역폭 / 트래픽 제한이 없다.
* 서버 유입 트래픽을 절감해준다.
* DNS 서비스를 제공한다. 서브 도메인별로 선택적으로 CDN을 적용할 수 있다.
* **DDoS 공격을 방어해준다.**
* 응답 속도를 높여준다(해외에 서버가 있거나 해외로 서비스 해야하는 경우에 효과적이다).
* 무료 플랜에서도 SSL을 사용할 수 있다.
* 서버 정지 상태에서는 캐시된 데이터를 사용해 서비스를 유지시켜 준다.
* 보안 강화. 실제 서비스 서버가 cloudflare 뒤로 숨겨지므로 이에 따른 보안 설정을 통해 보안을 강화할 수 있다.

이 외에도 활용 상황/방법에 따라 여러가지가 있을 수 있겠지만 국내에서는 대부분 호스팅 서비스의 트래픽 절감을 위해 가장 많이 사용하는 것으로 보인다.

그렇다면 단점은 무엇이 있을까? 일반적인 CDN의 용도를 생각한다면 단점은 거의 없다고 본다. 대부분 더 좋은 환경을 위해서 사용하는 부가 요소이니 단점이 많다면 사용할 이유가 없을 것이다. 하지만 cloudflare를 무료로 사용하게 아래와 같은 제약사항이 존재한다.

* 업로드에 제한(100M)이 있다. 무료일 경우에.
* 크롤링 주기가 1주일로 길다.
* 캐싱 정책 설정을 할 수 없다.

이 외에도 더 있는지는 모르겠지만 잘 알려진 것은 이 정도다. 그런데 이 정도의 문제라면 정적 리소스에 CDN을 적용하는데에는 큰 제약사항이 되지 않는다.

하지만 다른 문제들에 대한 이야기가 많이 거론되고 있다. 대표적인 것이 한국에서 접속했음에도 한국 CDN 서버를 사용하지 않고 해외 CDN 서버를 사용해서 서비스가 더 느려지는 경우가 있다는 것이다. "[cloudflare CDN 위치가 원래 오락가락 하나요?](https://www.xpressengine.com/qna/22994192)"라는 글에서 사례가 언급되었는데 다른 곳에서도 비슷한 내용들이 보이고 있다. 사실 이 부분에 대해서는 검토가 필요한 부분이라고 생각한다. 요즘 잘나가는 모바일 앱의 서비스가 ip를 조회해보니 cloudflare를 사용하고 있었다. 위 문제가 심각하다면 해당 모바일 앱이 서비스를 운영하는데 문제가 발생 했을텐데 관련 이슈를 본 적이 없다.

그리고 오늘 다른 부분을 찾아보다가 찾게된 글이 "[CloudFlare의 DDOS 공격 보호?](https://blog.ryush00.me/archives/121)"이다. 여기서 보면 익히 알고있는 것과 달리 무료 플랜의 경우엔 DDoS 방어가 제한적이라는 것이다. 실제로 cloudflare의 사이트를 보면 "[Does CloudFlare offer DDoS protection to Free and Pro plans?](https://support.cloudflare.com/hc/en-us/articles/200170186-Does-CloudFlare-offer-DDoS-protection-to-Free-and-Pro-plans-)"라는 글에서 이 부분을 안내하고 있다.

결론적으로 보자면 cloudflare를 적용하는 것이 옳은 선택이라고 생각된다. 문제가 될 수 있는 이슈가 있지만 적용 사례들을 종합적으로 보자면 현재까지는 cloudflare의 대안을 찾을 수 없다. 단, 무료 사용에 한해서다.

---

마지막으로 ["CloudFlare's Free CDN and You"](https://blog.cloudflare.com/cloudflares-free-cdn-and-you/)에서 언급된 cloudflare에 대한 설명 중 일부를 참고용으로 발췌하여 아래에 첨부한다.

>**What kind of static content does CloudFlare cache?**
>CloudFlare caches common static content file extensions, including JavaScript, CSS and images. The full list of what CloudFlare caches can be found here.

>**Does CloudFlare cache dynamic content, such as HTML or PHP?**
CloudFlare does not currently cache these content types.

간단히 이야기하자면 cloudflare는 html, php와 같은 동적 콘텐츠는 cache하지 않고 JavaScript, CSS, image와 같은 정적 파일만 cache 처리한다는 것이다. 따라서 적용 도메인에 정적 콘텐츠와 동적 콘텐츠가 섞여 있더라도 알아서 구분하여 처리한다는 뜻이다.
정적 콘텐츠에 해당하는 파일 확장자 리스트는 [Which file extensions does CloudFlare cache for static content?](https://support.cloudflare.com/hc/en-us/articles/200172516-What-file-extensions-does-CloudFlare-cache-for-static-content-)에 안내되어 있다.

하지만 필요하다면 cloudflare Page Rule을 사용해서 cache 하도록 지정할 수 있다고 한다(HTTP header를 설정을 통해 cache를 지정할 수 있다는 이야기도 있으나 정확한 메뉴얼을 아직 찾지 못했다).
