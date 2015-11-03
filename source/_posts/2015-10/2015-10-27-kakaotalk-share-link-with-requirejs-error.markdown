---
layout: post
title: "카카오톡 링크를 requirejs(AMD)와 함께 사용시 발생하는 오류"
date: 2015-10-27 14:23:28 +0900
comments: true
categories: js
---

어제 고객으로부터 사용중인 페이지에서 카카오톡 링크가 동작하지 않는다는 보고를 받았다.
확인해 보니 안드로이드 크롬 브라우저에서 `탐색이 차단됨: intent:kakaolink://send?appkey=TGIF&appver=1.0&apiver=3.0&linkver=3.5&extras=%7B%2…b.io%22%7D&objs=%5B%5D&forwardable=false#Intent;package=com.kakao.talk;end;`라는 오류를 발생시키면서 기능이 정상적으로 동작하지 않았다. 웃긴건 해당 링크를 빠르게 여러번 클릭하면 한번씩 동작한다는 것. 이 문제는 항상 발생한다기 보다 특수한 경우에 발생하는 것으로 보인다.

아래의 코드를 보자. 오류를 kakao에 전달하기 위해 github에 페이지도 하나 만들어 두었다. https://asamaru7.github.io/requirejs-test/index2.html
그리고 kakao api가 버전업되면 상황이 달라질 수도 있다. 현재는 v1.0.49다.

```javascript
<!DOCTYPE html>
<html>
    <head>
        <script data-main="app2" src="lib/require.js"></script>
        <script type="text/javascript">
        	function test1() {
                requirejs(["kakao"], function(Kakao, print) {
                  Kakao.init('TGIF');
                  Kakao.Link.sendTalkLink({});
                });
        	}
        </script>
    </head>
    <body>
        <h1>탐색이 차단됨 오류 테스트 : 스마트폰에서 테스트</h1>
        <button type="button" onclick="test1();">KAKAO link</button>
    </body>
</html>
```

이 코드를 모바일 크롬 브라우저에서 확인하면 위의 오류를 볼 수 있다.
추정하는 상황은 이렇다. 브라우저에서 팝업창을 열려고 할 경우 사용자의 액션(클릭 이벤트)의 스코프를 벗어나서 `window.open`을 하려고하면 보안상의 이유로 팝업을 기본적으로 차단한다. 이것 또한 동일한 원인으로 예상된다. requirejs를 통해 kakao js를 호출하고 완료되면 동작을 실행하므로 스코프를 벗어나게 된다. 그렇기에 크롬에서 해당 링크를 차단시켜버리는 것으로 추정하고 있다. 현재로써는 이 문제를 해결하려면 kakao js의 호출과 init을 액션(클릭 이벤트)이 발생하기 이전에 해주는 방법 밖에 없다.

이 부분에 관련한 오류 보고를 개발자 센터에 등록했지만 kakao에서도 어쩔 수 없을 것으로 생각된다.

**하지만 정작 하고자 하는 이야기는 지금 부터다.**

사실 이 문제를 확인하다가 다른 오류를 만났다. 이와 관련된 오류 보고는 이미 수개월 전에 [kakao 개발자 센터에 보고](https://devtalk.kakao.com/t/amd-requirejs/10948)되어 있었다.

요약하자만 이렇다. AMD(requirejs)를 사용해서 Kakao 모듈을 로드하고 나면 그 후 최초로 호출(require)되는 모듈은 `Uncaught Error: Mismatched anonymous define() module: function (){return dt}` 오류가 나면서 불려지지 않는다. 이를 해결하는 방법은 오류 보고에서 나왔던 것 처럼 dummy 모듈을 kakao 모듈 호출 후 한번 불러주는 것이다. 실제로 효과가 있고 나 또한 이렇게 임시 처리해서 서비스 중이다(찜찜하지만 현재로써는 다른 방법이 없다). 정확하게 이야기하자면 js 호출 시점이 문제가 아니라 init 함수 호출 직후부터 위 문제가 발생한다.

아래는 샘플 코드다. 이대로 넣으면 안되고 어떻게 처리하는지 흐름만 참고하기 바란다. 중요한 포인트는 init 직후 DUMMY 모듈을 한번 호출한다는 것이다. 당연히 DUMMY는 정의되지 않은 모듈이다. 불필요한 js 호출이 싫다면 실제로 dummy를 만들어 두고 호출해도 상관없다. 그리고 아래 코드에서는 kakao js를 호출하는 부분이 빠져있는데 당연히 불러줘야 한다.

```javascript
if (typeof kakaoApiInit == 'undefined') {
	window.Kakao.init('apikey');
	kakaoApiInit = true;
	try { require(['DUMMY'], function () {}); } catch(e) {};
}
window.Kakao.Link.sendTalkLink(data);
```

**사실 당황스러운 것은 이런 오류가 발생한다는 것보다 관련된 오류 보고가 수개월 전에 되었음에도 불구하고 아직 해결이되지 않았다는 것이다.** kakao 개발자 측에서는 오류 재현이 되지 않으니 샘플 코드를 올려달라는 것이다. 이미 문제를 제기한 사람이 정확한 상황을 제시 했음에도 불구하고 재현을 하지 못한다니... 의아스럽다.

처음엔 나도 일단은 그냥 이대로 두려고 했다. 하지만 아무래도 찝찝해서 오늘 시간을 내서 kakao에서 원하는 샘플 코드를 친절히(?) 작성해서 오류 보고에 댓글로 추가해 두었다. 앞으로의 kakao의 대응을 지켜보겠지만 사실 이미 실망스럽다. 비단 이번 오류가 아니더라도 예전에도 다수의 kakao api 오류를 접해 본 입장에서 다수가 사용하게되는 api에서 어이없는 오류가 발생하고 대처가 미흡하다는 점이 실망스럽다는 것이다. 그래서 안쓰고 싶지만 고객이 원하니 그럴수도 없고...

어쨌든 빠르게 수정되기를 바라며 혹시 동일한 문제를 겪는 개발자가 있다면 위의 방법대로 임시 처리라도 하기 바란다.

**첨언 : 2015/10/30**

얼마전 KAKAO로 부터 답변을 받았다. 보내준 샘플을 확인해서 문제가 될만한 부분을 찾았으며 다음번 패치에 수정이 되도록 하겠다고 한다. 다만 "탐색이 차단됨" 문제는 오류 재현이 되지 않아 확인을 못했다고하여 기종과 브라우저 버전 등에 대한 상세 정보를 다시 보냈다.
