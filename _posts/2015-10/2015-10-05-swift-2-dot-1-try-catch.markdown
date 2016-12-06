---
layout: post
title: "Swift 2.1에서의 오류 처리(do try catch)"
date: 2015-10-05 21:19:47 +0900
comments: true
categories: [ios, swift]
---

애플이 2015.06.08.에 ['세계개발자회의(WWDC) 2015'에서 스위프트 2.0을 공개](https://developer.apple.com/swift/blog/?id=29) 했지만 최근 다시 iOS 작업을 시작하면서 이제서야 swift 2.0을 사용하게 되었다. 그런데 이제 2.0 보려고 하는데 벌써 Xcode 7.1 beta 2가 나오면서 swift 2.1이 공개되었다.

오늘은 swift의 내용 중에서 오류 처리에 관련된 내용을 살펴보고자 한다. 아래의 내용은 [Swift 2.0 の try, catch ファーストインプレッション](http://qiita.com/koher/items/0c60b13ff0fe93220210)와 공식 메뉴얼([Error Handling](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html))의 내용을 참고하여 정리한 것이다.

공식 메뉴얼([Error Handling](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/ErrorHandling.html))에서는 swift 2.0이 아닌 swift 2.1로 안내하고 있으니 그냥 2.1을 기준으로 살펴보고자 한다(확실하지는 않지만 대충 알아본 결과 2.1에서의 변화에 Error Handling 부분은 포함되지 않는 것 같다).

메뉴얼의 내용을 빌어 Error Handling의 필요성에 대해 설명하자면 다음과 같다.

> 일부 작업은 항상 완전한 실행을 보증하거나 유용한 출력을 생성하지 않는다. Optionals를 사용하여 값의 유무를 전달함으로써 작업의 성공/실패 유무를 판단할 수 있지만 작업이 실패 할 때 코드가 적절히 응답 할 수 있도록 함으로써 오류의 원인을 이해하는 데 도움을 줄 수 있다. 예를들어 디스크상의 파일을 읽어서 처리하는 작업에서 발생할 수 있는 오류는 '존재하지 않는 파일', '읽기 권한 없음', '호환되는 형식이 아님' 등의 여러가지가 존재할 수 있다. 이러한 경우처럼 오류의 원인에 따라 다양한 대응이 필요한 경우라면 오류의 정보를 정확히 전달함으로써 오류를 복구하는데 도움을 줄 수 있다.

**Swift 2.0 이후부터는 Error Handling(런타임 상에서 오류를 발견하여 응답하고 복구하는 과정)을 위해 throwing, catching, propagating(전파), 런타임에서 복구할 수 있는 오류를 조작(manipulating recoverable errors at runtime) 할 수 있도록 지원한다.**

## 오류의 사용자 정의

Swift에서는 ErrorType protocol라는 빈 protocol을 사용하여 오류를 표시한다.

```swift
enum VendingMachineError: ErrorType {
    case InvalidSelection
    case InsufficientFunds(coinsNeeded: Int)
    case OutOfStock
}
```

이렇게 생성된 Error는 아래와 같이 발생시킬 수 있다.

```swift
throw VendingMachineError.InsufficientFunds(coinsNeeded: 5)
```

조금더 자세히 보자면 ErrorType은 enum으로 정의될 수 있다. Swift에서 try, catch는 항상 ErrorType를 throw 한다. Java에서는 오류 유형을 클래스로 취급하므로 종류마다 클래스를 정의하므로 개수가 많아지고 오류를 처리에 따라 묶어서 관리하기 어렵다. 하지만 Swift의 ErrorType는 관련 오류를 enum으로 정리할 수 있기 때문에 정리가 쉽다.

예들들어 String을 Int로 변환하는 함수를 가정할 경우 발생할 수 있는 오류는 String이 nil이거나 숫자로 변환될 수 없는 문자열일 수 있다. 이를 ErrorType 로 구현하면 다음과 같이 정의할 수 있다.

```swift
enum ParseError : ErrorType {
    case Nil // nil 인 경우
    case IllegalFormat // Int로 해석 할 수 없었던 경우
}
```

ErrorType는 오류의 종류를 나타낼뿐만 아니라 오류 정보를 함께 가질 수 있다.
위의 예시에서 IllegalFormat 오류일 때 해당 String이 무엇이었는지를 함께 넘겨주고 싶을 수 있다.

```swift
enum ParseError : ErrorType {
    case Nil
    case IllegalFormat (String)
}
```

이 방식의 좋은 점은 오류의 종류에 따라 다른 유형의 인자를 가질 수 있어 Type Safe하게 값을 얻어낼 수 있다는 것이다.

```swift
switch error {
    case. Nil :
	    print ( "The text is nil.")
    case. IllegalFormat (let string) :
    	print ( "Illegal format : \ (string)")
}
```

Objective-C의 NSError에서도 오류 정보를 가질 수 있지만, Type 정보가 사라져 버리기 때문에 Type Safe 하지 않다.

## 오류 제어

오류가 발생하면 문제를 보정하는 방법을 시도하거나 사용자에게 알림으로써 오류를 처리해야 한다. Swift에서는 오류를 처리 할 수있는 네 가지 방법이 있다.

* Throwing Functions을 이용한 오류 전파(Propagating Errors Using Throwing Functions)
* Do-Catch를 이용한 오류 처리(Handling Errors Using Do-Catch)
* Error를 Optional Values로 변환(Converting Errors to Optional Values)
* 오류 전파 비활성화(Disabling Error Propagation)

각각의 처리 방법을 하나씩 알아보자.

### Throwing Functions을 이용한 오류 전파(Propagating Errors Using Throwing Functions)

함수, 메소드, 초기화시에 오류가 throw될 수 있음을 표시하려면 함수 선언시 인자 뒤에 throws 키워드를 추가할 수 있다. 아래의 예시를 보면 이해가 편할 것이다.

```swift
func canThrowErrors() throws -> String

func cannotThrowErrors() -> String
```

`canThrowErrors` 함수 내부에서 오류가 발생하면 이 오류는 자신을 호출한 함수로 전파된다.

### Do-Catch를 이용한 오류 처리(Handling Errors Using Do-Catch)

오류를 제어 하고자하는 코드의 블록이 있을 경우는 do-catch를 사용할 수 있다. 문법 상의 차이는 있지만 다른 언어에서의 try-catch와 유사하므로 코드를 보는 것이 이해가 더 빠를 것으로 생각된다.

```swift
var vendingMachine = VendingMachine()
vendingMachine.coinsDeposited = 8
do {
    try buyFavoriteSnack("Alice", vendingMachine: vendingMachine)
} catch VendingMachineError.InvalidSelection {
    print("Invalid Selection.")
} catch VendingMachineError.OutOfStock {
    print("Out of Stock.")
} catch VendingMachineError.InsufficientFunds(let coinsNeeded) {
    print("Insufficient funds. Please insert an additional \(coinsNeeded) coins.")
}
```

`buyFavoriteSnack` 함수는 try에 의해 호출되며 오류가 발생하면 오류의 타입에 해당하는 catch에 의해 제어된다. 다른 예시를 하나 살펴보자.

```swift
do {
	let number = try toInt (label. text)
    // number를 사용한 처리
} catch ParseError. Nil {
	print ( "The text is nil.")
} catch ParseError. IllegalFormat (let string) {
	print ( "Illegal format : \ (string)")
}
```

### Error를 Optional Values로 변환(Converting Errors to Optional Values)

`try?` 구문을 이용해서 오류를 optional value로 변환할 수 있다. 예를들어 어떤 값을 반환하는 함수가 있을 때 내부에서 오류가 발생하면 오류를 무시하고 nil이 반환된 것과 동일하게 처리할 수 있다. 역시 아래의 예시를 보자.

```swift
func someThrowingFunction() throws -> Int {
    // ...
}

let x = try? someThrowingFunction()
let y: Int?
do {
    y = try someThrowingFunction()
} catch {
    y = nil
}
```

아래와 같이 사용하는 것도 가능하다.

```swift
func fetchData() -> Data? {
    if let data = try? fetchDataFromDisk() { return data }
    if let data = try? fetchDataFromServer() { return data }
    return nil
}
```

### 오류 전파 비활성화(Disabling Error Propagation)

실질적으로는 런타임시 오류를 발생시키지 않는 throwing 함수나 메서드를 사용할 경우가 있다. 이 경우 `try!`(forced-try)를 사용하여 throwing 함수나 메서드를 호출할 수 있다. `try!`를 사용하여 throwing 함수나 메서드를 호출하면 error 전파가 비활성화 되고 에러를 던지지 않는 런타임
assertion 안에서의 호출로 랩핑된다. 따라서 만일 실제로 에러가 thrown 되면, 런타임 에러를 만나게 된다. 아래의 예시를 보자.

```swift
let photo = try! loadImage("./Resources/John Appleseed.jpg")
```

`loadImage(_:)` 함수의 경우 Resources에서 이미지를 호출하고 있으므로 런타임 상에서 오류가 발생하지 않는다(빌드시 이미지가 포함되므로). 이런 경우 `try!`를 사용하여 오류 제어를 줄일 수 있다.

## Clean-Up Actions 지정 (Specifying Clean-Up Actions)

`defer`를 사용하면 코드의 실행이 코드 블럭을 벗어나기 전에 일련의 작업을 수행하게 할 수 있다. 다시말해 오류의 발생과 무관하게 반드시 실행되어야할 작업을 지정할 수 있다. 다른 언어의 finally와 유사하다고 볼 수 있다. 예를들면 열려진 파일을 닫거나, 수동으로 할당된 메모리를 해제하는 작업이 될 수 있다.

defer 내부의 구문은 제어흐픔을 벗어나게 할 수 있는 break, return, throw 등을 포함해서는 안된다. 또한 defer는 기술된 순서의 역순으로 실행된다. 다시말해 마지막에 있는 defer부터 실행되어 올라온다.

아래의 예시는 파일을 열어서 내용을 읽어서 처리하며 defer를 사용하여 오류 발생과 무관하게 파일을 닫아주도록 하고 있다.

```swift
func processFile(filename:String) throws {
    if exists(filename) {
        let file = open(filename)
        defer {
            close(file)
        }

        while let line = try file.readline() {
            // work with the file
        }
        // close(file) is called here, at the end of the scope.
    }
}
```
