---
layout: post
title: "Vagrant box repackage(unpacked box에서 box 파일 만들기)"
date: 2015-12-09 08:17:05 +0900
comments: true
categories: vagrant
---
vagrant box를 생성하는 것에 대해서는 [Vagrant BASE Box 만들기(CentOS 7)](/2015/10/14/creating-a-vagrant-base-box/)에서 설명했었다. 이번에도 box를 생성하는 것에 대한 것이지만 대상이 다르다. 기존 글에서는 생성한 가상 머신을 대상으로 box 파일을 만들었지만 아래에서 설명하고자 하는 것은 `vagrant box add` 명령을 사용하거나 `vagrant up` 명령을 통해 box 파일을 unpacked(~/.vagrant.d/boxes에 보관)한 것을 다시 배포용(distributable) box 파일로 만드는 것이다.

이 방법이 필요한 경우를 예를 들자면 box를 생성하고 unpacked 했지만 box 파일을 배포 경로(원격/로컬)로 이동하지 않고 지워버린 경우에 사용할 수 있다.

vagrant는 이런 경우를 위해 `repackage` 명령을 제공한다. [VAGRANT DOCS : BOX REPACKAGE](https://docs.vagrantup.com/v2/cli/box.html)에는 아래와 같이 설명되어 있다.

>Command: vagrant box repackage NAME PROVIDER VERSION
>
> This command repackages the given box and puts it in the current directory so you can redistribute it. The name, provider, and version of the box can be retrieved using vagrant box list.
>
>When you add a box, Vagrant unpacks it and stores it internally. The original *.box file is not preserved. This command is useful for reclaiming a *.box file from an installed Vagrant box.

`repackage` 명령은 NAME, PROVIDER, VERSION 인자 모두를 지정해야 한다. 각 인자에 어떤 정보를 넣는지 알아보자.

* NAME : `vagrant box list` 명령으로 확인할 수 있는 box명을 지정한다.
* PROVIDER : 가상 머신을 구동하는 PROVIDER를 지정한다.
* VERSION : box의 버전을 지정한다.

우선 실제로 사용하는 예시를 보자.

```bash
$ vagrant box repackage centos7-dev-1 virtualbox 0
```

이 명령을 실행하면 box 파일이 실행한 경로에 생성된다.

예시를 보면 어떻게 사용해야 하는지 이해가 될 것이다. NAME은 별다를 것이 없고 PROVIDER의 경우는 일반적으로 `virtualbox`를 지정한다(box 생성시 virtualbox를 대부분 사용하므로). VERSION의 경우는 별도의 version을 사용하지 않았다면 그냥 0을 입력하면 된다.
