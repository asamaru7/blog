---
layout: post
title: "Mysql: Table 'name' is specified twice, both as a target for 'UPDATE' and as a separate source for data 오류 해결"
date: 2016-05-30 20:55:10 +09:00
comments: true
categories: db
---

아래의 Query는 계층형 카테고리에서 해당 노드와 상위 노드의 'itemCount'를 모두 1 증가 시키기 위한 Query다.

```mysql
UPDATE `storeCategory` SET itemCount=itemCount+1 WHERE (SELECT X.`_lft` FROM `storeCategory` as X WHERE X.`fullCode` = 'ab' LIMIT 1) BETWEEN `_lft` AND `_rgt`;
```

위 Query 에서는 자신의 Table의 검색 결과를 자신의 데이터를 변경하는데 사용하고 있다. 이 경우 아래와 같은 오류가 난다.

```
Table 'storeCategory' is specified twice, both as a target for 'UPDATE' and as a separate source for data
```

이 경우는 아래와 같은 방식으로 문제를 회피할 수 있다.

```mysql
UPDATE `storeCategory` SET itemCount=itemCount+1 WHERE (SELECT * FROM (SELECT X.`_lft` FROM `storeCategory` as X WHERE X.`fullCode` = new.categoryId LIMIT 1) _dummy) BETWEEN `_lft` AND `_rgt`;
```

검색 결과를 dummy table로 alias 하여 직접적인 접근을 우회한 것이다.
