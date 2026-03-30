# Error Handling For Async Programming in JS

## Why try/catch fails with async callbacks

`try/catch` works by wrapping the **current call stack**. When an error is thrown, JavaScript walks back up the stack looking for a `catch` block. If it finds one, great — it's handled.

The problem is that an async callback doesn't run on your call stack at all. By the time the event loop picks it up and runs it, your `try/catch` block has **already finished and left the stack entirely**. There's nothing to catch.

Think of it like this: you set a kitchen timer and leave the house. When the timer goes off, you're not there to hear it. The house doesn't know where you went. That's your `try/catch` — it was only "listening" while you were still in the room.

```js
try {
  setTimeout(() => {
    throw new Error("oops"); // thrown on the EVENT LOOP's stack, not yours
  }, 1000);
} catch (e) {
  // Your try/catch exited ~999ms ago. Nobody's home.
  console.log("never runs");
}
```

---

## Why error-first callbacks exist

Since you can't use `try/catch`, Node.js needed a different convention to signal failure. The solution: **always pass the error as the first argument to the callback**. It's just a rule everyone agreed to follow.

```js
fs.readFile("file.txt", (err, data) => {
  if (err) {
    // handle failure
    return;
  }
  // handle success
});
```

The problem is this is entirely manual and trust-based. Nothing forces you to check `err`. You can ignore it, forget it, or check it in the wrong order. And if you have several async operations that depend on each other, you get deeply nested callbacks — "callback hell" — each with its own `err` check.

---

## How Promises change the model

A Promise is an object that represents a value that will arrive _eventually_. Instead of passing a callback in, you chain `.then()` for success and `.catch()` for failure.

```js
fs.promises
  .readFile("file.txt")
  .then((data) => {
    console.log(data.toString());
  })
  .catch((err) => {
    console.error("Failed:", err.message);
  });
```

The key shift: the **Promise itself** is responsible for routing errors to `.catch()`. You're no longer checking `err` manually. But the chain of `.then().then().catch()` can still get awkward to read.

---

## How async/await fixes the whole thing

`async/await` is syntax built on top of Promises. It lets you write async code that _looks_ synchronous — and critically, it makes `try/catch` work again.

```js
async function readFile() {
  try {
    const data = await fs.promises.readFile("file.txt");
    console.log(data.toString()); // success path
  } catch (err) {
    console.error("Failed:", err.message); // failure path
  }
}
```

Why does `try/catch` work here? Because `await` **pauses the function** at that line and suspends it until the Promise resolves or rejects. When it rejects, the error is re-thrown _inside your function's context_ — so the `catch` block is still "in the room" when the error happens. The event loop mechanics are the same underneath, but `async/await` hides them and restores the error-handling model you'd use for any normal synchronous code.

---

# How we handle error in each method in detail?

Great question. You have a few options depending on what you want to do when a specific step fails.

---

## Option 1: Pass a rejection handler as the second argument to `.then()`

`.then()` actually accepts two arguments — a success handler and an error handler.

```js
getUser(userId)
  .then(
    (user) => getProfile(user.id), // success
    (err) => console.error("getUser failed:", err), // error for THIS step only
  )
  .then(
    (profile) => getPosts(profile.id),
    (err) => console.error("getProfile failed:", err),
  )
  .then(
    (posts) => getComments(posts[0].id),
    (err) => console.error("getPosts failed:", err),
  )
  .catch((err) => console.error("something else failed:", err));
```

This works but has a subtle problem: if the error handler doesn't return anything or throw, the chain **keeps going** with `undefined` passed to the next `.then()`. That can cause confusing bugs down the line.

---

## Option 2: Insert a `.catch()` after each step

A `.catch()` in the middle of a chain only catches errors from the steps **above it**. After it handles the error, the chain continues downward.

```js
getUser(userId)
  .then((user) => getProfile(user.id))
  .catch((err) => {
    console.error("Step 1 failed:", err);
    return null; // decide what to pass to the next step
  })
  .then((profile) => {
    if (!profile) return null; // guard against the null from above
    return getPosts(profile.id);
  })
  .catch((err) => {
    console.error("Step 2 failed:", err);
    return [];
  })
  .then((posts) => getComments(posts?.[0]?.id))
  .catch((err) => console.error("Step 3 failed:", err));
```

The awkward part here: after a `.catch()` recovers, you need to manually guard the next `.then()` against bad values. It gets messy fast.

---

## Option 3: async/await with individual try/catch blocks (the clean way)

This is the real answer to your question. With `async/await` you can wrap **each step** in its own `try/catch` independently, with full control over what happens on each failure.

```js
async function loadUserData(userId) {
  let user;
  try {
    user = await getUser(userId);
  } catch (err) {
    console.error("getUser failed:", err);
    return; // or throw, or use a fallback
  }

  let profile;
  try {
    profile = await getProfile(user.id);
  } catch (err) {
    console.error("getProfile failed:", err);
    return;
  }

  let posts;
  try {
    posts = await getPosts(profile.id);
  } catch (err) {
    console.error("getPosts failed:", err);
    return;
  }

  const comments = await getComments(posts[0].id);
  console.log(user, profile, posts, comments);
}
```

Each step fails independently. If `getProfile` fails, `getUser` already succeeded and you know exactly where the chain broke. No ambiguity.

---

## Option 4: A helper that catches per-step without try/catch noise [Important]

If the per-step `try/catch` feels verbose, a small helper can clean it up — this is a common pattern in Go-style error handling adapted for JS:

```js
const attempt = (promise) =>
  promise.then((data) => [null, data]).catch((err) => [err, null]);

async function loadUserData(userId) {
  const [err1, user] = await attempt(getUser(userId));
  if (err1) {
    console.error("getUser failed:", err1);
    return;
  }

  const [err2, profile] = await attempt(getProfile(user.id));
  if (err2) {
    console.error("getProfile failed:", err2);
    return;
  }

  const [err3, posts] = await attempt(getPosts(profile.id));
  if (err3) {
    console.error("getPosts failed:", err3);
    return;
  }

  const comments = await getComments(posts[0].id);
  console.log(user, profile, posts, comments);
}
```

Each call returns `[error, result]`. You check the error immediately after each step — similar to the error-first callback convention, but without the nesting.

---

**The short version:**

| Approach                    | Per-step errors | Readability            |
| --------------------------- | --------------- | ---------------------- |
| `.then(onSuccess, onError)` | ✅              | ❌ gets confusing      |
| Mid-chain `.catch()`        | ✅              | ⚠️ needs manual guards |
| `async/await` + `try/catch` | ✅              | ✅ clear and explicit  |
| `attempt()` helper          | ✅              | ✅ compact, Go-style   |

For most real code, **Option 3** is the standard. **Option 4** is worth knowing when you have many sequential async steps and want to keep things flat.
