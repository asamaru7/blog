---
layout: post
title: "크로스 브라우저를 지원하는 localStorage 라이브러리 store.js"
date: 2012-09-27 21:59:06 +0900
comments: true
categories: js
---
[store.js](https://github.com/marcuswestin/store.js) HTML5에 포함된 Web Storage 중 localStorage를 다양한 브라우저에서 사용할 수 있게 지원하는 자바스크립트 라이브러리다.

사실 이러한 기능을 제공하는 라이브러리는 이미 다양하게 개발되어 있다. 특히 이름이 [store.js](https://github.com/frankkohlhepp/store-js)로 동일한 라이브러리도 있다.

그럼 기존의 쿠키 등의 방법을 두고 왜 클라이언트에 보관하는 web storage를 사용하는가? 당연히 서버에서 제어가 필요없는 정보를 저장하거나 큰 용량을 저장하고 싶을 떄 사용할 수 있다.

사실 쿠키는 [저장 공간/개수의 한계](http://okjungsoo.tistory.com/entry/%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%B8-%EC%BF%A0%ED%82%A4-%EC%A0%9C%ED%95%9CBrowser-cookie-restrictions)도 있을 뿐아니라 모든 http 요청(도메인이 같은)에 붙어가므로 트래픽이나 네트웍 성능면에서도 좋지 않다. 당연히 셰션키를 제외한 정보를 서버에 보관하는 셰션을 쓰는 것도 가능하겠지만 이건 서버 자원을 잡아먹으니 꼭 필요한 것이 아니라면 그다지 보안도 필요없고 훼손되어도 상관없는 데이터를 보관하는데 사용하기엔 자원이 아깝다.

간단히 정리하자면 크게 중요한 정보가 아니고 보안상 문제될 것이 없고 서버에서 값을 참조할 필요가 없는 정보를 보관하는데 사용하면 된다.

이런 경우가 별로 없다고 생각할 수 있으나 잘 생각해보면 쿠키를 남발해서 여러가지 문제를 일으키는 것보다 이것이 훨씬 유용한 경우들이 있다.

store.js에 대한 소개를 하고자하는 것이니 web storage에 대한 자세한 정보는 여기를 [참고](http://m.mkexdev.net/59)하길 바란다.

자세한 사용법은 <https://github.com/marcuswestin/store.js>에 방문하면 상세히 나와있다. 게다가 별로 복잡한 것도 없다.

내가 여러가지 라이브러리 중 이 라이브러리를 선택한 이유는 정말 다양한 브라우저를 지원하기 때문이다.

> Tested in Firefox 2.0, Tested in Firefox 3.0, Tested in Firefox 3.5, Tested in Firefox 3.6, Tested in Firefox 4.0, Tested in Chrome 5, Tested in Chrome 6, Tested in Chrome 7, Tested in Chrome 8, Tested in Chrome 10, Tested in Chrome 11, Tested in Safari 4, Tested in Safari 5, Tested in IE6, Tested in IE7, Tested in IE8, Tested in Opera 10 (Opera 10.54)

게다가 사용법도 무지하게 간단하다.

```javascript
// Store 'marcus' at 'username'
store.set('username', 'marcus')

// Get 'username'
store.get('username')

// Remove 'username'
store.remove('username')

// Clear all keys
store.clear()

// Store an object literal - store.js uses JSON.stringify under the hood
store.set('user', { name: 'marcus', likes: 'javascript' })

// Get the stored object - store.js uses JSON.parse under the hood
var user = store.get('user')
alert(user.name + ' likes ' + user.likes)
```

아직 일부 브라우저에서 약간의 문제를 가지고 있는 것으로 표기되어 있으나 이 정도면 충분히 만족할만한 수준이라고 생각한다.