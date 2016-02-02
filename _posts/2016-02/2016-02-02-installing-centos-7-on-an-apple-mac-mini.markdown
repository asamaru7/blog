---
layout: post
title: "구형 애플 맥 미니 CentOS 7 서버로 재활용하기"
date: 2016-02-02T12:37:47+09:00
comments: true
categories: ["linux", "osx"]
---
회사에서 맥북 프로를 새로 구매하면서 맥 미니(2012년형)가 한대 남게 되었다. 사실은 다른 이유로 2대가 남게 되었는데 한대는 예비로 그냥 두고 한대를 서버로 사용하기로 했다. 그래서 설치 방법을 찾아보다 [Installing CentOS 7 on an Apple Mac Mini](http://drewcdecker.me/2014/08/installing-centos-7-on-an-apple-mac-mini/)를 찾았다. 그런데 이 글에서는 [CentOS 7](https://www.centos.org/)을 바로 설치할 수 없어 CentOS 6.5를 설치 후 7으로 업데이트하는 방법을 안내하고 있었다. 이 방법은 개인적인 취향상 선택하기 싫었다. 그래서 조금 더 찾다보니 [Create a bootable CentOS USB drive with a Mac (OS X) for a PC](http://www.myiphoneadventure.com/os-x/create-a-bootable-centos-usb-drive-with-a-mac-os-x)라는 글이 있었다. 여기서는 맥 설치용 CentOS 7 부트 USB를 만드는 법을 설명하고 있어서 이 글을 참고해서 작업을 시작했다.

---

우선 [CentOS 7용 iso 이미지](https://www.centos.org/download/)를 내려 받는다. 나는 minimal을 선호하기 때문에 위 글의 설명과 달리 minimal을 다운 받았다.

해당 이미지가 있는 폴더에 가서 아래와 같이 dmg 파일을 우선 생성한다. 당연히 맥에서 작업해야 한다.

```bash
$ hdiutil convert -format UDRW -o target.img CentOS-7-x86_64-Minimal-1511.iso

Master Boot Record(MBR : 0) 읽는 중...
CentOS 7 x86_64                 (Apple_ISO : 1) 읽는 중...
(Type EF : 2) 읽는 중...
.
CentOS 7 x86_64                 (Apple_ISO : 3) 읽는 중...
....................................................................................................................................................................
경과 시간: 661.204ms
속도: 912.0Mbytes/초
저장: 0.0%
created: /Users/yjyou/Downloads/target.img.dmg
```

부트 이미지를 담을 USB를 연결한 다음 아래와 같이 `diskutil`을 사용해서 disk 번호를 확인한다.

```bash
$ diskutil list

/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:          Apple_CoreStorage Macintosh HD            250.5 GB   disk0s2
   3:                 Apple_Boot Recovery HD             650.0 MB   disk0s3
   4:                  Apple_HFS DATA                    248.8 GB   disk0s4
/dev/disk1 (internal, virtual):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:                  Apple_HFS Macintosh HD           +250.1 GB   disk1
                                 Logical Volume on disk0s2
                                 55AC6B2F-B3B4-450F-B4DE-E025311E9955
                                 Unencrypted
/dev/disk2 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *15.8 GB    disk2
   1:                        EFI EFI                     209.7 MB   disk2s1
   2:       Microsoft Basic Data USB                     15.6 GB    disk2s2
```

나의 경우는 `/dev/disk2`에 mount 되어 있었다. **이후의 과정에서는 당연히 자신에게 맞는 disk 번호를 사용해야 한다.**

우선 USB를 unmount 한다.

```bash
$  diskutil unmountDisk /dev/disk2

Unmount of all volumes on disk2 was successful
```

이제는 실제로 위에 만든 dmg 이미지를 이용해서 부트 USB를 만든다.

```bash
$ time sudo dd if=target.img.dmg of=/dev/disk2 bs=1m

602+1 records in
602+1 records out
632262656 bytes transferred in 155.872514 secs (4056281 bytes/sec)

real	2m36.025s
user	0m0.006s
sys	0m2.548s
```

이미지를 만드는데 시간이 조금 소요되니 걱정하지 말고 기다리자. 그리고 생성되고 나면 해당 디스크를 인식할 수 없다고 자동적으로 추출된다. 이제는 USB를 빼서 설치할 맥 미니에 연결하고 부팅한다. 당연히 `alt/option`를 누르고 부팅해서 부팅 디스크를 선택하는 화면으로 진입해야 한다.

이후 과정을 진행하기 전에 파티션의 변경이 필요하다면 미리 맥 미니 내에서 설정해 두어야 한다. 나의 경우를 보자면 500G의 디스크를 2개의 파티션으로 나누고 복구 파티션까지 3개가 있었다. 처음엔 복구 파티션을 두고 두개의 파티션을 CentOS 설치 과정에서 묶으려고 했는데 복구 파티션이 두개 파티션 사이에 위치해 합칠 수 없었다. 그래서 맥에서 두개의 파티션을 합쳐주고 다시 설치했다. 사실은 이 과정은 복구 파티션을 두려고 했던 것인데 실제 CentOS를 설치하면서 복구 파티션도 날렸다(원하지 않았지만). 이렇게되면 위 과정이 필요없었을 수 있지만 혹시나해서 남겨둔다.

이제부터는 일반적으로 CentOS를 설치하는 것과 동일하게 설치하면 된다. 설치 방법이 궁금하다면 [CentOS 7 minimal 설치](http://blog.asamaru.net/2015/10/14/centos-7-minimal-install/)를  참고해도 된다.

마지막으로 중요한 부분이 있다. 파티션 설치시 `/boot/efi`을 별도로 지정해야 한다는 것이다. 일반적인 설치에서는 하지 않던 작업인데 맥 미니의 경우 해당 파티션이 기본적으로 없어서 그런 것인지 지정하지 않으면 파티셔닝이 완료되지 않았다. `/boot/efi`의 용량은 최소 100MB를 지정하도록 권장하는 것 같다. 이 부분 또한 자동 파티셔닝이 아닌 사용자 지정 파티션을 사용해서 발생한 문제일지도 모르겠다. 하지만 개인적인 생각으로 "맥 미니에서 다른 CentOS 설치시 잘 안되는 경우는 이것 때문이지 않을까?"해서 경험을 남겨둔다.

이후부터는 정말 CentOS 설치와 동일하다(일단 나의 경우엔).
