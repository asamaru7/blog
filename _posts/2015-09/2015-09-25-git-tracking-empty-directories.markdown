---
layout: post
title: "Git : 빈 디렉토리 추가하기"
date: 2015-09-25 10:47:30 +0900
comments: true
categories: git
---
기존에는 SVN을 주로 사용하다가 최근 Git를 사용하기 시작했다. 맛보기를 시작한지는 조금 됐는데 본격적으로 사용하려고하니 아직 많이 미숙하다.

오늘은 작업을 하다가 빈 디렉토리를 추가하려고 하니 동작을 하지 않았다. SVN에서는 당연히 추가가 가능했는데 Git에서는 add로 추가해도 new file로 나타나지 않았다.

그래서 찾아보니 원래 Git는 빈 디렉토리는 Tracking 하지 않는다는 글들을 보게되었다. 이런... 불필요한 것을 관리하지 않는 것은 좋지만 log 디렉토리 등과 같이 빈 디렉토리가 추가되어야 할 상황이 있는데 어떻게 하지?

다행히 간단한 방법이 있었다. 사실 간단히 생각하면 아무 파일이나 넣어서 빈 디렉토리가 되지 않으면 되지 않는가? 그래서 많이 사용하는 방법이 .gitignore 또는 .keep 파일을 넣어서 Tracking하는 것이다.

해당 폴더에 가서 아래의 명령으로 .keep 파일을 만들고 add 하면 된다.

```bash
touch .keep
```

한번에 모든 폴더를 검사해서 .keep 파일 넣기.

```bash
git clean -nd | sed s/'^Would remove '// | xargs -I{} touch "{}.keep"
```

log 폴더와 같이 정말 빈 디렉토리만 존재하고 내부에 생성되는 파일은 Tracking할 필요가 없을 때는 .gitignore 파일을 만들고 아래의 내용을 넣는다.

```
#ignore all files in this dir...
*
#... except for this one.
!.gitignore
```