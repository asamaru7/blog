---
layout: post
title: "[번역중] Android : Spans, a Powerful Concept"
date: 2015-11-02 20:12:10 +0900
comments: true
categories: android
---

안드로이드의 [Spannable](http://developer.android.com/intl/ru/reference/android/text/Spannable.html)에 관련된 좋은 글이 있어 번역해 본다.
사실 부족한 영어 실력으로 번역이라기 보다 내용을 옮겨보는 정도라고 생각하면 될 듯하다(의역이 많다).

**게다가 아직은 번역중이다. 시간이 되는대로 조금씩 번역해 나갈 예정이다.**

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

For each line of text, if there is a [LineBackgroundSpan](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html) for a current line, [LineBackgroundSpan#drawBackground](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html#drawBackground%28android.graphics.Canvas,%20android.graphics.Paint,%20int,%20int,%20int,%20int,%20int,%20java.lang.CharSequence,%20int,%20int,%20int%29) is called.

* drawText

For each line of text, it computes [LeadingMarginSpan](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.html) and [LeadingMarginSpan2](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.LeadingMarginSpan2.html) and calls [LeadingMarginSpan#drawLeadingMargin](http://developer.android.com/reference/android/text/style/LeadingMarginSpan.html#drawLeadingMargin%28android.graphics.Canvas,%20android.graphics.Paint,%20int,%20int,%20int,%20int,%20int,%20java.lang.CharSequence,%20int,%20int,%20boolean,%20android.text.Layout%29) when it’s necessary. This is also where [AlignmentSpan](http://developer.android.com/reference/android/text/style/AlignmentSpan.html) is used to determine the text alignment. Finally, if the current line is spanned, Layout calls TextLine#draw (a TextLine object is created for each line).

### TEXTLINE

[android.text.TextLine](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/text/TextLine.java) documentation says: Represents a line of styled text, for measuring in visual order and for rendering.

TextLine class contains 3 sets of Spans:

* MetricAffectingSpan set
* CharacterStyle set
* ReplacementSpan set

The interesting method is TextLine#handleRun. It’s where all Spans are used to render the text. Relative to the type of Span, TextLine calls:

* [CharacterStyle#updateDrawState](http://developer.android.com/reference/android/text/style/CharacterStyle.html#updateDrawState%28android.text.TextPaint%29) to change the TextPaint configuration for MetricAffectingSpan and CharacterStyle Spans.
* TextLine#handleReplacement for ReplacementSpan. It calls [Replacement#getSize](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#getSize%28android.graphics.Paint,%20java.lang.CharSequence,%20int,%20int,%20android.graphics.Paint.FontMetricsInt%29) to get the replacement width, update the font metrics if it’s needed and finally call [Replacement#draw](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#draw%28android.graphics.Canvas,%20java.lang.CharSequence,%20int,%20int,%20float,%20int,%20int,%20int,%20android.graphics.Paint%29).

### FONTMETRICS

If you want to know more about what is font metrics, just look at the following schema:

![fontmetrics](/img/2015-11-02-android-spans-a-powerful-concept-5.png)  

## Playground

### BULLETSPAN

[android.text.style.BulletSpan](http://developer.android.com/reference/android/text/style/BulletSpan.html)

The BulletSpan affects paragraph-level text formatting. It allows you to put a bullet on paragraph start.

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

The QuoteSpan affects paragraph-level text formatting. It allows you to put a quote vertical line on a paragraph.

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

The AlignmentSpan.Standard affects paragraph-level text formatting. It allows you to align (normal, center, opposite) a paragraph.

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

The UnderlineSpan affects character-level text formatting. It allows you to underline a character thanks to [Paint#setUnderlineText(true)](http://developer.android.com/reference/android/graphics/Paint.html#setUnderlineText%28boolean%29).

```java
//underline a character
span = new UnderlineSpan();
```

![UnderlineSpan](/img/2015-11-02-android-spans-a-powerful-concept-9.png)  

### STRIKETHROUGHSPAN

[android.text.style.StrikethroughSpan](http://developer.android.com/reference/android/text/style/StrikethroughSpan.html)

The StrikethroughSpan affects character-level text formatting. It allows you to strikethrough a character thanks to [Paint#setStrikeThruText(true)](http://developer.android.com/reference/android/graphics/Paint.html#setStrikeThruText%28boolean%29).

```java
//strikethrough a character
span = new StrikethroughSpan();
```

![StrikethroughSpan](/img/2015-11-02-android-spans-a-powerful-concept-10.png)  

### SUBSCRIPTSPAN
[android.text.style.SubscriptSpan](http://developer.android.com/reference/android/text/style/SubscriptSpan.html)

The SubscriptSpan affects character-level text formatting. It allows you to subscript a character by reducing the [TextPaint#baselineShift](http://developer.android.com/reference/android/text/TextPaint.html#baselineShift) .

```java
//subscript a character
span = new SubscriptSpan();
```

![SubscriptSpan](/img/2015-11-02-android-spans-a-powerful-concept-11.png)  

### SUPERSCRIPTSPAN

[android.text.style.SuperscriptSpan](http://developer.android.com/reference/android/text/style/SuperscriptSpan.html)

The SuperscriptSpan affects character-level text formatting. It allows you to superscript a character by increasing the [TextPaint#baselineShift](http://developer.android.com/reference/android/text/TextPaint.html#baselineShift) .

```java
//superscript a character
span = new SuperscriptSpan();
```

![SuperscriptSpan](/img/2015-11-02-android-spans-a-powerful-concept-12.png)  

### BACKGROUNDCOLORSPAN

[android.text.style.BackgroundColorSpan](http://developer.android.com/reference/android/text/style/BackgroundColorSpan.html)

The BackgroundColorSpan affects character-level text formatting. It allows you to set a background color on a character.

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

The ForegroundColorSpan affects character-level text formatting. It allows you to set a foreground color on a character.

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

The ImageSpan affects character-level text formatting. It allows you to a character by an image. It’s one of the few span that is well documented so enjoy it!

```java
//replace a character by pic1_small image
span = new ImageSpan(this, R.drawable.pic1_small);
```

![ImageSpan](/img/2015-11-02-android-spans-a-powerful-concept-15.png)  

### STYLESPAN

[android.text.style.StyleSpan](http://developer.android.com/reference/android/text/style/StyleSpan.html)

The StyleSpan affects character-level text formatting. It allows you to set a style (bold, italic, normal) on a character.

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

The TypefaceSpan affects character-level text formatting. It allows you to set a font family (monospace, serif etc) on a character.

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

The TextAppearanceSpan affects character-level text formatting. It allows you to set a appearance on a character.

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

styles.xml
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

The AbsoluteSizeSpan affects character-level text formatting. It allows you to set an absolute text size on a character.

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

The RelativeSizeSpan affects character-level text formatting. It allows you to set an relative text size on a character.

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

The ScaleXSpan affects character-level text formatting. It allows you to scale on x a character.

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

The MaskFilterSpan affects character-level text formatting. It allows you to set a [android.graphics.MaskFilter](http://developer.android.com/reference/android/graphics/MaskFilter.html) on a character.

**Warning: BlurMaskFilter is not supported with hardware acceleration.**

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

**EmbossMaskFilter with a blue ForegroundColorSpan and a bold StyleSpan**

![MaskFilterSpan](/img/2015-11-02-android-spans-a-powerful-concept-23.png)  

## Pushing Spans to the next level

### ANIMATE THE FOREGROUND COLOR

![AnimateSpan](/img/2015-11-02-android-spans-a-powerful-concept-24.gif)  

ForegroundColorSpan is read-only. It means that you can’t change the foreground color after instanciation. So, the first thing to do is to code a MutableForegroundColorSpan.

MutableForegroundColorSpan.java
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

Now, we can change alpha or foreground color on the same instance. But when you set those properties, it doesn’t refresh the View: you have to do this manually by re-setting the SpannableString.

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

Now, we want to animate the foreground color. We use a custom [android.util.Property](http://developer.android.com/reference/android/util/Property.html).

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

Finally, we animate the custom property with an [ObjectAnimator](http://developer.android.com/reference/android/animation/ObjectAnimator.html). Don’t forget to refresh the View on update.

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

The ‘fireworks’ animation is to make letter fade in randomly. First, cut the text into multiple spans (for example, one span by character) and fade in spans after spans. Using the previously introduced MutableForegroundColorSpan, we are going to create a special object representing a group of span. And for each call to setAlpha on the group, we randomly set the alpha for each span.

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

We create a custom property to animate the alpha of a FireworksSpanGroup.

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

Finally, we create the group and animate it with an ObjectAnimator.

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

## DRAW WITH YOUR OWN SPAN

In this section, we are going to see a way to draw via a custom Span. This opens interesting perspectives for text customization.

First, we have to create a custom Span that extends the abstract class [ReplacementSpan](http://developer.android.com/reference/android/text/style/ReplacementSpan.html).

If you only want to draw a custom background, you can implements [LineBackgroundSpan](http://developer.android.com/reference/android/text/style/LineBackgroundSpan.html) which is at paragraph-level.

We have to implement 2 methods:

* [getSize](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#getSize%28android.graphics.Paint,%20java.lang.CharSequence,%20int,%20int,%20android.graphics.Paint.FontMetricsInt%29): this method returns the new with of your replacement.

text: text managed by the Span

start: start index of text

end: end index of text

fm: font metrics, can be null

* [draw](http://developer.android.com/reference/android/text/style/ReplacementSpan.html#draw%28android.graphics.Canvas,%20java.lang.CharSequence,%20int,%20int,%20float,%20int,%20int,%20int,%20android.graphics.Paint%29): it’s here you can draw with the Canvas.

x: x-coordinate where to draw the text

top: top of the line

y: the baseline

bottom: bottom of the line

Let’s see an example where we draw a blue rectangle around the text.

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

The Sample app contains some examples of pushing Spans to the next level like:

* Progressive blur

![Progressive blur](/img/2015-11-02-android-spans-a-powerful-concept-27.gif)  

* Typewriter

![Typewriter](/img/2015-11-02-android-spans-a-powerful-concept-28.gif)  

## Conclusion

Working on this article, I realised Spans are really powerfull and like Drawables, I think they are not used enough. Text is the main content of an application, it’s everywhere so don’t forget to make it more dynamic and attractive with Spans!
