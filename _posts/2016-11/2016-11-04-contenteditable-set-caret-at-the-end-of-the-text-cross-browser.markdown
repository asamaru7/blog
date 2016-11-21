---
layout: post
title: "contenteditable이 설정된 개체의 시작 또는 끝에 커서(Caret) 넣기"
date: 2016-11-04 12:21:39 +09:00
comments: true
categories: "js"
---

이번에 [MediumEditor](https://github.com/yabwe/medium-editor)를 사용하면서 추가 기능을 개발하던 중 편집 개체에 내용을 추가하는 처리가 필요했다. 커서가 편집 개체 내부에 있다면 [pasteHTML()](https://github.com/yabwe/medium-editor/blob/master/API.md#pastehtmlhtml-options) 함수를 간단하게 처리가 된다. 그런데 커서가 편집 개체 밖에 있을 경우엔 넣을 수 없다. 그래서 프로그램에서 커서를 넣어줘야 하는데 fucus를 이용하면 맨 앞으로 들어가서 원하는 결과를 얻을 수 없었다. 그레서 방법을 찾던 중 [contenteditable, set caret at the end of the text (cross-browser)](http://stackoverflow.com/a/4238971/6736772)라는 글에서 방법을 찾았다.

`contenteditable="true"`가 설정된 개체의 시작 또는 끝에 커서(Caret) 넣는 방법은 아래와 같다.

```javascript
function createCaretPlacer(atStart) {
    return function(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(atStart);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(atStart);
            textRange.select();
        }
    };
}

var placeCaretAtStart = createCaretPlacer(true);
var placeCaretAtEnd = createCaretPlacer(false);
```

이를 활용해 [MediumEditor](https://github.com/yabwe/medium-editor)에 적용하는 코드는 아래와 같다.

```javascript
if (editor.exportSelection() == null) {
	var placeCaretAtEnd = createCaretPlacer(false);
	placeCaretAtEnd(document.getElementById(id));
}
editor.pasteHTML(html);
```

[exportSelection](https://github.com/yabwe/medium-editor/blob/master/API.md#exportselection)를 사용해서 커서가 편집 개체 안에 있는지를 검사해서 커서가 없다면 맨 마지막에 필요한 html 코드를 추가한다.
