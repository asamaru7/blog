---
layout: post
title: "VirtualBox VM과 Vagrant 다시 연결하기"
date: 2016-12-06 21:46:09 +09:00
comments: true
categories: vagrant
---

[vagrant](https://www.vagrantup.com/)를 사용하던 중 [VirtualBox](https://www.virtualbox.org/)와의 연결을 잃어버린 경우 `vagrant up`을 하게되면 새로운 vm을 자동으로 만들게 된다. 나의 경우는 실수로 ".vagrant" 폴더를 지워버리는 바람에 연결이 끊어져 버렸다.

당연히 [vagrant](https://www.vagrantup.com/)가 다시 vm을 만들어도 기본 환경은 모두 구성되어 있으니 크게 문제될 것이 없어야하는 것이 정상이나 나의 경우는 vm 안에 저장된 샘플 데이터를 다시 구성하기 귀찮아서 다시 연결할 방법을 알아보았다.

다시 연결하는 방법은 의외로 간단하다.

* "Vagrantfile" 파일이 있는 폴더(vagrnat up을 실행하는 곳)로 이동한다.
* `VBoxManage list vms` 명령을 실행해서 기존 vm의 ID를 확인한다.

```bash
$ VBoxManage list vms
"virtualMachine" {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
```

* ".vagrant/machines/default/virtualbox" 폴더로 이동한다. 없다면 이 경로로 폴더를 만든다.
* 파일명이 "id"인 파일을 만들어서 내용에 "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"(위에서 조회한 대상 vm의 ID)를 넣고 저장한다. 혹시라도 기존 파일이 있는 상태라면 수정하고 그 외 파일들은 지운다.

끝났다. 이제 다시 `vagrant up`을 실행하면 기존 vm에 연결된 상태로 정상적으로 실행될 것이다.
