---
layout: post
title: "linux buffer/cache 비우기"
date: 2016-01-19T21:45:22+09:00
comments: true
categories: linux
---

예전에 [리눅스에서 swap 메모리 초기화](/2015/10/02/linux-how-to-clear-memory-swap/)에서 swap 메모리를 비우는 방법을 남겼다. 이번엔 swap이 아닌 "buff/cache"를 비우는 방법을 남기고자 한다.

linux에서 `top` 또는 `free` 명령으로 메모리 상황을 보면 "buff/cache" 항목이 있다. 이 부분은 실제로 직접 사용하고 있는 메모리가 아니라 말그대로 버퍼와 캐시에 사용된 메모리를 뜻한다. 그렇다면 "굳이 왜 이것을 비우려고 하는가?"하는 의문이 생길 수 있다.

일반적으로 캐시는 느린 장치의 데이터를 빠른 장치에 임시 보관해두고 사용함으로써 성능을 높이는 것이 목적이다. 따라서 캐시는 당연히 사용하는게 좋다. 하지만 hit(적중률)가 낮은 경우엔 캐시를 사용하는 것이 부정적인 영향을 미칠 수 있다. 빠른 장치는 당연히 공간이 한정되어 있기 때문에 모든 정보를 캐시할 수 없으므로 캐시를 관리해야 한다. 이 과정에서 발생하는 비용이 캐시를 사용하는 것보다 크다면 캐시는 사용하지 않는 것이 좋다는 것이다. 캐시에 관한 자세한 내용은 여기서 다루고자하는 것이 아니니 이정도만 설명하고 넘어가자.

실질적으로 이것이 어디에 필요한지에 대해 알아보자.

linux에서는 기본적으로 디스크 상의 파일을 읽을 경우 해당 파일을 닫아도 free 메모리로 모두가 즉시 반환되지 않는다. 이유는 이 파일의 정보를 다음 사용에 대비해 cache하기 때문이다. 보다 자세한 내용을 확인하고 싶다면 [메모리 관리 (Memory Management)](https://wiki.kldp.org/Translations/html/The_Linux_Kernel-KLDP/tlk3.html)를 참고하자. 이런 파일의 cache와 관련하여 os / mysql 등 여러 분야의 성능 튜닝 내용 등을 쉽게 찾을 수 있다.

대량의 파일이 관리되는 서버의 파일 cache hit가 낮은데 비해 buffer / cache 메모리 사용량이 높을 경우 해당 cache 기능을 끄거나 주기적으로 비움으로써 성능을 개선할 수 있다.

우선 아래와 같이 선택적으로 cache를 비울 수 있다. `sync` 명령을 사용하는 이유는 해당 cache 기능을 비우기 전에 사용중인 데이터를 sync하기 위한 것이다.

pagecache 비우기

```bash
sync
echo 1 > /proc/sys/vm/drop_caches
# 또는
sync
sysctl -w vm.drop_caches=1
```

dentries, inodes 비우기

```bash
sync
echo 2 > /proc/sys/vm/drop_caches
# 또는
sync
sysctl -w vm.drop_caches=2
```

pagecache, dentries, inodes 모두 비우기

```bash
sync
echo 3 > /proc/sys/vm/drop_caches
# 또는
sync
sysctl -w vm.drop_caches=3
```

위에서 1,2,3으로 지정한 값들은 영구적 설정이 아니라 설정되는 그 시점에만 적용된다. 바꿔서 이야기 하자면 `/proc/sys/vm/drop_caches`는 파일이 아니라 명령어인 셈이다. 실제로 아래와 같이 기본값인 0으로 되돌리려고하면 오류가 난다.

```bash
$ echo 0 > /proc/sys/vm/drop_caches
-bash: echo: write error: 부적절한 인수
```
