## express-async-router

```js
const router = require('express-router-async')();
router.getAsync(async (req, res) => {
  const wow = await makeSomethingAmazing();
  res.json(wow);
});
```
