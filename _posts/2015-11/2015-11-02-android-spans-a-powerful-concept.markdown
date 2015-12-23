---
layout: post
title: "Android : Spans, a Powerful Concept"
date: 2015-11-02 20:12:10 +0900
comments: true
categories: android
---

안드로이드의 [Spannable](http://developer.android.com/intl/ru/reference/android/text/Spannable.html)에 관련된 좋은 글이 있어 번역해 본다.
사실 부족한 영어 실력으로 번역이라기 보다 내용을 옮겨보는 정도라고 생각하면 될 듯하다(의역이 많다).

> [Spans, a Powerful Concept.](http://flavienlaurent.com/blog/2014/01/31/spans/)  
> Jan 31st, 2014 6:09 pm  
> [Github Sample : flavienlaurent/spans](https://github.com/flavienlaurent/spans)

최근에, 나는 NewStand 앱과 ActionBar icon의 전환 효과에 대해 블로그에 남겼다. Cyril Mottier는 ActionBar의 title에 Spans을 사용하여 fade in/out하는 우아한 방법을 제안했다.

또한, 난 항상 사용 가능한 모든 종류의 Span(ImageSpan, BackgroundColorSpan 등)을 시도하고 싶었다. 그것들은 매우 유용하고 사용이 간단하지만 그것들에 대한 문서나 자세한 정보가 없었다.

그래서 이 문서에는 프레임워크의 Spans으로 무엇을 할 수 있는지 탐색하고, Spans으로 어떠한 새로운 것을 할 수 있는지 보여주고자 한다. [sample application](https://github.com/flavienlaurent/spans/raw/master/sample.apk)를 다운받아 설치할 수 있다. 여기에서 [source](https://github.com/flavienlaurent/spans)를 확인 할 수 있다.

## In the framework

### HIERARCHY

Main rules:

* Span이 텍스트 문자 레벨에 영향을 미칠 경우, [CharacterStyle](http://developer.android.com/reference/android/text/style/CharacterStyle.html)를 상속
* Span이 단락 레벨에 영향을 미칠 경우, [ParagraphStyle](http://developer.android.com/reference/android/text/style/ParagraphStyle.html)를 상속
* Span이 텍스트 문자 레벨의 외형에 영향을 미칠 경우,
[UpdateAppearance](http://developer.android.com/reference/android/text/style/UpdateAppearance.html)를 상속
* Span이 단락 레벨의 외형에 영향을 미칠 경우, [UpdateLayout](http://developer.android.com/reference/android/text/style/UpdateLayout.html)를 상속

그것은 우리를 위해 다음과 같은 클래스 다이어그램을 제공합니다 :

![cdcharacterstyle](/img/2015-11-02-android-spans-a-powerful-concept-1.png)  

![cdparagraphstyle](/img/2015-11-02-android-spans-a-powerful-concept-2.png)  

![cdupdateappearance](/img/2015-11-02-android-spans-a-powerful-concept-3.png)  

![cdupdatelayout](/img/2015-11-02-android-spans-a-powerful-concept-4.png)  

그러나 이것은 조금 복잡하기 때문에 나는 class visualizer (like [this](http://www.class-visualizer.net/))를 사용하길 권한다.

## How it works?

### LAYOUT

당신이 text를 TextView에 설정하고자 할때, [Layout](http://developer.android.com/reference/android/text/Layout.html) base class를 사용하여 텍스트 렌더링을 관리한다.

Layout Class는 `mSpannedText`라는 boolean 값을 포함하고 있다: text가 [Spanned](http://developer.android.com/reference/android/text/Spanned.html)([Spanned](http://developer.android.com/reference/android/text/Spanned.html)을 구현한 [SpannableString](http://developer.android.com/reference/android/text/SpannableString.html))의 인스턴스라면 true가 된다.
이 Class는 오직 ParagraphStyle Spans에만 동작한다.

[draw](http://developer.android.com/reference/android/text/Layout.html#draw%28android.graphics.Canvas,%20android.graphics.Path,%20android.graphics.Paint,%20int%29) method는 2개의 다른 method들을 호출한다:

* drawBackground

텍스트의 각 행에 대해, 현재 행에  [LineBackgroundSpan](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html)가 있는 경우, [LineBackgroundSpan#drawBackground](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html#drawBackground%28android.graphics.Canvas,%20android.graphics.Paint,%20int,%20int,%20int,%20int,%20int,%20java.lang.CharSequence,%20int,%20int,%20int%29)가 호출된다.

* drawText

텍스트의 각 행에 대해, [LeadingMarginSpan](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.html)과 [LeadingMarginSpan2](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.LeadingMarginSpan2.html)를 계산하고 필요하다면 [LeadingMarginSpan#drawLeadingMargin](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.html#drawLeadingMargin%28android.graphics.Canvas,%20android.graphics.Paint,%20int,%20int,%20int,%20int,%20int,%20java.lang.CharSequence,%20int,%20int,%20boolean,%20android.text.Layout%29)를 호출한다. 이것은 또한 [AlignmentSpan](http://developer.android.com/reference/android/text/style/AlignmentSpan.html)를 텍스트 맞춤을 결정 하는 데 사용 된다. 마지막으로, 현재 행이 스팬인 경우, 레이아웃은 TextLine#draw(텍스트 라인 개체가 각 행에 대해 생성된다)을 호출 한다.

### TEXTLINE

문서에서는 [android.text.TextLine](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/text/TextLine.java) 다음과 같이 설명한다: 시각적 순서의 측정과 렌더링을 위한 스타일 텍스트 행을 나타낸다.

TextLine 클래스는 3세트의 Spans을 포함한다:

* MetricAffectingSpan set
* CharacterStyle set
* ReplacementSpan set

흥미로운 메소드는 TextLine#handleRun이다. 그것은 모든 스팬이 텍스트를 렌더링하는데 사용된다. 스팬의 유형을 기준으로 TextLine은 아래의 함수를 호출한다:

* [CharacterStyle#updateDrawState](http://developer.android.com/reference/android/text/style/CharacterStyle.html#updateDrawState%28android.text.TextPaint%29) to change the TextPaint configuration for MetricAffectingSpan and CharacterStyle Spans.
* TextLine#handleReplacement for ReplacementSpan. It calls [Replacement#getSize](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#getSize%28android.graphics.Paint,%20java.lang.CharSequence,%20int,%20int,%20android.graphics.Paint.FontMetricsInt%29) to get the replacement width, update the font metrics if it’s needed and finally call [Replacement#draw](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#draw%28android.graphics.Canvas,%20java.lang.CharSequence,%20int,%20int,%20float,%20int,%20int,%20int,%20android.graphics.Paint%29).

### FONTMETRICS

폰트 메트릭에 대해 더 알고 싶다면 다음의 그림을 보자:

![fontmetrics](/img/2015-11-02-android-spans-a-powerful-concept-5.png)  

## Playground

### BULLETSPAN

[android.text.style.BulletSpan](http://developer.android.com/reference/android/text/style/BulletSpan.html)

The BulletSpan affects paragraph-level text formatting. It allows you to put a bullet on paragraph start.

BulletSpan은 텍스트 단락 수준 서식에 영향을 준다. 그것은 단락 시작에 bullet을 넣을 수 있도록 해준다.

```java
/*
public BulletSpan (int gapWidth, int color)
-gapWidth: gap in px between bullet and text
-color: bullet color (optionnal, default is transparent)
*/

//create a black BulletSpan with a gap of 15px
span = new BulletSpan(15, Color.BLACK);
```

![BulletSpan](/img/2015-11-02-android-spans-a-powerful-concept-6.png)  

### QUOTESPAN
[android.text.style.QuoteSpan](http://developer.android.com/reference/android/text/style/QuoteSpan.html)

QuoteSpan은 텍스트 단락 수준 서식에 영향을 준다. 그것은 당신이 단락에 인용 수직선을 넣을 수 있도록 해준다.

```java
/*
public QuoteSpan (int color)
-color: quote vertical line color (optionnal, default is Color.BLUE)
*/

//create a red quote
span = new QuoteSpan(Color.RED);
```

![QuoteSpan](/img/2015-11-02-android-spans-a-powerful-concept-7.png)  

### ALIGNMENTSPAN.STANDARD

[android.text.style.AlignmentSpan.Standard](http://developer.android.com/reference/android/text/style/AlignmentSpan.Standard.html)

AlignmentSpan.Standard은 텍스트 단락 수준 서식에 영향을 준다. 그것은 문단을 정렬(일반, 중앙, 반대) 할 수 있도록 해준다.
그것은 정렬 수 있습니다 (정상, 센터, 반대)는 단락.

```java
/*
public Standard(Layout.Alignment align)
-align: alignment to set
*/

//align center a paragraph
span = new AlignmentSpan.Standard(Layout.Alignment.ALIGN_CENTER);
```

![AlignmentSpan](/img/2015-11-02-android-spans-a-powerful-concept-8.png)  

### UNDERLINESPAN
[android.text.style.UnderlineSpan](http://developer.android.com/reference/android/text/style/UnderlineSpan.html)

UnderlineSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 [Paint#setUnderlineText(true)](http://developer.android.com/reference/android/graphics/Paint.html#setUnderlineText%28boolean%29)을 통해 문자에 밑줄을 넣을 수 있도록 해준다.

```java
//underline a character
span = new UnderlineSpan();
```

![UnderlineSpan](/img/2015-11-02-android-spans-a-powerful-concept-9.png)  

### STRIKETHROUGHSPAN

[android.text.style.StrikethroughSpan](http://developer.android.com/reference/android/text/style/StrikethroughSpan.html)

StrikethroughSpan 은 텍스트 글자 수준 서식에 영향을 준다. 그것은  [Paint#setStrikeThruText(true)](http://developer.android.com/reference/android/graphics/Paint.html#setStrikeThruText%28boolean%29)을 통해 문자에 취소선을 넣을 수 있도록 해준다.

```java
//strikethrough a character
span = new StrikethroughSpan();
```

![StrikethroughSpan](/img/2015-11-02-android-spans-a-powerful-concept-10.png)  

### SUBSCRIPTSPAN
[android.text.style.SubscriptSpan](http://developer.android.com/reference/android/text/style/SubscriptSpan.html)

SubscriptSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은  [TextPaint#baselineShift](http://developer.android.com/reference/android/text/TextPaint.html#baselineShift)를 감소시켜 아래 첨자 문자를 넣을 수 있도록 해준다.

```java
//subscript a character
span = new SubscriptSpan();
```

![SubscriptSpan](/img/2015-11-02-android-spans-a-powerful-concept-11.png)  

### SUPERSCRIPTSPAN

[android.text.style.SuperscriptSpan](http://developer.android.com/reference/android/text/style/SuperscriptSpan.html)

SuperscriptSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은  [TextPaint#baselineShift](http://developer.android.com/reference/android/text/TextPaint.html#baselineShift)를 증가시켜 위 첨자 문자를 넣을 수 있도록 해준다.

```java
//superscript a character
span = new SuperscriptSpan();
```

![SuperscriptSpan](/img/2015-11-02-android-spans-a-powerful-concept-12.png)  

### BACKGROUNDCOLORSPAN

[android.text.style.BackgroundColorSpan](http://developer.android.com/reference/android/text/style/BackgroundColorSpan.html)

BackgroundColorSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 문자의 배경색을 넣을 수 있도록 해준다.

```java
/*
public BackgroundColorSpan (int color)
-color: background color
*/

//set a green background
span = new BackgroundColorSpan(Color.GREEN);
```

![BackgroundColorSpan](/img/2015-11-02-android-spans-a-powerful-concept-13.png)  

### FOREGROUNDCOLORSPAN

[android.text.style.ForegroundColorSpan](http://developer.android.com/reference/android/text/style/ForegroundColorSpan.html)

ForegroundColorSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 문자의 글자색을 넣을 수 있도록 해준다.

```java
/*
public ForegroundColorSpan (int color)
-color: foreground color
*/

//set a red foreground
span = new ForegroundColorSpan(Color.RED);
```

![ForegroundColorSpan](/img/2015-11-02-android-spans-a-powerful-concept-14.png)  

### IMAGESPAN

[android.text.style.ImageSpan](http://developer.android.com/reference/android/text/style/ImageSpan.html)

ImageSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 이미지를 글자처럼 넣을 수 있도록 해준다. 그것은 문서화를 잘 할 수 있도록 해주는 몇 안되는 스팬 중 하나다.

```java
//replace a character by pic1_small image
span = new ImageSpan(this, R.drawable.pic1_small);
```

![ImageSpan](/img/2015-11-02-android-spans-a-powerful-concept-15.png)  

### STYLESPAN

[android.text.style.StyleSpan](http://developer.android.com/reference/android/text/style/StyleSpan.html)

StyleSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자에 스타일(bold, italic, normal)을 넣을 수 있도록 해준다.

```java
/*
public StyleSpan (int style)
-style: int describing the style (android.graphics.Typeface)
*/

//set a bold+italic style
span = new StyleSpan(Typeface.BOLD | Typeface.ITALIC);
```

![StyleSpan](/img/2015-11-02-android-spans-a-powerful-concept-16.png)  

### TYPEFACESPAN

[android.text.style.TypefaceSpan](http://developer.android.com/reference/android/text/style/TypefaceSpan.html)

TypefaceSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것의 글자의 폰트 패밀리(monospace, serif etc)를 지정할 수 있도록 해준다.

```java
/*
public TypefaceSpan (String family)
-family: a font family
*/

//set the serif family
span = new TypefaceSpan("serif");
```

![TypefaceSpan](/img/2015-11-02-android-spans-a-powerful-concept-17.png)  

### TEXTAPPEARANCESPAN

[android.text.style.TextAppearanceSpan](http://developer.android.com/reference/android/text/style/TextAppearanceSpan.html)

TextAppearanceSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자의 appearance를 지정할 수 있도록 해준다.

```java
/*
public  TextAppearanceSpan(Context context, int appearance, int colorList)
-context: a valid context
-appearance: text appearance resource (ex: android.R.style.TextAppearance_Small)
-colorList: a text color resource (ex: android.R.styleable.Theme_textColorPrimary)

public TextAppearanceSpan(String family, int style, int size, ColorStateList color, ColorStateList linkColor)
-family: a font family
-style: int describing the style (android.graphics.Typeface)
-size: text size
-color: a text color
-linkColor: a link text color
*/

//set the serif family
span = new TextAppearanceSpan(this/*a context*/, R.style.SpecialTextAppearance);
```

**styles.xml**

```xml
<style name="SpecialTextAppearance" parent="@android:style/TextAppearance">
    <item name="android:textColor">@color/color1</item>
    <item name="android:textColorHighlight">@color/color2</item>
    <item name="android:textColorHint">@color/color3</item>
    <item name="android:textColorLink">@color/color4</item>
    <item name="android:textSize">28sp</item>
    <item name="android:textStyle">italic</item>
</style>
```

![TextAppearanceSpan](/img/2015-11-02-android-spans-a-powerful-concept-18.png)  

### ABSOLUTESIZESPAN

[android.text.style.AbsoluteSizeSpan](http://developer.android.com/reference/android/text/style/AbsoluteSizeSpan.html)

AbsoluteSizeSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자의 절대 크기를 지정할 수 있도록 해준다.

```java
/*
public AbsoluteSizeSpan(int size, boolean dip)
-size: a size
-dip: false, size is in px; true, size is in dip (optionnal, default false)
*/

//set text size to 24dp
span = new AbsoluteSizeSpan(24, true);
```

![AbsoluteSizeSpan](/img/2015-11-02-android-spans-a-powerful-concept-19.png)  

### RELATIVESIZESPAN

[android.text.style.RelativeSizeSpan](http://developer.android.com/reference/android/text/style/RelativeSizeSpan.html)

RelativeSizeSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자의 상대 크기를 지정할 수 있도록 해준다.

```java
/*
public RelativeSizeSpan(float proportion)
-proportion: a proportion of the actual text size
*/

//set text size 2 times bigger
span = new RelativeSizeSpan(2.0f);
```

![RelativeSizeSpan](/img/2015-11-02-android-spans-a-powerful-concept-20.png)  

## SCALEXSPAN

[android.text.style.ScaleXSpan](http://developer.android.com/reference/android/text/style/ScaleXSpan.html)

ScaleXSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자의 x 축 방향에 설정된 배율을 지정할 수 있도록 해준다.

```java
/*
public ScaleXSpan(float proportion)
-proportion: a proportion of actual text scale x
*/

//scale x 3 times bigger
span = new ScaleXSpan(3.0f);
```

![ScaleXSpan](/img/2015-11-02-android-spans-a-powerful-concept-21.png)  

### MASKFILTERSPAN

[android.text.style.MaskFilterSpan](http://developer.android.com/reference/android/text/style/MaskFilterSpan.html)

MaskFilterSpan은 텍스트 글자 수준 서식에 영향을 준다. 그것은 글자에  [android.graphics.MaskFilter](http://developer.android.com/reference/android/graphics/MaskFilter.html)를 설정할 수 있도록 해준다.

**주의: BlurMaskFilter 는 hardware acceleration을 지원하지 않는다.**

```java
/*
public MaskFilterSpan(MaskFilter filter)
-filter: a filter to apply
*/

//Blur a character
span = new MaskFilterSpan(new BlurMaskFilter(density*2, BlurMaskFilter.Blur.NORMAL));
//Emboss a character
span = new MaskFilterSpan(new EmbossMaskFilter(new float[] { 1, 1, 1 }, 0.4f, 6, 3.5f));
```

**BlurMaskFilter**

![MaskFilterSpan](/img/2015-11-02-android-spans-a-powerful-concept-22.png)  

**EmbossMaskFilter와 함께 blue ForegroundColorSpan과 bold StyleSpan**

![MaskFilterSpan](/img/2015-11-02-android-spans-a-powerful-concept-23.png)  

## 고급 스팬(Pushing Spans to the next level)

### 글자색(FOREGROUND COLOR) 애니메이션

![AnimateSpan](/img/2015-11-02-android-spans-a-powerful-concept-24.gif)  

ForegroundColorSpan은 읽기 전용이다. 그것은 인스턴스화된 후에는 글자색을 변경할 수 없다는 뜻이다. 따라서 처음으로 할 일은 MutableForegroundColorSpan을 작성하는 것이다.

**MutableForegroundColorSpan.java**

```java
public class MutableForegroundColorSpan extends ForegroundColorSpan {

    private int mAlpha = 255;
    private int mForegroundColor;

    public MutableForegroundColorSpan(int alpha, int color) {
        super(color);
        mAlpha = alpha;
        mForegroundColor = color;
    }

    public MutableForegroundColorSpan(Parcel src) {
        super(src);
        mForegroundColor = src.readInt();
        mAlpha = src.readInt();
    }

    public void writeToParcel(Parcel dest, int flags) {
        super.writeToParcel(dest, flags);
        dest.writeInt(mForegroundColor);
        dest.writeFloat(mAlpha);
    }

    @Override
    public void updateDrawState(TextPaint ds) {
        ds.setColor(getForegroundColor());
    }

    /**
     * @param alpha from 0 to 255
     */
    public void setAlpha(int alpha) {
        mAlpha = alpha;
    }

    public void setForegroundColor(int foregroundColor) {
        mForegroundColor = foregroundColor;
    }

    public float getAlpha() {
        return mAlpha;
    }

    @Override
    public int getForegroundColor() {
        return Color.argb(mAlpha, Color.red(mForegroundColor), Color.green(mForegroundColor), Color.blue(mForegroundColor));
    }
}
```

이제 우리는 같은 인스턴스에서 투명도 또는 글자색을 변경할 수 있다. 그러나 그 속성을 설정할 때 그것은 View를 갱신하지 않는다: 직접 SpannableString을 다시 설정해 주어야 한다.

```java
MutableForegroundColorSpan span = new MutableForegroundColorSpan(255, Color.BLACK);
spannableString.setSpan(span, 0, text.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
textView.setText(spannableString);
//here the text is black and fully opaque
span.setAlpha(100);
span.setForegroundColor(Color.RED);
//here the text hasn't changed.
textView.setText(spannableString);
//finally, the text is red and translucent
```

이제 우리는 글자색을 애니메이션하기를 원한다. 우리는  [android.util.Property](http://developer.android.com/reference/android/util/Property.html)를 사용하여 커스텀 해야 한다.

```java
private static final Property<MutableForegroundColorSpan, Integer> MUTABLE_FOREGROUND_COLOR_SPAN_FC_PROPERTY =
new Property<MutableForegroundColorSpan, Integer>(Integer.class, "MUTABLE_FOREGROUND_COLOR_SPAN_FC_PROPERTY") {

    @Override
    public void set(MutableForegroundColorSpan span, Integer value) {
        span.setForegroundColor(value);
    }

    @Override
    public Integer get(MutableForegroundColorSpan span) {
        return span.getForegroundColor();
    }
};
```

마지막으로 우리는 [ObjectAnimator](http://developer.android.com/reference/android/animation/ObjectAnimator.html)를 이용하여 custom property를 애니메이션 한다. View를 갱신하는 것을 잊지마라.

```java
MutableForegroundColorSpan span = new MutableForegroundColorSpan(255, Color.BLACK);
mSpannableString.setSpan(span, 0, text.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
ObjectAnimator objectAnimator = ObjectAnimator.ofInt(span, MUTABLE_FOREGROUND_COLOR_SPAN_FC_PROPERTY, Color.BLACK, Color.RED);
objectAnimator.setEvaluator(new ArgbEvaluator());
objectAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
    @Override
    public void onAnimationUpdate(ValueAnimator animation) {
        //refresh
        mText.setText(mSpannableString);
    }
});
objectAnimator.start();
```

## ACTIONBAR ‘FIREWORKS’

![FIREWORKS](/img/2015-11-02-android-spans-a-powerful-concept-25.gif)  

‘fireworks’ 애니메이션은 무작위를 글자를 fade 하도록 한다. 먼저 글자를 다수의 Span으로 분리하여(예를 들어, 글자 단위로 하나의 스팬을 생성) 스팬을 적용하고 fade 한다. 앞서 소개한 MutableForegroundColorSpan을 사용하여, 스팬 그룹을 표현하기 위한 특별한 객체를 만들 것이다. 그리고 그룹에 setAlpha 호출할 때마다, 우리는 무작위로 각 범위에 대한 투명도를 설정한다.

```java
private static final class FireworksSpanGroup {
    private final float mAlpha;
    private final ArrayList<MutableForegroundColorSpan> mSpans;

    private FireworksSpanGroup(float alpha) {
        mAlpha = alpha;
        mSpans = new ArrayList<MutableForegroundColorSpan>();
    }

    public void addSpan(MutableForegroundColorSpan span) {
        span.setAlpha((int) (mAlpha * 255));
        mSpans.add(span);
    }

    public void init() {
        Collections.shuffle(mSpans);
    }

    public void setAlpha(float alpha) {
        int size = mSpans.size();
        float total = 1.0f * size * alpha;

        for(int index = 0 ; index < size; index++) {
            MutableForegroundColorSpan span = mSpans.get(index);
            if(total >= 1.0f) {
                span.setAlpha(255);
                total -= 1.0f;
            } else {
                span.setAlpha((int) (total * 255));
                total = 0.0f;
            }
        }
    }

    public float getAlpha() { return mAlpha; }
}
```

우리는 FireworksSpanGroup의 알파 애니메이션에 사용자 정의 속성을 만든다.

```java
private static final Property<FireworksSpanGroup, Float> FIREWORKS_GROUP_PROGRESS_PROPERTY =
new Property<FireworksSpanGroup, Float>(Float.class, "FIREWORKS_GROUP_PROGRESS_PROPERTY") {

    @Override
    public void set(FireworksSpanGroup spanGroup, Float value) {
        spanGroup.setProgress(value);
    }

    @Override
    public Float get(FireworksSpanGroup spanGroup) {
        return spanGroup.getProgress();
    }
};
```

마지막으로, 우리는 그룹을 만들고 ObjectAnimator으로 애니메이션 한다.

```java
final FireworksSpanGroup spanGroup = new FireworksSpanGroup();
//init the group with multiple spans
//spanGroup.addSpan(span);
//set spans on the ActionBar spannable title
//mActionBarTitleSpannableString.setSpan(span, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
spanGroup.init();
ObjectAnimator objectAnimator = ObjectAnimator.ofFloat(spanGroup, FIREWORKS_GROUP_PROGRESS_PROPERTY, 0.0f, 1.0f);
objectAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
    @Override
    public void onAnimationUpdate(ValueAnimator animation) {
        //refresh the ActionBar title
        setTitle(mActionBarTitleSpannableString);
    }
});
objectAnimator.start();
```

## 나만의 스팬으로 그리기(DRAW WITH YOUR OWN SPAN)

이 섹션에서는 사용자 정의 스팬을 통해 그리는 방법을 설명 할 것이다. 이것은 텍스트 사용자 정의에 대한 흥미로운 관점을 열어줄 것이다.

첫째, 우리는 추상 클래스 [ReplacementSpan](http://developer.android.com/reference/android/text/style/ReplacementSpan.html)을 확장하는 커스텀 스팬을 만들어야 한다.

당신이 오직 custom background를 그리기만 원하는 경우, 텍스트 단락 수준 서식인 [LineBackgroundSpan](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html)을 구현할 수 있다.

우리는 2개의 methods를 구현해야 한다:

* [getSize](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#getSize%28android.graphics.Paint,%20java.lang.CharSequence,%20int,%20int,%20android.graphics.Paint.FontMetricsInt%29): 이 method는 당신이 변경한 새로운 크기를 반환한다.

text: 스팬에서 관리하는 문자열

start: 문자열의 시작 위치

end: 문자열의 종료 위치

fm: font metrics(null을 넣을 수 있다)

* [draw](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#draw%28android.graphics.Canvas,%20java.lang.CharSequence,%20int,%20int,%20float,%20int,%20int,%20int,%20android.graphics.Paint%29): 당신이 Canvas를 이용해 그릴 수 있는 곳이다.

x: 문자열이 draw 될 좌표(x-coordinate)

top: 라인의 top

y: baseline

bottom: 라인의 bottom

텍스트를 둘러싸는 파란 사각형을 그리는 예제를 보자.

```java
@Override
public int getSize(Paint paint, CharSequence text, int start, int end, Paint.FontMetricsInt fm) {
    //return text with relative to the Paint
    mWidth = (int) paint.measureText(text, start, end);
    return mWidth;
}

@Override
public void draw(Canvas canvas, CharSequence text, int start, int end, float x, int top, int y, int bottom, Paint paint) {
    //draw the frame with custom Paint
    canvas.drawRect(x, top, x + mWidth, bottom, mPaint);
}
```

![DRAW WITH YOUR OWN SPAN](/img/2015-11-02-android-spans-a-powerful-concept-26.png)  

## BONUS

샘플 앱에는 아래와 같은 예시가 포함되어 있다:

* Progressive blur

![Progressive blur](/img/2015-11-02-android-spans-a-powerful-concept-27.gif)  

* Typewriter

![Typewriter](/img/2015-11-02-android-spans-a-powerful-concept-28.gif)  

## 결론

이 문서에서 작업, 나는 스팬 정말 강력하고 드로어 블 Drawable들처럼, 나는 그들이 충분히 사용하지 않는 생각을 깨달았다. 텍스트 응용 프로그램의 주요 내용, 그것은 사방 그래서 스팬과 더 역동적이고 매력적으로 만들 것을 잊지 마세요있다!

이 문서 작업, 깨달았다 범위는 정말 강력 하 고 Drawables, 같은 그들이 생각 하지 충분히 사용. 텍스트는 응용 프로그램의 주요 내용, 그것은 어디에 나 그래서 더 역동적이 고 매력적인 걸쳐 그것을 확인 하는 것을 잊지 마세요!

이 문서를 작성하면서 스팬은 정말 강력하지만 그들은 Drawables처럼 충분히 사용하지 않는다는 것을 깨달았다. 텍스트는 어플리케이션의 메인 콘텐츠다. 그것은 어디에나 있다. 그러니 텍스트를 스팬을 통해 역동적이고 매력적으로 만들 수 있다는 것을 잊지마라!
