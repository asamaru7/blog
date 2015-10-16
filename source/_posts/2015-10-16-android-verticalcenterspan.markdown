---
layout: post
title: "안드로이드 세로 중앙정렬 Span(VerticalCenterSpan)"
date: 2015-10-16 13:37:07 +0900
comments: true
categories: android
---

SpannableString을 사용하던 중에 사이즈가 다른 두 단어를 세로로 중앙 정렬해야 할 일이 생겼다. 그런데 찾아보니 그런 Span은 없고 비슷한 기능이 있는 것들도 BASELINE 또는 BOTTOM으로만 정렬이 가능했다. 그래서 간단하게 Span 클래스를 하나 만들었다. 단, 주의할 것은 multi line은 지원하지 않는다는 것이다(내가 당장 필요하지 않아서 기능을 구현하지 않았다).

```java VerticalCenterSpan.java  
import android.graphics.Canvas;
import android.graphics.Paint;
import android.text.style.ReplacementSpan;

public class VerticalCenterSpan extends ReplacementSpan {
	public VerticalCenterSpan() {
	}

	@Override
	public void draw(Canvas canvas, CharSequence text, int start, int end, float x, int top, int y, int bottom, Paint paint) {
		int yPos = (int) ((canvas.getHeight() / 2) - ((paint.descent() + paint.ascent()) / 2));
		canvas.drawText(text, start, end, x, yPos, paint);
	}

	@Override
	public int getSize(Paint paint, CharSequence text, int start, int end, Paint.FontMetricsInt fm) {
		return Math.round(paint.measureText(text, start, end));
	}
}

```

그런데 사용시에 유의할 점이 있다. 다른 Span과 함께 적용시에 일부는 적용되지 않을 수 있다는 것이다. 예를 들어 아래의 예를 보자(아래 소스는 이해를 위해 부분만 넣어둔 것이다).

```java
styledText.setSpan(new AbsoluteSizeSpan(12, true), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
styledText.setSpan(new ForegroundColorSpan(ContextCompat.getColor(this, R.color.newColor)), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
styledText.setSpan(new VerticalCenterSpan(), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
```

위 소스는 글자 크기와 색상을 바꾼 후 세로 중앙정렬을 하기 위한 코드다. 그런데 실행해보면 색상이 적용되지 않는다. 이 것과 관련해서는 정확한 이유를 확인해보지는 못했지만 [ForegroundColorSpan is not applied to ReplacementSpan](http://stackoverflow.com/a/28329166)를 보면 버그라고 추정하는 것 같다. 어쨌든 색상도 함께 바꾸어야 할 경우를 위해 조금 변경한 소스는 아래와 같다.

```java ColorVerticalCenterSpan.java
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.text.style.ReplacementSpan;

public class ColorVerticalCenterSpan extends ReplacementSpan {
	private int backgroundColor = 0;
	private int foregroundColor = 0;

	public ColorVerticalCenterSpan(int foregroundColor) {
		this.foregroundColor = foregroundColor;
	}

	public ColorVerticalCenterSpan(int foregroundColor, int backgroundColor) {
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
	}

	@Override
	public void draw(Canvas canvas, CharSequence text, int start, int end, float x, int top, int y, int bottom, Paint paint) {
		// Background
		if (backgroundColor != 0) {
			paint.setColor(backgroundColor);
			canvas.drawRect(new RectF(x, top, x + paint.measureText(text, start, end), bottom), paint);
		}

		// Text
		if (foregroundColor != 0) {
			paint.setColor(foregroundColor);
		}
		int yPos = (int) ((canvas.getHeight() / 2) - ((paint.descent() + paint.ascent()) / 2));
		canvas.drawText(text, start, end, x, yPos, paint);
	}

	@Override
	public int getSize(Paint paint, CharSequence text, int start, int end, Paint.FontMetricsInt fm) {
		return Math.round(paint.measureText(text, start, end));
	}
}
```

이 코드를 이용해서 아래와 같이 사용하면 원하는 결과를 얻을 수 있다.

```java
styledText.setSpan(new AbsoluteSizeSpan(12, true), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
styledText.setSpan(new ColorVerticalCenterSpan(ContextCompat.getColor(this, R.color.newColor)), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
```

아니면 위에 링크한 StackOverflow의 답변처럼 FontColorSpan 클래스를 추가해서 사용하는 방법도 가능하다. 예를들면 아래처럼.

```java
styledText.setSpan(new AbsoluteSizeSpan(12, true), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
styledText.setSpan(new FontColorSpan(ContextCompat.getColor(this, R.color.newColor)), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
styledText.setSpan(new VerticalCenterSpan(), 0, 4, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
```
