---
layout: post
title: "OSX : shell script 실행하는 app 파일 만들기"
date: 2016-04-06 19:51:12 +09:00
comments: true
categories: osx
---
OSX를 사용하다 보면 자주 사용하는 shell script를 app으로 생성해 두고 싶을 때가 많다. 예를들어 나의 경우는 기본 chrome에는 개인 계정을 연결해서 사용하고 chrome의 data 저장 경로를 별도로 지정해서 회사 계정을 연결해서 사용한다. 아래는 주제에서는 벗어나지만 chrome의 data 저장 경로를 별도로 지정해서 실행하는 방법이다.

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/chrome/subva/ > /dev/null 2>&1 &
```

위 스크립트를 파일로 저장해두고 필요할 경우만 shell에서 실행해서 사용하는데 매번 터미널을 여는 것이 귀찮다. 그래서 기존에는 `Automator`를 사용해서 app 파일을 만들어 사용했다([Executing Shell Scripts from the OS X Dock?](http://stackoverflow.com/a/281455) 참고). 그런데 이 app을 만드는 것이 복잡하지는 않아도(사실 무척 간단하다) 귀찮은지라 더 간단한 방법이 없는지 찾아봤다.

[How to create simple Mac apps from shell scripts](https://mathiasbynens.be/notes/shell-script-mac-apps)라는 글에 보면 아래의 스크립트를 소개하고 있다.

```bash
#!/usr/bin/env bash

APPNAME=${2:-$(basename "$1" ".sh")}
DIR="$APPNAME.app/Contents/MacOS"

if [ -a "$APPNAME.app" ]; then
  echo "$PWD/$APPNAME.app already exists :("
  exit 1
fi

mkdir -p "$DIR"
cp "$1" "$DIR/$APPNAME"
chmod +x "$DIR/$APPNAME"

echo "$PWD/$APPNAME.app"
```

위 스크립트를 사용해서 shell 스크립트를 간단하게 app으로 변환(생성) 할 수 있다. 그런데 이 글이 오래되었다는 것이 함정이다. 몇 버전부터 인지는 모르지만 엘 케피탄에서 생성된 app을 실행하면 아래와 같은 오류가 나면서 실행이 되지 않는다.

>PowerPC 응용 프로그램이 더 이상 지원되지 않기 때문에 ‘~~~.app’ 응용 프로그램을 열 수 없습니다.

위 스크립트를 개선하고 변형한 여러 소스들([alexbarton/appify](https://github.com/alexbarton/appify) 등)을 github 등에서 찾을 수 있으나 대부분 동일한 오류를 낸다.

또 다른 방법은 [Platypus](http://www.sveinbjorn.org/platypus)를 사용하는 것이다.

![Platypus](/img/2016/04/2016-04-06-how-to-create-simple-mac-apps-from-shell-scripts-1.png)

Platypus의 경우는 아주 다양한 활용이 가능하다. 여러가지 스크립트를 지원하며 앱 아이콘도 바로 지정 가능하다. 자세한 내용은 [Platypus 공식 사이트](http://www.sveinbjorn.org/platypus)를 참고하자.

그런데 Platypus의 경우는 지정한 스크립트가 종료되어도 앱은 종료되지 않아서 내가 원하는 결과를 얻지 못했다.

그래서 결론적으로 내가 선택한 방법은 기존처럼 `Automator`를 사용하는 것이다.
