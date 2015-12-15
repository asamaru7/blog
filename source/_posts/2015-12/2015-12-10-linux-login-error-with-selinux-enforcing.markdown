---
layout: post
title: "selinux enforcing 후 로그인이 되지 않을 때 복구 방법(CentOS 7)"
date: 2015-12-10 10:58:10 +0900
comments: true
categories: linux
---
이 글은 특수한 상황에 대한 이야기다. 하지만 여러가지 경우에 대한 설명이 포함되어 있어 향후 비슷한 상황에 대한 대처를 위해 남겨둔다.

일단 상황은 이렇다. CentOS 7을 selinux가 disabled 상태로 운영하던 중 selinux를 enforcing 상태로 변경해서 재시작했다. 그후로 부팅은 되나 모든 계정으로 로그인을 할 수 없었다.

**이 상황의 발생 원인을 먼저 설명하자면 selinux가 켜지면서 권한 문제로 shell이 /etc/passwd와 /etc/shadow에 접근할 수 없어 로그인을 할 수 없었던 것이다.**

이런 상황이 왜 발생했을까? selinux가 꺼진 상태에서 운영하다가 켜서 재시작하게되면 파일에 대한 selinux rule이 적용하는 과정을 거치게 된다(이로인해 변경 후 최초 시작시 시간이 오래 걸리면 적용이 끝나면 다시 한번 재부팅된다). 이 과정이 정상적으로 완료되었었다면 위 문제가 발생하지 않았겠지만 나의 경우는 내가 설정해 놓은 다른 옵션으로 인해 문제가 발생했다.

나의 경우는 보안상의 이유로 `chattr +i /etc/passwd`, `chattr +i /etc/shadow`를 적용한다. 그런데 내가 이걸 잊고 그냥 selinux만 켠 것이다. 그로인해 재시작시 두 파일에 대한 selinux rule이 적용되지 못했던 것이다.

로그인을 할 수 없었기 때문에 파일 상태를 확인할 수 없어 single mode로 부팅해서 확인해야 했다.
single mode 부팅에 관련해서는 [CENTOS 7 싱글모드 부팅](http://linux.systemv.pe.kr/centos-7-%EC%8B%B1%EA%B8%80%EB%AA%A8%EB%93%9C-%EB%B6%80%ED%8C%85/)에서 잘 설명하고 있다(CentOS 7부터 Grub2로 변경되었다고 한다. 그래서 처음엔 어떻게 single mode 부팅을 해야할지 몰라서 당황했다). 요약하자면 부팅 메시지가 나왔을 때 `e`를 눌러 편집 모드로 들어가서 `ro`가 나오는 부분을 찾아서 `rw init=/sysroot/bin/sh`로 변경한다(찾기가 어려울 수 있다. `ro`로 시작하는게 아니라 명령줄 내에 ` ro `라고 된 부분이 있다. 나의 경우는 linux16 /vmlinuz-3.10.0-~~ 으로 시작하는 라인에 있었다). 수정 후에는 `crtl+x`를 눌러서 부팅한다. 부팅이 되고나면 실제 서버의 `/`는 `/sysroot`로 마운트되어 있다. 따라서 `chroot /sysroot`를 하면 기존 서버처럼 `/` 경로로 변경할 수 있다. 사실 꼭 필요하진 않다. 경로가 헛갈리지 않도록 작업하기 위해서 한다.

single mode로 들어가서 일단 selinux를 끄고(permissive 모드 사용) 다시 부팅했다(여기서 바로 변경해도 되었을 수 있지만 확인을 위해서 일단 다시 부팅했다). 부팅 후 아래와 같이 확인했다.

```bash
$ ls -Z /etc/passwd
-rw-r--r--. root root system_u:object_r:unlabeled_t:s0 /etc/passwd
```

원래는 `/etc/passwd`는 `passwd_file_t`가 되어야 한다. 그런데 `unlabeled_t`로 되어있어 제대로 로그인 할 수 없었던 것이다. 그래서 `restorecon`를 사용해서 아래처럼 복구하려고 했다.

```bash
$ restorecon -v /etc/passwd
restorecon reset /etc/passwd context system_u:object_r:unlabeled_t:s0->system_u:object_r:passwd_file_t:s0
restorecon set context /etc/passwd->system_u:object_r:passwd_file_t:s0 failed:'Operation not permitted'
```

그런데 위와 같은 오류가 났다. 아마도 selinux를 켜고 최초 부팅시에도 동일한 오류로 인해 정상적으로 rule이 적용되지 않았을 것이다. 그래서 아래와 같이 다시 처리했다.

```bash
$ chattr -i /etc/passwd
$ chattr -i /etc/shadow
$ restorecon -v /etc/passwd
$ restorecon -v /etc/shadow
```

이제 다시 재부팅하면 기존처럼 로그인이 잘 된다. 아직 selinux를 잘 다루지 못해 발생한 문제이지만 덕분에 여러가지를 알게 되었다. 사실 다행히 이 문제를 vagrant로 띄운 가상 머신에서 겪어서 다양하게 시도해 보면서 좋은 경험을 했다.
