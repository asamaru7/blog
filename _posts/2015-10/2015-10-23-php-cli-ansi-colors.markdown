---
layout: post
title: "PHP를 CLI에서 사용시 ANSI Colors 적용하기"
date: 2015-10-23 20:46:06 +0900
comments: true
categories: php
---
php를 CLI(shell 환경)에서 사용시 처리 과정을 확인하기 위한 로그나 결과를 `echo` 등을 사용해서 출력하는 방법을 사용할 것이다.

보통 shell script 작성시 python이나 bash script를 많이 사용하지만 php 프로그램과 연결된 작업을 해야 하거나 php가 손에 익어서 편할 경우 등 여러가지 이유로 php를 shell에서 사용하는 경우도 많다.

실제로 나는 가급적 프로세스 처리는 bash를 사용하고 간단한 작업은 python으로 하려고 하지만 php가 아무래도 손에 익은지라 조금 복잡한 작업은 php 프로그램과 무관하더라고 php를 사용하는 경우가 많다.

나는 이런 작업 과정에서 출력되는 내용을 보기 좋게 표현하는 부분이 항상 불만이었다. 몇 줄 안나오는 문제면 상관없지만 다량의 로그가 출력되는 작업시에는 중요한 부분을 조금더 잘 보이게 할 방법이 필요했다. 그래서 여러 줄을 띄우거나 탭을 들여쓰는 등의 방법을 주로 사용했었다.

그런데 오늘도 이런 작업을 하던 중에 갑자기 [ANSI escape code](https://en.wikipedia.org/wiki/ANSI_escape_code) 중 [ANSI Color](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)가 생각났다(왜 이제야 이런 것이 있다는 것을 떠 올렸는지 모르겠다). 직접 구현해도 되겠지만 아무래도 귀찮을 듯해서 검색을 해봤더니 생각보다 많은 자료를 찾을 수 있었다. 역시 사람들은 비슷한 생각을 하나보다.

아래는 이번에 찾은 자료들의 목록이다.

* [PHP CLI Colors – PHP Class Command Line Colors (bash)](http://www.if-not-true-then-false.com/2010/php-class-for-coloring-php-command-line-cli-scripts-output-php-output-colorizing-using-bash-shell-colors/)
* [superbrothers/ansi-color.php](https://gist.github.com/superbrothers/3431198)
* [Generating Command Line Colors with PHP](http://softkube.com/blog/generating-command-line-colors-with-php)
* [PHP port of Term::ANSIColor](http://blog.ianty.com/php/ansicolor/)

나는 이 중에서 맨마지막의 [PHP port of Term::ANSIColor](http://blog.ianty.com/php/ansicolor/)를 선택했다. 필요에 맞게 아주 약간의 수정을 해서 사용해 봤는데 다양한 형식을 지원해서 나름 만족스럽다.

혹시 php를 CLI에서 사용할 일이 있다면 한번쯤 사용해 보기를 추천한다. 위의 라이브러리들을 굳이 쓰지 않더라도 소스 코드를 조금만 보면 ANSI를 적용하는 방법을 알 수 있으니 보기 좋은 결과물을 원할때 써보기 바란다.
