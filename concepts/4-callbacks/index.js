// Pyramid of Doom (Callback Hell)
// In 2-file-system we have seen how to do async operations using callbacks, but as you can see, it is not a good way to do async operations
// because it leads to callback hell, which is a situation where we have multiple nested callbacks
// and it becomes difficult to read and maintain the code.
setTimeout(() => {
  console.log("1st Callback");
  setTimeout(() => {
    console.log("2nd Callback");
    setTimeout(() => {
      console.log("3rd Callback");
    }, 1000);
  }, 1000);
}, 1000);


