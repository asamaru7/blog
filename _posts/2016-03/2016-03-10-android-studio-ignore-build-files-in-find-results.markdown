---
layout: "post"
title: "Android Studio : Find results에서 build files 제외하기"
date: "2016-03-10T19:30:12+09:00"
comments: true
categories: android
---
Android Studio로 작업을 하다보면 많은 불편함을 겪게 된다. 그중에 하나가 원하는 문자열을 찾기 위해 사용하는 "Find in Path"(<kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>) 메뉴다. PHPStorm은 exclude 기능을 이용해서 원하지 않는 폴더를 프로젝트에서 제외해 둘 수 있다. 같은 회사에서 만들었음에도 불구하고 Android Studio에는 비슷한 기능이 없다. 그로 인해서 Find로 프로젝트 전체에서 검색시 build 폴더 등이 포함되어 원하는 결과를 찾기가 무척 힘들다(특히 R.java, log 파일등이 포함되면). 이 문제를 해결할 방법은 없는가?

![Android Studio Find in path](/img/2016/03/android_studio_find_in_path.png)

일반적인 방법으로 "File name filter"를 이용해서 java, xml 등의 파일만 지정하는 것도 가능하지만 그래도 build 폴더 등을 제외하기는 쉽지 않다. 또는 "Scope > Directory"에서 소스 폴더를 지정하는 방법도 있으나 서브 모듈들이 다수 포함되어 있거나 libs 폴더 등도 함께 검색하고자 한다면 원하는 결과를 얻기 어렵다.

그럼 build 시에 생성되는 파일들이 저장되는 intermediates, generated 폴더를 제외시키는 방법을 알아보자([Ignore R.java files in Find results](http://stackoverflow.com/a/32238593)).

* "Find in Path" 다이얼로그를 연다(<kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>).
* "Scope > Custom"을 선택하고 우측에 "..."을 선택한다.
* "Scopes" 다이얼로그가 나타나면 좌측 상단에 "+"를 선택한다.
* "+"를 선택하면 "Local / Shared"를 선택하라고 나오는데 아무것이나 선택해도 된다. 사실은 아직 두개의 차이를 모르겠다. 처음엔 Shared를 선택하면 다른 프로젝트에서도 사용할 수 있을 것이라 생각했는데 되지 않았다.
* Scope 이름을 넣는 다이얼로그가 나오면 원하는 이름("ExcludeIntermediates")을 넣는다.
* 새로운 Scope가 생성되었다면 "Pattern:" 란에 `!file:*intermediates*/&&!file:*generated*/`을 입력하고 "OK"를 선택한다.

> Custom 메뉴에 보면 보다 다양하게 범위를 지정할 수 있는 기능들이 있으니 활용해 보는 것도 좋을 것이다.

![Android Studio Find in path](/img/2016/03/android_studio_find_in_path_2.png)

이제부터는 "Find in Path"에서 "Scope > Custom > ExcludeIntermediates"를 선택하고 검색하면 intermediates, generated를 제외한 폴더에서만 검색된 결과가 나온다. 설명을 보면 알겠지만 추가적으로 제외하고 싶은 폴더가 있다면 규칙을 추가하면 된다.

---

안드로이드 스튜디오를 이용한 개발은 정말 고난의 연속이다.
