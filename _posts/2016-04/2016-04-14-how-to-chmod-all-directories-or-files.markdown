---
layout: post
title: "chmod로 권한 변경시 디렉토리(또는 파일)만 적용하기"
date: 2016-04-14 19:00:43 +09:00
comments: true
categories: linux
---
chmod로 디렉토리 또는 파일의 권한을 변경할 때 하위에 포함된 파일들까지 일괄 적용을 하기 위해 `-R` 옵션을 사용할 수 있다. 그런데 이 경우는 하위의 모든 디렉토리와 파일에 적용된다. 아래는 하위의 디렉토리만 또는 파일만 적용하도록 하는 방법을 안내한다.

```bash
# 하위 디렉토리만 포함
find /path/to/base/dir -type d -exec chmod 755 {} +
chmod 755 $(find /path/to/base/dir -type d)
find /path/to/base/dir -type d -print0 | xargs -0 chmod 755

# 하위 파일만 포함
find /path/to/base/dir -type f -exec chmod 644 {} +
chmod 644 $(find /path/to/base/dir -type f)
find /path/to/base/dir -type f -print0 | xargs -0 chmod 644
```

출처 : [How to chmod all directories except files (recursively)?](http://superuser.com/a/91938)

여러가지 방법이 있으니 상황에 따라 골라서 사용하면 된다.

---

위 주제와 관련있는 내용은 아니지만 덤으로 chown 사용시 기존에 지정된 사용자에 따라 적용 여부를 결정할 수 있는 명령도 아래에 안내한다.

```bash
# chown 특정 사용자만 변경
chown --from=root.root web.usergroup * -R
chown --from=511 -R web *
```
