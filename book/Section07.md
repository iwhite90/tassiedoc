# Section 7
## Dependency Injection, Stubs and Mocks

When you start to write programs of any complexity, it's likely that you'll start having dependencies on objects that other people have written. In fact, we're already depending on the `Console` object to enable us to print things out using its `def println(x: Any)` method. Writing good code takes skill, and the question of "what is good code" has different answers to different people. However, I'd say that most professional programmers would agree that testing the core business logic of the code you're writing is important, as is writing code in a way that is maintainable and not too difficult to change in the future.  You can't really test absolutely *everything* though, and we generally have a certain amount of trust in the dependencies we use to do what they're supposed to. We also want to be able to swap out dependencies when our business needs change. An example of this might be initially using an object to save things to the file system, then deciding to swap this out for an object that saves things to a database. This chapter is about the art of structuring your code so that you can test the important bits, not have to test certain dependencies, and making it easy to swap dependencies.

### What the Bool?

The examples I want to use in this chapter need you to understand what booleans are. So now's as good a time as any to cover them. A `Boolean` is one of the types built into Scala, in much the same way that `String` and `Int` are types. Whereas an `Int` can represent any whole number, and a `String` can represent any piece of text, a `Boolean` can be only one of two values: **true** or **false**. Here are some examples of plain English statements that are either true or false:

- One plus one equals two : true
- Apple starts with the letter 'A' : true
- 10 is less than 5 : false
- Leicester City will win the Premier League : false (hmm)

Where booleans really shine are when we use them to change how our program behaves based on whether they are true or false. So far our programs have had a single path of execution. They start, then they run sequentially through the instructions we've given, then they finish. Booleans let us introduce branch points into our programs, using something called *conditional expressions*. This basically tells the computer to, "do this thing if this condition is true, otherwise do this other thing". *Conditional expression* is a bit of a mouthful, so most people just call them *if statements*.

The syntax of an if statement is the word `if`, followed by some expressions that the computer can evaluate to either true or false in parentheses, followed by the code to execute if the expression evaluates to true. It's probably easier to see this by example:

```
object Program extends App {
  val x = 20

  if (x > 10) println(s"$x is greater than 10")
}
```

Here the computer evaluates the expression `x > 10` by looking at the value of `x` and seeing whether it is greater than 10. So the expression the computer sees is, "20 is greater than 10". This is true, so it runs the code printing the message to the terminal. Try changing the value of `x` to 5 and running the program again. Because the expression, "5 is greater than 10" is false, the code isn't run.

We've got the code to say, "do this thing if this expression is true", but we also need the bit to say, "otherwise do this other thing". The way we do that is by using the word `else`. I'll extend the example to demonstrate.

```
object Program extends App {
  val x = 20

  if (x > 10) println(s"$x is greater than 10")
  else println(s"$x is less than 10)
}
```

Hopefully that's pretty straightforward. You can see how this would be useful in something like a game:

```
if (attack button is pressed) use sword
else raise shield
```

Sometimes you need to use curly braces around the bits of code to execute, and sometimes you don't. The rule is the same as for method bodies. If the body is going to take up more than one line, you need to wrap it in curly braces. You can still use curly braces if the body is only one line, but they're optional. I'll rewrite the example to show you:

```
object Program extends App {
  val x = 20

  if (x > 10) {
    println(s"$x is greater than 10")
    println("And here's another line, so we have to be wrapped in braces")
  }
  else {
    println(s"$x is less than 10)
  }
}
```

You can also extend your conditional expressions to have more than a single true and false branch. Use `else if` to add more branches:

```
object Program extends App {
  val x = 20

  if (x > 10) {
    println(s"$x is greater than 10 but less than 15")
  }
  else if (x > 15) {
    println(s"$x is greater than 15")
  }
  else {
    println(s"$x is less than 10)
  }
}
```

Hmm, that doesn't seem quite right. Hopefully you've been following along, and if you ran that program it would have printed, "20 is greater than 10 but less than 15". That's not what we wanted. It should have said, "20 is greater than 15". What's happening is that the statements are being evaluated in order, and as soon as one of them evaluates to true the rest of them will be ignored. 20 is indeed greater than 10, so the first statement `x > 10` evaluates to true. We can fix this by swapping the two statements around, but this shows that you sometimes need to pay attention to the order in which things are written.

```
object Program extends App {
  val x = 20

  if (x > 15) {
    println(s"$x is greater than 15")
  }
  else if (x > 10) {
    println(s"$x is greater than 10 but less than 15")
  }
  else {
    println(s"$x is less than 10)
  }
}
```

When it comes to the types of statement we can use in conditionals, anything that evaluates to a boolean is fine, but we commonly write statements that compare one thing to another. For instance, we've been comparing two numbers, and evaluating whether one is greater than the other. The types of comparisons we can do are as follows:

```
x == y // True if x is equal to y
x > y // True if x is greater than y
x >= y // True if x is greater than or equal to y
x < y // True if x is less than y
x <= y // True if x is less than or equal to y
x != y // True if x does not equal y
```

That double equals `==` catches a lot of people out. Why do we have to write two `=`? Well we know that a single `=` is already used for assignment, so we need a different way of expressing that we want to do a comparison. So if you're getting errors in your comparisons, make sure you're not doing an assignment instead!

Have a bit of a play around using if statements with each of these types of comparison. When you're ready, move on to the next part.

### The next part

Right, after that diversion into the world of true and false we're ready to tackle dependency injection, stubs and mocks. Here's a problem:

```
class MilkCarton(var amountOfMilk: Int) {
  def pourMilk(x: Int) = {
    // Oooh, an if statement!
    if (x > amountOfMilk) println("Error, can't pour that much milk")
    else amountOfMilk -= x
  }
}
```

```
object Program extends App {
  val carton = new MilkCarton(amountOfMilk = 10)
  carton.pourMilk(20) // Should print "Error, can't pour that much milk"
}
```

How can we test this logic in the `pourMilk` method? It's actually pretty difficult to test that something is being printed to the terminal. And I'm not sure that printing to the terminal is actually the important logic we want to test. We actually want to make sure that some kind of alert is being generated if we try to pour too much milk. For now the alert is represented as a message being printed. But in the spirit of making things easy to change, it could be that we'd want the alert to be represented by an email being sent to someone, or something being logged in a database somewhere. We'd like to be able to change this end functionality without having to change the test of the core alerting logic. Let me express this in a test:

```
import org.scalatest._

class MilkCartonSpec extends FlatSpec with Matchers {

  "Trying to pour more milk than is available" should "result in an alert being triggered" in {
    val carton = new MilkCarton(10)
    carton.pourMilk(20)
    // How do we test the alert has been triggered here?
  }
}
```

I'm going to show you two ways of testing this, both involving a similar trick with slight of hand. Firstly I'm going to wrap the `println` call inside a method in another class, which I'll call `ConsolePrinter`. It does what it says on the tin!

```
class ConsolePrinter {
  def alert() = println("Error, can't pour that much milk")
}
```

Now we'll change our `MilkCarton` class to use our new `ConsolePrinter`. We're going to go through several steps to get to the final result, in order to demonstrate how things work, but once you've got the hang of it you can jump straight to using the whole pattern.

```
class MilkCarton(var amountOfMilk: Int) {
  val alerter = new ConsolePrinter

  def pourMilk(x: Int) = {
    if (x > amountOfMilk) alerter.alert()
    else amountOfMilk -= x
  }
}
```

You're probably thinking, "how does that help?" It doesn't seem to make it any easier to test, and it's just made our code more complicated. Well, it's time for our next step. What I'm really interested in testing is that the `ConsolePrinter`'s `alert` method has been called at the appropriate time. I don't really care what the `alert` method is doing. It could be printing to the console, or having a swordfight with another method. Whatever! So here's the first part of the trick. We're going to add an attribute to the `ConsolePrinter` that will tell us whether the alert method has been called or not.

```
class ConsolePrinter {
  var alertHasBeenCalled = false

  def alert() = {
    println("Error, can't pour that much milk")
    alertHasBeenCalled = true
  }
}
```

You might see where this is going. If you're feeling up to it, stop reading now and have a go at updating the test.

Go on, have a go.

No peeking!

Ok? Well this is how I would do it.

```
"Trying to pour more milk than is available" should "result in an alert being triggered" in {
    val carton = new MilkCarton(10)

    // Optionally make sure that the alert hasn't been called to start with
    carton.alerter.alertHasBeenCalled shouldBe false

    carton.pourMilk(20)
    carton.alerter.alertHasBeenCalled shouldBe true
  }
```

Great! Got a passing test? That must be it then!

Well, not quite. We've still got some work to do. It's generally considered bad practice to add extraneous code to your classes just to be able to test them. We want lean and focused classes. So, using this `alertHasBeenCalled` variable seems to be a good idea, but we don't want it in our `ConsolePrinter`. Here's the next part of the trick. We're going to create a **testing stub** to use instead of the `ConsolePrinter`, just for use in our tests. It could look like this:

```
class ConsolePrinterStub {
  var alertHasBeenCalled = false

  def alert() = alertHasBeenCalled = true
}
```

and our `ConsolePrinter` will go back to

```
class ConsolePrinter {
  def alert() = println("Error, can't pour that much milk")
}
```

We don't care about testing the method implementation, so the stub ignores the `println`, and just sets the `alertHasBeenCalled` variable to `true`. Now the final part of the trick is to use the stub in the test instead of the actual `ConsolePrinter`. It probably doesn't leap out at you how to do this. I mean, we're creating an instance of the `ConsolePrinter` directly inside our `MilkCarton` class:

```
class MilkCarton(var amountOfMilk: Int) {
  val alerter = new ConsolePrinter

  // Omitted code
}
```

How can we get the `alerter` to be a `ConsolePrinterStub` instead? In fact, we've already learnt the tools we need to do this. We're going to use a combination of *traits* and *constructor parameters* to decide whether we want a `ConsolePrinter` or a `ConsolePrinterStub` at the point we create the `MilkCarton` object. First lets create a trait representing objects that have an `alert` method.

```
trait Alerter {
  def alert()
}
```

Now make both our actual printer and the stub extend this trait:

```
class ConsolePrinter extends Alerter {
  // Omitted code
}
```

```
class ConsolePrinterStub extends Alerter {
  // Omitted code
}
```

Add a constructor parameter of type `Alerter` to the `MilkCarton` class:

```
class MilkCarton(var amountOfMilk: Int, alerter: Alerter) {

  def pourMilk(x: Int) = {
    if (x > amountOfMilk) alerter.alert()
    else amountOfMilk -= x
  }
}
```

In our `Program` object, pass a `ConsoleAlerter` into the `MilkCarton` when it's newed up:

```
object Program extends App {
  val carton = new MilkCarton(amountOfMilk = 10, alerter = new ConsolePrinter)

  carton.pourMilk(20) // Should print out "Error, can't pour that much milk
}
```

And pass the stub into the `MilkCarton` in the test:

```
"Trying to pour more milk than is available" should "result in an alert being triggered" in {

  // We need to have a variable to keep reference to the stub, so we can refer to it later
  val alerter = new ConsolePrinterStub

  val carton = new MilkCarton(amountOfMilk = 10, alerter)

  // Optionally make sure that the alert hasn't been called to start with
  alerter.alertHasBeenCalled shouldBe false

  carton.pourMilk(20)
  alerter.alertHasBeenCalled shouldBe true
}
```

Hooray, everything's wired up. Take your time to look through that again, and make sure you understand how it works. This pattern of passing in, or injecting, dependencies into classes is called **dependency injection**, and is a really useful way to make sure that your code is well structured, well tested, and easy to change. In terms of being easy to change, let's say I want to use a different dependency to do the alerting, perhaps to send an email instead of printing to the console. As long as that class has an `alert` method and extends the `Alerter` trait, all we have to do is pass in a new instance of this class to the `MilkCarton` instead, and we don't have to change any of the code in our class.

```
class EmailSender extends Alerter {
  def alert() = // Some code to send an email
}
```

```
object Program extends App {
  val carton = new MilkCarton(amountOfMilk = 10, alerter = new EmailSender)

  carton.pourMilk(20) // Should send an email
}
```

Nice!

A common real world use case for dependency injection is using a dependency to save data. When you start writing an application, you want to get something working as quickly as possible to get early feedback on it. So you might decide it's quickest just to save things to memory. But then you start getting real users, and just saving things to memory isn't good enough, as everything will be lost when the application is restarted. So you decide to switch out your dependency that saves to memory with a dependency that saves to the file system. Then your application starts getting really successful, and you want to do analytics on the data that's been saved. Storing your data in files isn't ideal for doing analytics, so you swap out your file system saver dependency with a database saver dependency. And all this time you don't have to change the core code of your application. You're just injecting different dependencies.

### Mocking dependencies

We've seen how to substitute our dependencies with stubs for testing purposes. I said earlier that I'd show you two ways of testing the alerting functionality in the `MilkCarton` class. The alternative to creating stubs is to use a mocking framework. This is quite similar, in that it relies on using dependency injection, but you don't have to create special versions of your dependencies just for testing. We're going to rework the `MilkCarton` example to illustrate using mocks.

We need to install the Mockito framework in our project in order to be able to use mocks. Add the following line at the bottom of your `build.sbt` file:

```
libraryDependencies += "org.mockito" % "mockito-core" % "2.15.0"
```

IntelliJ should now download Mockito for you. If it doesn't seem to recognise Mockito as you follow along with the example code, you might not have turned on auto imports. If so, go the the *terminal* tab at the bottom of IntelliJ and run `sbt update`.

We're going to go back to the `MilkCartonSpec` file and add another test. We need to make Mockito available within our file, which means importing it into the file. Add the imports at the top of the file, like so:

```
import org.scalatest._
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
```

We're also going to have our `MilkCartonSpec` class extend another trait, which will allow us to use the Mockito syntax in our tests:

```
class MilkCartonSpec extends FlatSpec with Matchers with MockitoSugar {

}
```

So for reference, our test file should now look like this:

```
import org.scalatest._
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar

class MilkCartonSpec extends FlatSpec with Matchers with MockitoSugar {

  "Trying to pour more milk than is available" should "result in an alert being triggered" in {

    // We need to have a variable to keep reference to the stub, so we can refer to it later
    val alerter = new ConsolePrinterStub

    val carton = new MilkCarton(amountOfMilk = 10, alerter)

    // Optionally make sure that the alert hasn't been called to start with
    alerter.alertHasBeenCalled shouldBe false

    carton.pourMilk(20)
    alerter.alertHasBeenCalled shouldBe true
  }
}
```

Add another test below. It's going to be testing the same thing as the existing test, but two tests can't share the same name within a class, so we'll have to call it something different. I'm going to call mine,

```
"Using a mock" should "work" in {
  // To do
}
```

Don't worry too much about remembering the syntax for mocking. This is just to show you the principals behind it. A quick Internet search for "Scalatest mocks" will point you to lots more information if you want to dig deeper. The syntax for creating a mock is the word `mock` followed by the name of the class or trait you want to mock inside square brackets. In our example, we want to create a mock of the `Alerter` trait, so the syntax is `mock[Alerter]`. We need to assign the mock to a value, so that we can refer to it later. Let's start by adding the mock to our test:

```
"Using a mock" should "work" in {
  val mockAlerter = mock[Alerter]
  // To do
}
```

By the way, don't give your val the name `mock`, as it won't work, and it won't be obvious why it isn't working. An easy way to consistently name your mocks is to prepend the word `mock` to the name of the thing you're mocking.

Now we've got an object that is a mock of the `Alerter`. We can use this just like any object that extends `Alerter`. For instance, we can pass it into methods or constructors that expect an `Alerter` parameter, and we can call any of the methods defined in the `Alerter` trait on it. Let's try calling `alert()` on our mock:

```
"Using a mock" should "work" in {
  val mockAlerter = mock[Alerter]
  mockAlerter.alert()
  // To do
}
```

You might think this would cause a problem, as there's no method body defined for our `alert` method. But the mocking framework is kind of automatically creating a stub for you. You can imagine that behind the scenes the mock is holding some state about whether the method has been called or not, and when you call the method it updates the state. The way to verify whether a method has been called on a mock is to pass the mock into Mockito's `verify` method, then call the method you want to verify. It's easier to demonstrate this than to describe it:

```
"Using a mock" should "work" in {
  val mockAlerter = mock[Alerter]
  mockAlerter.alert()
  verify(mockAlerter).alert()
}
```

So what this test is doing is creating a mock of the `Alerter`, calling the `alert` method on the mock, then verifying that the `alert` method was called. If you swap the last two lines the test should fail, because you'd be trying to verify that the method has been called before it was actually called.

We're almost there. Lets just add in our `MilkCarton` to the test:

```
"Using a mock" should "work" in {
  val mockAlerter = mock[Alerter]
  val carton = new MilkCarton(amountOfMilk = 10, alerter = mockAlerter)

  carton.pourMilk(20)

  verify(mockAlerter).alert()
}
```

Mockito has lots of cool features to help you simulate your dependencies and test how they are being used. When your dependency has got complex behaviour you might have to end up writing an even more complicated stub to test it, whereas mocking can be a lot more flexible. A couple of features you might find interesting are counting the number of times a method has been called on a mock,

```
"Using a mock" should "work" in {
  val mockAlerter = mock[Alerter]
  val carton = new MilkCarton(amountOfMilk = 10, alerter = mockAlerter)

  verify(mockAlerter, times(0)).alert // Make sure alert hasn't been called yet

  carton.pourMilk(20)
  verify(mockAlerter, times(1)).alert() // Alert should have been called once

  carton.pourMilk(20)
  verify(mockAlerter, times(2)).alert() // Alert should have been called twice
}
```

and being able to specify the behaviour you expect from your mock. As a completely contrived example, lets say we want to test a method that takes a random number generator dependency. If the dependency generates a number below 10, then our method returns the random number times 2. If it generates a number over 10, then it returns the number divided by 2. So our random number generator trait would look like this:

```
trait RandomNumberGenerator {
  def getNumber(): Int
}
```

And our method will look like this:

```
object Contrived {

  def doSomeFunkyMaths(rng: RandomNumberGenerator) = {
    val randomNumber = rng.getNumber()

    if (randomNumber < 10) randomNumber * 2
    else randomNumber / 2
  }
}
```

Now I want to write the following tests:

```
import org.scalatest._
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar

class ContrivedSpec extends FlatSpec with Matchers with MockitoSugar {

  "DoSomeFunkyMaths" should "return double a random number that is less than 10" in {
    // To do
  }

  "DoSomeFunkyMaths" should "return half a random number that is more than 10" in {
    // To do
  }
}
```

We can't use a real random number generator, as we have no way of finding the value it is giving to the method, so we can't test whether our method is doubling it or halving it correctly. We need to test with a dependency where we can control the number that is being generated. Mockito gives us a nice way of doing this, by specifying what behaviour we want a method to have.

```
"DoSomeFunkyMaths" should "return double a random number that is less than 10" in {
  val mockRNG = mock[RandomNumberGenerator]

  // Specify that the mock RNG should return 2 when the getNumber method is called
  when(mockRNG.getNumber).thenReturn(2) 

  Contrived.doSomeFunkyMaths(mockRNG) shouldBe 4
}

"DoSomeFunkyMaths" should "return half a random number that is more than 10" in {
  val mockRNG = mock[RandomNumberGenerator]

  // Specify that the mock RNG should return 40 when the getNumber method is called
  when(mockRNG.getNumber).thenReturn(40)

  Contrived.doSomeFunkyMaths(mockRNG) shouldBe 20
}
```

### Summary

Well done! That was a tough chapter. I know some of these concepts can be a bit mind bending, but if you can basically understand the idea of what's going on here, all it needs is practice for it to become second nature. Testing with stubs and mocks could fill up its own book, so we've really only scratched the surface here, but you've now got a good grounding in the fundamentals. Many people who write code for a living don't know these techniques for writing clear and well tested code, so if you're following along give yourself a big pat on the back!