---
layout: post
title: "자바스크립트 insertAfter() 구현하기"
date: 2016-12-06 10:53:25 +09:00
comments: true
categories: javascript
---
javascript는 [insertBefore()](http://www.w3schools.com/jsref/met_node_insertbefore.asp)만 제공하고 `insertAfter()` 함수는 제공하지 않는다.

웹 UI 개발시 대부분 [jQuery](https://jquery.com/) 같은 라이브러리를 사용하니 `insertAfter()` 함수를 쉽게 사용할 수 있다. 그런데 추가 라이브러리를 사용할 수 없거나 간단히 이 기능만 필요한 경우가 있다.

아래는 구글 등에서 검색시 주로 발견되는 예시 소스다.

```javascript
Object.prototype.insertAfter = function (newNode) {     
  this.parentNode.insertBefore(newNode, this.nextSibling);
};
// 또는
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
```

그런데 이 방식은 문제가 있다. 다음 노드를 찾는 `nextSibling` 값이 null이 될 수 있기 때문이다(대상이 맨 마지막 노드일때).

따라서 아래와 같이 사용해야 한다.

```javascript
Object.prototype.insertAfter = function (newNode) {     
  if (!!this.nextSibling) {
    this.parentNode.insertBefore(newNode, this.nextSibling);
  } else {
    this.parentNode.appendChild(newNode);
  }
};
// 또는
function insertAfter(referenceNode, newNode) {   
  if (!!referenceNode.nextSibling) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  } else {
    referenceNode.parentNode.appendChild(newNode);
  }  
}
```

여기서도 `parentNode`가 null인 경우에 대해서는 고려되지 않았지만 대부분의 경우 굳이 고려할 필요가 없을 것이다. 필요하다면 이 부분도 추가해주면 된다.
