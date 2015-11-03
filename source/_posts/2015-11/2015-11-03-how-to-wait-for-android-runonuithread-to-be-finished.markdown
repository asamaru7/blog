---
layout: post
title: "Android에서 runOnUiThread 작업이 종료 될 때까지 대기하기"
date: 2015-11-03 15:04:46 +0900
comments: true
categories: ["android","java"]
---
아래에서 설명하고자 하는 내용을 뭐라고 표현 해야할지 몰라서 "Android에서 runOnUiThread 작업이 종료 될 때까지 대기하기"라고 글 제목을 정했다.
내용을 요약하자면 thread에서 wait()과 notify()를 이용해서 runOnUiThread 작업이 종료될 때까지 대기하도록 하는 것이다. 쉽게 말해서 runOnUiThread는 main thread에서 처리되므로 비동기로 처리되게 되는데 필요한 작업이 완료되기 전까지 다른 처리를 대기시키는 것이다. 이렇게 설명하는 것도 정확한 설명은 아니다. 그냥 내가 하고자 했던 의도를 설명하고자 한 것이다. 따라서 정확한 의미와는 차이가 있다.

설명하기 어려워 이리저리 이야기 했는데 그냥 내가 하고자 했던 상황을 설명하는게 이해에 도움이 될 것 같다.

> PagerAdapter를 사용하는 상황에서 `java.lang.IllegalStateException: The application's PagerAdapter changed the adapter's contents without calling PagerAdapter#notifyDataSetChanged!` 오류가 발생한다. 이 문제가 발생하는 원인은 notifyDataSetChanged 호출 후 적용되기 전에 PagerAdapter의 데이터가 변경되었기 때문이다.

보통의 경우 위의 상황이 자주 발생하지는 않는다. 나의 경우엔 PagerAdapter의 데이터가 UI에서 버튼 터치에 의해서 변경되는 상황이다. 상황을 조금 더 자세히 설명해야 할 것 같다.

* 화면 상에 버튼 A, B가 있다.
* A 버튼을 누르면 A 데이터 목록을 서버에서 가져와 PagerAdapter에 적용한다.
* B 버튼을 누르면 B 데이터 목록을 서버에서 가져와 PagerAdapter에 적용한다.

* A 버튼이 눌려진 후 서버에서 데이터를 가져와 PagerAdapter에 반영하고 notifyDataSetChanged()를 runOnUiThread 내부에서 호출했다. runOnUiThread 내부에서 호출하는 이유는 데이터의 변경시 UI가 변경되는 부분들이 있어서 main thread 오류를 막기 위해서 이다.
* notifyDataSetChanged()가 적용되기 전에 버튼 B가 눌려지고 데이터를 가져와 PagerAdapter에 반영되었다.
* notifyDataSetChanged()가 적용되면서 데이터의 변경을 감지하고 `java.lang.IllegalStateException: The application's PagerAdapter changed the adapter's contents without calling PagerAdapter#notifyDataSetChanged!` 오류가 발생한다.

설명이 되었을런지 모르겠다. 앞서 말한 것과 같이 자주 발생하는 상황은 아니나 A, B 버튼을 번갈아 빠르게 터치하면 오류를 재현할 수 있다. 소스 코드를 올리면 더 이해가 쉬울 수 있는데 작업중인 소스들이 모두 섞여 있어 구분해서 남기는게 힘들어서 말로 설명했다.

일단 기존 소스와 해결된 소스부터 보자. 당연히 동작하는 소스는 아니다. 하지만 무엇을 하고 있는지를 확인하는데는 충분할 것으로 본다.

**오류가 발생하던 소스**
```java
public class PreviewPagerAdapterBase<T extends DataItem> extends PagerAdapter<T> {
  private final Runnable notifyDataSetChangedRunnalbe = ;

  public void setItems(List<T> items) {
    super.setItems(items);

    Helper.runOnUiThread(new Runnable() {
  		@Override
  		public void run() {
  			notifyDataSetChanged();
  			synchronized (this) {
  				this.notify();
  			}
  		}
  	});
  }
}
```

**수정된 소스**
```java
public class PreviewPagerAdapterBase<T extends DataItem> extends PagerAdapter<T> {
  private final Runnable notifyDataSetChangedRunnalbe = new Runnable() {
		@Override
		public void run() {
			notifyDataSetChanged();
			synchronized (this) {
				this.notify();
			}
		}
	};

  public boolean setItems(List<T> items) {
    super.setItems(items);

    synchronized (notifyDataSetChangedRunnalbe) {
      Helper.runOnUiThread(notifyDataSetChangedRunnalbe);
      try {
        notifyDataSetChangedRunnalbe.wait();
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return hasFirstItem;
  }
}
```

중요한 부분은 notifyDataSetChangedRunnalbe로 synchronized 처리하고 Runnable을 wait()한 다음 처리가 완료된 후 notify() 하는 것이다. 그리고 wait() 호출시 try 처리하고 있는데 InterruptedException이 발생할 수 있기 때문이다. 실제로 위에서 설명한 오류가 발생하는 상황에서는 InterruptedException이 대신 발생하는 것을 확인했다. 하지만 무시되어도 되는 상황이며 catch되었기 때문에 앱이 죽는 것은 막을 수 있다.

wait()와 notify()에 대해서는 [Thread(쓰레드) - 동기화(Synchronized) / wait()와 notify()](http://warmz.tistory.com/370)를 참고하면 된다.

사실 위 방법은 [how to wait for Android runOnUiThread to be finished?](http://stackoverflow.com/a/5996961)에서 참고한 것이다. 이 글을 보면 이 방법 외에도 여러가지 답변이 있다.

이 글은 정확한 이해를 하고 쓴 글이 아니므로 여러가지 문제가 있을 수 있다. 하지만 내가 원하는 문제에 대한 해결법이 되었기 때문에 기록성으로 글을 남겨둔다.
결론적으로 notifyDataSetChanged()를 명확히 적용하고 넘어 가야하는 상황에서는 위 방법이 도움이 될 수 있다. 그 외의 경우엔 UIThread의 작업을 굳이 sync 할 필요가 떠오르진 않는다.
