---
layout: post
title: "북마클릿(bookmarklet) 생성기"
date: 2015-10-12 19:58:04 +0900
comments: true
categories: tip
---
[Bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet)은 브라우저에 새로운 기능을 추가하는 자바스크립트 명령을 포함한 브라우저 북마크다.
표준으로 정의된 형식은 없으나 일반적으로 아래와 같은 형태를 가진다.

```javascript
javascript:(function(){
  //Statements returning a non-undefined type.
})();
```

북마클릿에 대해 상세히 설명할 내용은 없다. 북마클릿을 사용해서 할 수 있는 일은 무궁무진하다. 단, 브라우저에 사용자가 직접 추가해야하며 직접 북마크를 눌러 실행해야 한다. 예를들어 핀터레스트에서는 "Pin it" 기능을 [The Pin It button](https://about.pinterest.com/en/goodies) 북마클릿으로 제공하고 있다.

마지막으로 북마클릿을 쉽게 만들수 있도록 도와주는 도구를 소개하고자 한다.

**[Bookmarklet Generator](http://bookmarklet.asamaru.net/)**

여러가지 도구가 있지만 이게 가장 직관적인 것 같다. 이 도구는 [bookmarklet generator](http://web-development.cc/bookmarklet-generator/)을 fork하여 jquery 버전만 수정했다. 기존 프로젝트는 사용중인 jquery의 버전이 낮아서 만들어진 북마크릿이 정상 동작하지 않는다. 향후 시간이 된다면 불편한 부분들을 개선하도록 하겠다.