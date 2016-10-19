---
layout: post
title: "Mac 에서 git 사용시 한글 파일명 문제"
date: 2016-10-19 17:51:22 +09:00
comments: true
categories: ["osx", "git"]
---

맥에서 git 사용시 파일이 한글로되어 있을 경우 해당 파일을 제대로 인식하지 못하는 문제가 있다. 맥에서의 한글 문제야 어제 오늘의 문제도 아니긴 하지만 한글 파일명을 사용해야 할 경우는 상당히 불편하다. 방법을 예전부터 찾고 있었는데 얼마전 우연히 관련 자료를 찾았다. 그래서 간단히 해결 방법만 남긴다.

```bash
git config --global core.precomposeunicode true
git config --local core.precomposeunicode true
```

> [Git Documentation](http://git-scm.com/docs/git-config)
>
> **core.precomposeUnicode**
>
> This option is only used by Mac OS implementation of Git. When core.precomposeUnicode=true, Git reverts the unicode decomposition of filenames done by Mac OS. This is useful when sharing a repository between Mac OS and Linux or Windows. (Git for Windows 1.7.10 or higher is needed, or Git under cygwin 1.7). When false, file names are handled fully transparent by Git, which is backward compatible with older versions of Git.
