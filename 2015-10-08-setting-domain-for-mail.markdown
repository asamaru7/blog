---
layout: post
title: "setting domain for mail"
date: 2015-10-08 12:08:41 +0900
comments: true
categories: Tip
---
# 메일 발송 도메인 설정

## Reverse DNS 설정

서버에 대한 인증으로 서버당 1개를 등록 가능 : 망사업자측에서 설정(전체 네트워크를 소유하지 않은 경우)

- rDNS 설정 가능여부 : 부산ktidc, 김해GDC 에서 직접 설정 불가


> 등록 방법 : [아래]  
> ① http://dns.kornet.net 사이트 접속  
> ② 도메인 등록 요청/문의 클릭  
> ③ 새글작성 클릭  
> ④ 게시물 유형 -> 리버스 등록, 소속 -> idc 체크, 나머지 정보 기입후 등록  
> rDNS 관련 연락처 : 02-3674-5820  

> 현재 211.216.72.65(coregisul.kr), 61.104.227.199(mmail.coregisul.kr) 등록되어 있음  
> 현재 상기 두개의 서버에서만 메일이 발송됨

## SPF 등록

- DNS zone 설정에 추가
```
@   IN TXT      "v=spf1 ip4:211.216.72.65 ip4:211.216.72.67 ip4:61.104.227.199 ~all"
```

## DMARK 등록

- DNS zone 설정에 추가
```
_dmarc  IN TXT      "v=DMARC1; p=none; rua=mailto:mail@bang9app.com"
```

## 화이트도메인 등록

> https://www.kisarbl.or.kr/

- "White Domain 등록" 메뉴에서 내용 작성 후 등록
- KISA의 제약사항에 의해 등록이 되지 않을 경우 KISA의 안내대로 dns의 spf를 수정하여 심사 후 원하는 형태로 변경

## DKIM 등록

### http://dkimcore.org/tools/

* 도메인 입력후 생성
* 생성된 내용을 적용

#### CZFramework 설정
```
CZFramework/custom/production/EncryptKey/main.XX.json.cfg
```

```
CZFramework/custom/production/Module/Mail.XX.json.cfg
```

#### DNS zone 설정에 추가
```
bang9app._domainkey       IN TXT      "v=DKIM1;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD1XQnE9NshKY1VA/MSGXauGZFubm+FJtfphKoiQqknI2RXxKwQwGVkMOwBFl/MEjSyH/+e1nVE90rl6sCqwxjZEOx7N36zPs1h80QDu8OKQfKqMOMkk/Wzf4B1JFRIGqAfq7IMehBMLyCJ6btOGtbYAwbAWW29TlP3gB1/tbMDrQIDAQAB"
```


### 직접 생성

#### RSA 키 생성

```
openssl genrsa -out private.key 1024
openssl rsa -in private.key -pubout -out public.key
```

#### DNS 정보 생성
> http://www.dnswatch.info/dkim/create-dns-record

------

### 기타 유틸

키 유효성 검사
> http://www.protodave.com/tools/dkim-key-checker/  
> http://dkimcore.org/tools/keycheck.html  
  

DKIM 수신 유효성 검사
> http://www.brandonchecketts.com/emailtest.php


동일하게 유지
> MacBook-Pro:~ yyj$ host 211.216.72.65
> MacBook-Pro:~ yyj$ host mail.coregisul.kr

sender-id 위저드
> http://www.microsoft.com/mscorp/safety/content/technologies/senderid/wizard/

스팸체커
> http://isnotspam.com/
> http://www.mail-tester.com/