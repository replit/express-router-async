## express-async-router

```js
const router = require('express-router-async')();
router.getAsync(async (req, res) => {
  const wow = await makeSomethingAmazing();
  res.json(wow);
});
```
[![Run on Repl.it](https://repl.it/badge/github/replit/express-router-async)](https://repl.it/github/replit/express-router-async)