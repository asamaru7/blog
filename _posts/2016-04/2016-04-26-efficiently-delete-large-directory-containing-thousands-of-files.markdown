---
layout: post
title: "linux에서 대량의 파일을 보다 빠르게 지우기"
date: 2016-04-26 21:53:55 +09:00
comments: true
categories: linux
---
주기적으로 실행되는 스케쥴 중에 대량의 파일을 삭제해야 하는 작업이 있었다. 데이터 수집 등의 작업으로 누적된 로그/캐시 파일들을 작업 완료 후 삭제를 해야하는 작업이었다. 그런데 파일의 수가 워낙에 많다보니 지우는 작업에 소요되는 시간이 너무 길었다. 어차피 서비스 서버가 아니고 스케쥴로 처리되는 작업이니 시간이 조금 오래 걸려도 큰 문제될 것은 없었으나 그래도 시간을 조금이라도 줄여보고자 자료를 찾아보다 [Efficiently delete large directory containing thousands of files](http://unix.stackexchange.com/questions/37329/efficiently-delete-large-directory-containing-thousands-of-files)라는 글을 찾았다.

위 글에서 제시하는 방법은 [rsync](https://en.wikipedia.org/wiki/Rsync)를 이용해서 빈 폴더와 동기화시키는 방법으로 파일들을 삭제하는 것이다. 이게 큰 차이가 있을까 싶었으나 위 글 외에도 여러 곳에서 이 방법을 제시하고 있다.

```bash
$ rsync -a --delete _empty/ target_directory/
```

대량의 파일을 지울 일이 있다면 한번쯤은 시도해 보는 것도 괜찮을 것 같아 소개해 본다.

추가적으로 아래와 같이 병렬 삭제를 하는 것도 방법이라고 한다. 하지만 위 방법이 훨씬 나을 것으로 본다.

```bash
$ find target_directory -maxdepth 3 | tac | xargs -d \n -P 5 -n 5 rm -rf
```
