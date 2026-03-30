// Example of a promise that resolves after a delay
function delayFn(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Done");
    }, time);
  });
}

delayFn(2000).then((message) => {
  console.log(message);
});

// Example of a promise that rejects
function divide(a, b) {
  return new Promise((resolve, reject) => {
    if (b === 0) {
      reject(new Error("Cannot divide by zero"));
    } else {
      resolve(a / b);
    }
  });
}

divide(10, 0)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error.message);
  });
// Example of chaining promises
fetch("https://api.animechan.io/v1/quotes/random")
  .then((response) => response.json())
  .catch((error) => console.error("Error fetching quote:", error))
  .then((quote) => console.log(quote.data)) // Basically, we are fetching a random quote from the animechan API and logging it to the console.
  .catch((error) => console.error("Error processing quote:", error));
