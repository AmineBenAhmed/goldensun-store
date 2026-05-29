import "dotenv/config"
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from './webhooks/clerk';
import { getEnv } from './lib/env';
import fs from "node:fs";
import path from "node:path";
import keepProductionAliceCron from "./lib/cron";

import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";

const env = getEnv();
const app = express();


const rawJson = express.raw({ type: "application/json", limit: "1mb" });
app.post("/webhooks/clerk", rawJson, (req, res) => {
  console.log("webhook function")
  void clerkWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
})

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);

const publicDir = path.join(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    const isGetOrHead = req.method === "GET" || req.method === "HEAD";
    const isApiOrWebhook =
      req.path.startsWith("/api") || req.path.startsWith("/webhooks");

    if (!isGetOrHead || isApiOrWebhook) {
      return next();
    }

    //Serve project index.html 
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

app.listen(env.PORT, () => {
  console.log('System running on port ', env.PORT, '...')
  keepProductionAliceCron.start();
})

