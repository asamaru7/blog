---
layout: post
title: "안드로이드 tap highlight 레이어로 대체하기"
date: 2012-10-03 06:22:02 +0900
comments: true
categories: android
---
오늘은 지난번 [-webkit-tap-highlight-color 사용하기](/2012/09/26/webkit-tap-highlight-color/) 에서 얘기했던 안드로이드 tap highlight 버그를 회피할 수 있는 방법에 대해 포스팅하고자 한다.

일단 기본적인 아이디어는 이렇다. webkit 브라우저는 기본적으로 tap highlight를 숨길 수 있으므로 tap highlight를 투명하게 변경하고 해당 링크의 위치에 원하는 모양의 레이어를 띄우는 것이다. 여기서 또 다른 문제를 함께 해결해야 하는데, 삼성 갤럭시 계열의 스마트폰에서는 숨기는 것 조차 안된다는 것.

그래서 조금 더 꼼수를 부려야 한다. tap highlight가 된다는 것은 결국 이벤트가 전달되기 때문이므로 브라우저에 전달될 이벤트를 가로채서 필요한 처리를 하고 브라우저에게는 이벤트를 전달하지 않는 것이다. (왜 이런 짓을 해야하는지는 위에 링크한 포스팅을 참고바람)

그럼 하나씩 처리 방법을 정리 해보자.

터치를 지원하는 기기는 mousedown, mouseup에 대응되는 touchstart, touchend라는 이벤트가 있다. (사실 대응된다고 하기엔 차이가 있긴하다. 하지만 이해를 쉽게하기 위해 그냥 그렇게 생각하자.)

이 touchstart 이벤트를 사용해서 click 이벤트가 발생하는 것을 막을 수 있다. (touchstart가 발생하지 않으면 click 이벤트도 발생하지 않는다.)

그래서 먼저 안드로이드 기기에서 테스트 다음과 같이 테스트를 해봤다.

링크 객체에서 touchstart 이벤트를 받아 이벤트 버블링과 캡쳐링을 제거하여 이벤트를 전달하지 않고 상위 부모에게 이벤트를 trigger로 강제 생성했다. 결과는.. tap highlight 가 숨겨지지 않았다. 이런 삼성... 사실 특별한 경우가 아니라면 이벤트를 부모에게 전달하지 않아도 된다. click과 같은 효과만 내면 되므로. 하지만 경우에 따라 부모가 touchstart를 받아야 하는 상황이 자주 발생할 수 있다.

부모를 한단계씩 건너뛰며 테스트 해볼 수 있지만 시간 관계상 나는 바로 touchstart를 받아야하는 객체에게 바로 trigger 했다. 결과는 일단 성공. touchstart는 정상적으로 동작하고 tap highlight는 보여지지 않았다.

이제 남은 작업은 링크 객체에 tap highlight를 대신할 레이어를 띄우는 것과 click 이벤트를 대체하는 것이다.

우선 click 이벤트를 대체하는 것에 대해서 생각해보자. 간단하게 생각해서 touchstart에서 바로 click 시 동작할 일을 수행해도 된다. 하지만 이것은 실제 click과 다르다. 테스트 해보면 알겠지만 click은 손가락이 화면에서 떨어질 때 발생한다. 따라서 touchend에서 click 이벤트를 대체해야 한다는 것이다. 문제는 여기서 끝나지 않는다. 터치를 시작하고 swife한 다음 터치를 종료하면 click 이벤트는 발생되지 않아야 한다. 이 문제를 해결하기 위해 touchstart에서 좌표를 기억하고 touchend에서 좌표를 검사하여 swife 되었는지를 확인하고 click 이벤트를 대체해야 한다. 그런데 문제는 끝이 없다. touchstart에서는 좌표를 받을 수 있으나 touchend에서는 좌표를 받을 수 없다. 따라서 touchmove 이벤트에서 좌표의 변경을 추적해야 한다.

다음으로 링크 객체의 위에 tap highlight 대신 레이어를 올리는 방법이다. 이 부분은 간단할 것 같지만 한가지 문제가 있다. 정확하게 링크 객체의 위에 레이어를 올리려면 객체의 위치를 알아야 한다는 것. 이 부분도 여러가지 방법을 통해 알아낼 수 있지만 부모 중에 position:relative 속성을 가진 경우 등 신경써야 할 것이 많다. 하지만 아주 간단한 방법이 있다. 링크 객체의 앞에 레이어 객체를 넣고 position:absolute를 주면 레이어는 공간을 차지하지 않으므로 링크 객체의 위치는 유지되면서도 동일한 좌표에 위치 시킬 수 있다. 단, 당연히 top, left를 따로 지정하지 않아야 한다. 그리고 객체 사이즈는 간단히 구할 수 있으므로 사이즈만 지정해 주면 완료. top, left css 속성을 줄 수 없으므로 상대적인 위치 등의 조정은 margin으로 하면 된다. (예를들어 margin:-2px 0 0 -2px, width:+2px, height:+2px 이런 방법으로 링크객체보다 사방으로 2px 큰 레이어를 정확하게 위치 시킬 수 있다.)

아주 상세히 설명하자면 더 해야 겠지만 이 정도면 원리 정도는 설명했다고 생각된다. 혹 이해가 안되는 부분은 블로그로 문의 바란다.

자 그럼 소스를 첨부한다. 정리를 해야 겠지만 시간 관계상... (그리고 jquery는 기본적으로 사용한다는 가정하에서 제작된 소스다. jquery를 사용하지 않는다면 사용 부분은 수정이 필요하다. 사실 jquery 문제가 아니더라도 범용으로 사용하기 위해 제작되 것이 아니므로 그냥 그대로 가져다 쓸 수는 없으니 참고로만 보면 된다.)

### css 소스

```css
.p_tap_highlight { position:absolute; background-color:#333; -moz-opacity:.30; filter:alpha(opacity=30); opacity:.30; }
```

### js 소스

```javascript
(function() {
    var isAndroid = (navigator.userAgent.toLowerCase().indexOf("android") > -1); //&& ua.indexOf("mobile");
    if(isAndroid) { // 안드로이드 계열에서 탭 하이라이트 위치가 맞지 않아 프로그램으로 대체
    	// 탭 하이라이트 숨김 : 삼성 계열은 소용없음
        $("<style type='text/css'> html, body, body * { -webkit-tap-highlight-color:rgba(0,0,0,0); } </style>").appendTo("head");

        var fcSx=0,fcSy=0;
        var fcEx=0,fcEy=0;
        $(document).on('touchmove',function(event){	// touchmove로 터치 마지막 좌표 추적
            var t=event.originalEvent.targetTouches[0];
            fcSx=t.pageX;
            fcSy=t.pageY;
        });
        $(document).on('touchstart','a',function(event){
            var t=event.originalEvent.targetTouches[0];
            fcSx=fcEx=t.pageX;
            fcSy=fcEy=t.pageY;

            event.preventDefault();
            // touchstart를 사용해야 하는 부모 객체에 이벤트 trigger
            $(event.target).parents('.ui-scrollview-view').triggerHandler('touchstart');
            event.stopPropagation();
            return false;
        }).on('touchend','a',function(event){
        	// 가로/세로 이동 거리의 합이 10 이하인 경우만 click으로 인정(swife 제외를 위함)
            if((Math.abs(fcSx-fcEx)+Math.abs(fcSy-fcEy))<10) {
                var target=$(event.currentTarget);
                // 탭 하이라이트 표시
                $('<div class="p_tap_highlight" style="width:'+(target.width())+'px; height:'+(target.height())+'px;"></div>').insertBefore(target).delay(200).queue(function(){$(this).remove();});
                setTimeout(function(t){ return function(){
                    var href = t.attr('href');
                    if((typeof(href) == 'undefined') || (href == '') || (href == '#')) {    // 이동할 주소가 없을 경우 이벤트 트리거
                        t.trigger('click');
                        return true;
                    }
                    //event.preventDefault();
                    //event.stopPropagation();
                    // 링크 객체의 주소 형태에 맞게 처리
                    if(href.substring(0,1)=='#'){
                        // TODO hash 변경에 따른 처리
                    } else if(href.substring(0,11).toLowerCase()=='javascript:') {
                        eval(href.substring(11,href.length));
                    }
                    window.location.href=href;
                };}(target),10);
                target=null;
            }
            return true;
        });
    }
})();
```