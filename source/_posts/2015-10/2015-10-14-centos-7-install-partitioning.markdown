---
layout: post
title: "Centos 7 설치시 파티셔닝"
date: 2015-10-14 11:44:41 +0900
comments: true
categories: linux
---
Linux 설치 과정에서 고민되는 것 중 하나가 파티션닝이다. 크게 중요하지 않은 상황이라면 자동으로 설정해주는 것을 그대로 사용하는 것이 편하긴하다. 설치 후에도 파티션을 변경할 수 있는 경우도 있으나 일반적으로 Linux를 서버로 사용하는 경우 동적으로 변경하는 상황은 흔치 않기 때문에 처음 설치시 신중하게 설정하는 것이 좋다.

파티셔닝은 서버의 사용 용도 등에 따라 파티션별 파일시스템의 종류와 용량이 많은 차이를 보일 수 있으므로 참고만 하고 자신이 직접 고민을 해보는 것이 좋을 것이다.

아래의 내용은 [RED HAT ENTERPRISE LINUX 7 Installation Guide : Manual Partitioning](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Installation_Guide/sect-disk-partitioning-setup-x86.html#sect-custom-partitioning-x86)을 기준으로 정리하고자 한다(CentOS 7 기준이지만 대부분의 Linux에서도 비슷할 것이다). 따라서 자세한 내용을 보려면 해당 문서를 자세히 읽어보기를 권한다(아래는 간단하게 필요한 부분만 발췌헤서 간단히 개인적인 의견을 적은 것이다).

## 파티션의 분할

'6.13.4.5. Recommended Partitioning Scheme'에서 권장하는 파티션 분할은 아래와 같다.

* /boot partition - recommended size at least 500 MB
* / (root) partition - recommended size of 10 GB
* /home partition - recommended size at least 1 GB
* swap partition - recommended size at least 1 GB

위의 파티셔닝은 말그대로 그냥 권장일뿐 상황에 따라서 바뀔 수 있다. 예를들어 나는 간단한 서버인 경우
home 파티션을 구분하지 않고 boot와 swap만 지정하고 나머지 모두를 /에 할달해서 사용한다(관리 편의상).

그런데 swap은 사람들마다 용량에 대한 의견에 차이가 많은 파티션 중 하나다. 우선 참고할만한 글은 아래와 같다.

* [리눅스 스왑메모리 크기 권고
](http://zetawiki.com/wiki/%EB%A6%AC%EB%88%85%EC%8A%A4_%EC%8A%A4%EC%99%91%EB%A9%94%EB%AA%A8%EB%A6%AC_%ED%81%AC%EA%B8%B0_%EA%B6%8C%EA%B3%A0)
* [CentOS 5 Documentation : Swap Space](https://www.centos.org/docs/5/html/Deployment_Guide-en-US/ch-swapspace.html)
* [RED HAT ENTERPRISE LINUX 7 Installation Guide : Manual Partitioning](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Installation_Guide/sect-disk-partitioning-setup-x86.html#sect-custom-partitioning-x86) 중 '6.13.4.5. Recommended Partitioning Scheme'

아래는 RED HAT ENTERPRISE LINUX 7 Installation Guide에 안내된 내용을 가져온 것이다. 일반적인 상황이라면 아래의 기준치를 참고해서 정하면된다. 하지만 서비스를 위한 서버라면 일반적으로 swap 자체가 사용되는 상황을 최대한 없애야 하기 때문에 swap 용량을 많이 책정할 이유는 없다.

| Amount of RAM in the system | Recommended swap space | Recommended swap space if allowing for hibernation |
|--------|--------|--------|
| less than 2 GB | 2 times the amount of RAM | 3 times the amount of RAM |
| 2 GB - 8 GB | Equal to the amount of RAM | 2 times the amount of RAM |
| 8 GB - 64 GB | 0.5 times the amount of RAM | 1.5 times the amount of RAM |
| more than 64 GB | workload dependent | hibernation not recommended |

## 파일시스템의 선택

CentOS 7은 기본 파일시스템으로 xfs를 사용한다(CentOS 6의 경우 ext4가 기본 파일시스템 이었다). xfs는 데비안 계열의 배포판에서 오래전부터 기본 파일시스템으로 사용하던 것으로 대용량 파일을 지원하며 오랜시간 타 리눅스 배포판에서 사용되면서 안정성이 입증되었다고 판단한 것으로 보인다. 다른 파일시스템도 지원하므로 선택은 자유다. 자세한 내용은 메뉴얼에도 나와있고 찾아보면 많은 자료를 쉽게 찾을 수 있다.
나의 경우는 파일시스템의 경우 특별한 이유가 있지 않는한 해당 OS에서 기본으로 사용하는 파일시스템을 사용한다.

## 정리

앞서 설명할때는 고민을 많이 해야 한다고 했는데 글을 적고 보니 너무 간단한 느낌이다. 사실 아주 고성능과 고가용성이 필요한 서버가 아니라면 위의 내용 정도만 생각해줘도 크게 무리는 없다는 생각이다. 자세히 설명하자면 파티션별 사이즈, 파일시스템 하나 하나에 대해서 설명해야 하는데 그러려면 책이 한권이다. 따라서 그 이상이 필요하다면 메뉴얼을 참고하면 관련 사항들을 하나씩 더 찾아보기 바란다.

