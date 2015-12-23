---
layout: post
title: "NIC I/F 번호(eth*)를 변경"
date: 2015-10-08 12:06:26 +0900
comments: true
categories: linux
---
NIC 교체 및 추가 시 MAC 정보와 H/W 정보가 변경되어 /etc/sysconfig/network-script/ifcfg-ethX 파일이 증가한다.
이때 기존의 I/F 번호를 변경하려면 /etc/udev/rules.d/70-persistent-net.rules의 기존 정보 삭제 및 신규 I/F의 NAME을 변경하고 Rebooting 하면 된다.