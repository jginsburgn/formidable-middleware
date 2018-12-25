# A formidable Proxy Mountable as a Middleware

A proxy for [formidable][original-formidable] that acts as an Express middleware.

Use as follows:

```typescript
import express, {
  Express,
  Response,
} from "express";
import {
  FormidableMiddleware,
  FormidableMiddlewareRequest,
} from "@jginsburgn/formidable-middleware";

const app: Express = express();
const formidableFormConfiguration = {
  maxFileSize: 10 * 1024 ** 3 // 10 GB
};

app.post("/", FormidableMiddleware(formidableFormConfiguration), (req: FormidableMiddlewareRequest, res: Response) => {
  for (const file of req.body.files) {
    // Do what you wish with the file...
  }
  for (const field of req.body.fields) {
    // Do what you wish with the field...
  }
});

app.listen(80, "0.0.0.0");
```

[original-formidable]: https://github.com/felixge/node-formidable