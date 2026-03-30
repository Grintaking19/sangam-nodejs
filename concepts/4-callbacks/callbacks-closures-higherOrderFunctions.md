# Callbacks vs Closures vs Higher Order Functions

### The three concepts are one idea, seen from three angles

**A callback** is a function you hand to someone else to call later. It answers the question: _what should run when something happens?_

**A higher-order function** is the thing that receives (or produces) that callback. It answers the question: _who accepts or creates functions as values?_

**A closure** is what makes a callback useful — it lets the callback remember the world it was born in, even after that world is gone. It answers the question: _how does a callback remember its context when it eventually runs?_

The reason they feel inseparable in JavaScript is that async callbacks always run after their outer function has returned. Without closures, an async callback would have no memory of what it was supposed to do — no `userId`, no `filePath`, no `count`. The closure is the mechanism that keeps that context alive across time.

---

# Why Are Callbacks Considered "Asynchronous"?

Callbacks themselves are **NOT asynchronous**. A callback is just a function. What makes code async is **WHO calls the callback and WHEN** — specifically, whether it gets called from the event loop after the current call stack is empty.

---

## Synchronous Callbacks — Called Immediately, Right Now

```js
// forEach's callback is synchronous — runs inline
console.log("before");
[1, 2, 3].forEach((n) => {
  console.log(n); // called RIGHT NOW, inside forEach
});
console.log("after");
// Output: before → 1 → 2 → 3 → after
// Perfectly sequential. No event loop involved.

// Array.sort callback is also synchronous
const sorted = [3, 1, 2].sort((a, b) => a - b);
// The comparator is called synchronously inside sort()
console.log(sorted); // [1, 2, 3]
```

Synchronous callbacks run on the **same call stack, in the same tick**. They don't involve the event loop at all. `forEach` and `sort` are synchronous functions that happen to accept callbacks.

---

## Asynchronous Callbacks — Called Later, From the Event Loop

```js
console.log("1 - start");

setTimeout(() => {
  // This callback is NOT called by your code.
  // It's called by the EVENT LOOP, after:
  //   1. Your synchronous code finishes
  //   2. The timer expires
  //   3. The JS thread is free
  console.log("3 - timeout callback");
}, 0); // even delay=0 doesn't make it synchronous

console.log("2 - end");
// Output: 1 - start → 2 - end → 3 - timeout callback
//
// The callback runs AFTER "2 - end" even with 0ms delay.
// Why? Because it goes through the event loop queue,
// which only drains AFTER the current call stack empties.
```

The callback didn't become async by magic. `setTimeout` handed it to the Timer API, which gave it to the callback queue. The event loop pulled it off the queue only after the stack was empty. **The callback is just a function — the MECHANISM around it is what's async.**

---

## The Real Question: Who Calls the Callback?

```js
// Rule: if the callback is called by YOUR code  → synchronous
//       if the callback is called by the EVENT LOOP → async

function runSync(cb) {
  cb(); // you call it immediately → SYNC
}

function runAsync(cb) {
  setTimeout(cb, 0); // event loop calls it later → ASYNC
}

// How to tell which one you're dealing with:
let called = false;

runSync(() => {
  called = true;
});
console.log("After runSync, called =", called); // true  ← sync

called = false;

runAsync(() => {
  called = true;
});
console.log("After runAsync, called =", called); // false ← async!
// The callback hasn't run yet when we hit this line
```

This distinction matters because **async callbacks can't return values to their caller** — by the time they run, the caller is long gone from the call stack. That's why Node.js-style callbacks pass results as arguments (the error-first pattern).

---

## The Node.js Error-First Callback Convention

```js
// Convention: callback(error, result)
// First argument is always the error (null if none)
// Second argument is the result

fs.readFile("file.txt", (err, data) => {
  // ① Always check for error first
  if (err) {
    console.error("Failed:", err.message);
    return; // stop here
  }
  // ② Only reach here if no error
  console.log("Data:", data.toString());
});
```

**Why this convention?** Because async callbacks can't use `try/catch` from the caller:

```js
try {
  fs.readFile("file.txt", (err, data) => {
    throw new Error("oops"); // this is NOT caught by the try/catch!
    // It's thrown from inside the event loop,
    // long after the try/catch block has already exited.
  });
} catch (e) {
  console.log("never reaches here");
}
```

This is why async error handling in callbacks feels awkward — you literally cannot use `try/catch`. The callback runs in a **completely different call stack**. Promises and `async/await` solve this by restoring normal error flow.

---

# All Three Concepts Working Together

Callbacks, higher-order functions, and closures aren't three separate things — they're three angles on the same behavior. Here's how they combine in real code.

---

## The Relationship Diagram

```js
// ┌─────────────────────────────────────────────────┐
// │  HIGHER-ORDER FUNCTION                          │
// │  A function that accepts or returns functions   │
// │                                                 │
// │    function withLogging(fn) {   ← takes fn      │
// │      return function(...args) { ← returns fn    │
// │        console.log('calling');                  │
// │        return fn(...args);   ← uses CALLBACK    │
// │      };  ↑                                      │
// │    }     └── returned fn CLOSES OVER fn         │
// │              that's the CLOSURE                 │
// └─────────────────────────────────────────────────┘
//
// withLogging      → higher-order function (takes + returns fn)
// fn               → callback (passed in to be called later)
// the returned fn  → closure (remembers fn from outer scope)
```

`withLogging` is simultaneously: a HOF (takes `fn`, returns `fn`), a callback receiver (`fn` is a callback), and a closure factory (the returned function closes over `fn`). All three concepts live in 4 lines of code.

---

## Building a Real Retry Utility — All Three at Once

```js
// retry() is a HOF: takes an async function, returns a function
// The returned function is a closure: remembers fn, times, delay
// fn is a callback: passed in to be called later (possibly multiple times)

function retry(fn, times = 3, delay = 1000) {
  // ↑ HOF: takes fn as argument

  return async function (...args) {
    // ↑ returns a function (closure over fn, times, delay)

    let lastError;

    for (let attempt = 1; attempt <= times; attempt++) {
      try {
        return await fn(...args); // ← fn is the callback being "called back"
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${attempt} failed: ${err.message}`);

        if (attempt < times) {
          await new Promise(
            (resolve) => setTimeout(resolve, delay * attempt), // exponential backoff
          );
        }
      }
    }

    throw lastError; // all attempts failed
  };
}

// Usage:
async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// fetchWithRetry is a new function that wraps fetchData with retry logic
const fetchWithRetry = retry(fetchData, 3, 500);

// Call it just like fetchData — but it retries automatically
fetchWithRetry("/api/users")
  .then((data) => console.log("Got data:", data))
  .catch((err) => console.error("All retries failed:", err));
```

`retry()` is a perfect example of all three: it's a HOF that takes a callback (`fn`) and returns a closure. The returned function remembers `fn`, `times`, and `delay` from its birth scope — and calls `fn` back potentially multiple times.

---

## Callback Hell — And How Closures Make It Worse

```js
// Classic callback hell — each callback is a closure
// that captures variables from outer callbacks
getUser(userId, function (err, user) {
  // closure 1
  if (err) return handleError(err);

  getProfile(user.id, function (err, profile) {
    // closure 2 — captures user
    if (err) return handleError(err);

    getPosts(profile.id, function (err, posts) {
      // closure 3 — captures user, profile
      if (err) return handleError(err);

      getComments(posts[0].id, function (err, comments) {
        // closure 4 — captures all
        // Now 4 closures deep. Each one holds references
        // to user, profile, posts, comments in memory.
        // Hard to read. Hard to error-handle. Hard to test.
        console.log(user, profile, posts, comments);
      });
    });
  });
});
```

```js
// Promises flatten the nesting (still use closures internally):
getUser(userId)
  .then((user) => getProfile(user.id))
  .then((profile) => getPosts(profile.id)) // ← lost user here!
  .then((posts) => getComments(posts[0].id))
  .then((comments) => console.log(comments));
```

```js
// async/await — reads like sync, closures still there under the hood:
async function loadUserData(userId) {
  const user = await getUser(userId);
  const profile = await getProfile(user.id);
  const posts = await getPosts(profile.id);
  const comments = await getComments(posts[0].id);
  console.log(user, profile, posts, comments); // all accessible
}
```

Promises and `async/await` don't eliminate closures — they **hide** them. The closure behavior is still happening under the hood. `async/await` just makes the nesting flat so variables stay in scope naturally without deep nesting.

---

### The one-sentence summary of each

`callback` — a function passed as an argument, to be called later by someone else.

`higher-order function` — any function that takes or returns another function.

`closure` — a function bundled together with the variables from its birth scope, keeping them alive as long as the function lives.
