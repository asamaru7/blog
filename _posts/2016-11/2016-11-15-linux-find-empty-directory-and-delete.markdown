---
layout: post
title: "리눅스에서 모든 빈 디렉토리 찾기 / 지우기"
date: 2016-11-15 15:00:34 +09:00
comments: true
categories: linux
---
리눅스에서 지정한 디렉토리 하위의 모든 빈 디렉토리를 찾거나 지우려면 어떻게 하면 될까?

[find](https://linux.die.net/man/1/find) 명령을 사용하면 아주 간단히 해결할 수 있다.

```bash
find . -empty -type d -delete -print
```

위 명령을 사용하면 현재 폴더 하위의 모든 빈 디렉토리를 찾아 출력하고 지운다.

빈 디렉토리를 찾기만 하려면 `-delete`를 제외하면 되고 반대로 출력없이 모두 지우려면 `-print`를 제외하면 된다.

폴더를 지정하려면 당연히 `.` 대신에 원하는 경로를 넣으면 되고 [find](https://linux.die.net/man/1/find)의 다양한 옵션을 사용해서 원하는 조건을 추가해서 처리 할 수 있다.
