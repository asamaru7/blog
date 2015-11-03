---
layout: post
title: "ANSI text를 HTML로 변환하기"
date: 2015-10-26 14:38:36 +0900
comments: true
categories: ["tip", "linux"]
---
지난 글 [PHP를 CLI에서 사용시 ANSI Colors 적용하기](/2015/10/23/php-cli-ansi-colors/)에서 php cli에서 ANSI를 사용해서 출력하는 것에 대해 설명했었다. 이번엔 ANSI text를 HTML로 변환하는 것에 대해서 설명하려고 한다.
이게 왜 필요할까? ANSI는 shell에서만 색상이 적용되므로 해당 내용을 text 파일로 저장해서 다른 곳에서 열어보면 ANSI code가 그대로 보이거나 일반 text로 보인다. 따라서 결과물을 색상을 포함해서 다른 곳에 공유하기가 어렵다.
나의 경우는 ANSI를 html로 변환해서 chrome에서 열고 pdf로 출력헤서 사용했다.

그럼 본론으로 들어가서 어떻게 하면 되는가? 여러가지 방법이 있다. PHP를 사용하는 방법, Bash script를 사용하는 방법, 특정 프로그램을 사용하는 방법 등 많지만 오늘은 그 중에서 몇가지만 소개하려고 한다.

우선 지난 번에 PHP에서 ANSI를 생성하는 것을 설명했으니 PHP 부터 보자.

[ansi-to-html](https://github.com/sensiolabs/ansi-to-html) 라이브러리를 사용해서 변환할 수 있다. 자세한 설명은 해당 사이트를 참고하면 자세히 나와 있다.

다음은 Bash script.

[converting ANSI to HTML. How to convert to html the colored shell output](http://pablomarin-garcia.blogspot.kr/2011/04/converting-ansi-to-html-how-to-convert.html)를 참고하면 Perl CPAN을 사용하는 방법과 [ansi2html.sh from pixelbeat](http://www.pixelbeat.org/scripts/ansi2html.sh) Bash script를 사용하는 방법을 안내하고 있다.
하지만 이 스크립트는 크게 권장하고 싶지는 않다. 간단한 내용엔 문제가 되지 않는데 text 양이 많아지니 너무 느렸다(300kb 가량).

마지막으로 [aha](https://github.com/theZiz/aha)를 사용하는 방법이다. 링크를 따라가면 github의 aha repository를 볼 수 있다. 설명은 설치 방법만 나와 있는데 아주 심플하다. 그래서 아래에 직접 사용한 방법을 조금 더 설명하겠다.

centos 기준으로 아래와 같이 설치가 가능하다. 우분투라면 `sudo apt-get install aha`로 설치가 가능하다고 설명하는 사람이 있는데 확인은 못했다.

```bash
$ su -
$ git clone https://github.com/theZiz/aha.git
$ make
$ install
```

사용법은 help를 보면 아래와 같이 나온다.

```bash
Ansi Html Adapter Version 0.4.8.0
aha takes SGR-colored Input and prints W3C conform HTML-Code
use: aha <options> [-f file]
     aha (--help|-h|-?)
aha reads the Input from a file or stdin and writes HTML-Code to stdout
options: --black,      -b: Black Background and White "standard color"
         --pink,       -p: Pink Background
         --stylesheet, -s: Use a stylesheet instead of inline styles
         --iso X,    -i X: Uses ISO 8859-X instead of utf-8. X must be 1..16
         --title X,  -t X: Gives the html output the title "X" instead of
                           "stdin" or the filename
         --line-fix,   -l: Uses a fix for inputs using control sequences to
                           change the cursor position like htop. It's a hot fix,
                           it may not work with any program like htop. Example:
                           echo q | htop | aha -l > htop.htm
         --word-wrap,  -w: Wrap long lines in the html file. This works with
                           CSS3 supporting browsers as well as many older ones.
         --no-header,  -n: Don't include header into generated HTML,
                           useful for inclusion in full HTML files.
Example: aha --help | aha --black > aha-help.htm
         Writes this help text to the file aha-help.htm

Copyleft Alexander Matthes aka Ziz 2015
         zizsdl@googlemail.com
         http://ziz.delphigl.com/tool_aha.php
This application is subject to the MPL or LGPL.
```

간단한 사용법은 다음과 같다. 기타 옵션들은 몇가지 안되니 바로 보면 된다(사실상 사용할 일이 거의 없을 거 같다).

```bash
$ ls -ahl | aha > result.html

# 또는

$ aha -f {ANSI 파일} > result.html
```

나는 이 방법을 사용했다. 일단 c로 만들어져서 그런지 속도가 아주 빠르다. 하지만 한가지 단점이 있다. 표준 ANSI만 지원하는 것 같다. aixterm 에서 사용하는 속성들은 결과에서 무시되었다. 예를들어 글자색은 30-37 만 사용 가능하다.

구글에서 ansi to html 이라고 검색하면 보다 다양한 방법들이 있으니 필요하다면 한번 검색해보길 바란다.
