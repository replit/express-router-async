## express-async-router

```js
const router = require('express-async-router')();
router.getAsync(async (req, res) => {
  const wow = await makeSomethingAmazing();
  res.json(wow);
});
```
