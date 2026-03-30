function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function delayedGreeting(time) {
  await delay(time);
  console.log(`Hello after ${time / 1000} seconds!`);
}

delayedGreeting(2000); // Logs "Hello after 2 seconds!" after a 2-second delay

// retry function

function retry(fn, retries = 3, delayTime = 1000) {
  return async function (...args) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        if (i === retries - 1) {
          throw error;
        }
        console.warn(
          `Attempt ${i + 1} failed. Retrying in ${delayTime / 1000} seconds...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delayTime * (i + 1)),
        ); // Exponential backoff (Not to overload the server)
      }
    }
    throw lastError;
  };
}

// Example usage of retry function
async function fetchData() {
  const response = await fetch("https://api.animechan.io/v1/quotes/random");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
}

const fetchDataWithRetry = retry(fetchData, 5, 2000);
fetchDataWithRetry()
  .then((data) => console.log(data))
  .catch((error) =>
    console.error("Failed to fetch data after retries:", error),
  );



  