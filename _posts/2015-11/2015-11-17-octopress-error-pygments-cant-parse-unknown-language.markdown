---
layout: post
title: "Octopress : pygments cant parse unknown language: </p> 오류"
date: 2015-11-17 14:40:02 +0900
comments: true
categories: octopress
---
Octopress에서 `rake generate`를 하다보면 아래와 같은 오류를 만나는 경우가 있다.

```
jekyll 2.5.3 | Error:  Pygments can't parse unknown language: </p>
```

Pygments는 소스코드 하이라이팅을 해주는 모듈인데 언어를 알 수 없다고 오류를 내는 것이다. markdown에서 소스코드는 \`\`\`로 시작하고 그 뒤에 붙여서 언어 종류를 지정할 수 있다(\`\`\`ruby 와 같이).

위 오류가 발생한다는 것은 여기에 문제가 있다는 것인데 오류 메시지만 보면 어디서 발생하는 것인지 짐작이 안된다. 그래서 최근에 작성한 글을 다 둘러볼 수 밖에 없다. 그래서 찾아봤더니 [Octopress Error: Pygments Can’t Parse Unknown Language: &lt;/p&gt;](http://reckhhh.github.io/blog/2015/05/01/octopress-error-pygments-cant-parse-unknown-language/)라는 글에서 방법을 알려주고 있었다. 정확하게는 오류를 해결해 주는 것이 아니라 위치를 조금 더 찾기 쉽게 해준다.

결론은 `plugins/pygments_code.rb`을 열어서 다음의 부분을 수정하면 된다(`#{code}`를 추가하는 것이다).

```ruby
rescue MentosError
raise "Pygments can't parse unknown language: #{lang}#{code}."
end
```

이렇게 하면 위 오류가 날 때 해당 코드 영역을 함께 출력해준다.

사실 나의 경우엔 위 오류가 발생하는 경우의 대부분이 "\`\`\`ruby 파일명" 형식을 사용할 때 발생했다. GFM에서는 이 형식을 지원하기 때문에 간혹 사용하려는데 이게 제대로 해석이 안되는 경우가 많다. 그렇다고 항상 안되는 것도 아니다. 원인은 알 수 없으나 octopress가 이럴 땐 맘에 들지 않는다.
