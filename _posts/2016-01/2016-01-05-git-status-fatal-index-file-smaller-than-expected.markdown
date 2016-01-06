---
layout: post
title: "git [fatal: index file smaller than expected] 오류"
date: 2016-01-05T21:00:02+09:00
comments: true
categories: git
---

git를 사용하다 보면 여러가지 이유로 아래와 같은 오류를 만날 수 있다.

```bash
$ git status
fatal: index file smaller than expected
```

이 경우는 git의 index가 훼손된 상태로 size가 0인 경우가 많다.
해결 방법은 훼손된 index를 복구해야 하는데 사실상 복구는 거의 힘들고 대부분 새로 생성해야 한다.

대부분은 아래의 방법을 제시하는 경우가 많다.

```bash
rm .git/index
git add .
```

그런데 위 방법으로 하면 변경 상태가 제대로 복구되지 않고 모두 new로 추가되는 경우가 있다. 따라서 변경 상태를 유지하면서 복구하려면 아래의 방법을 사용한다.

```bash
$ rm .git/index  
$ git reset HEAD .
```

**위 방법들을 적용하기 전에 소스 데이터를 백업하길 권장한다.** 혹시라도 index가 정상적으로 복구되지 않는다면 새로 clone을 받아서 소스 데이터를 복사해주는 방식으로 복구하는 수 밖에 없기 때문이다(내가 아는 범위 내에선).
