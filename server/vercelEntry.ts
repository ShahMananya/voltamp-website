import { createExpressApp } from "./_core/app";
import { seoPrerenderMiddleware } from "./seoPrerender";

const app = createExpressApp();
app.use(seoPrerenderMiddleware);

export default app;
