import { Scallop } from "@scallop-io/sui-scallop-sdk";
import express from "express";
const app = express();
const port = 3000;

const scallopSDK = new Scallop({
  addressId: "67c44a103fe1b8c454eb9699",
  networkType: "mainnet",
});

const scallopQuery = await scallopSDK.createScallopQuery();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is a SCALLOP SIMPLE SERVER");
});

app.get("/apy", async (req, res) => {
  try {
    const marketData = await scallopQuery.getMarketPools();
    res.send(marketData);
  } catch (error) {
    console.error("Error in /apy route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/apy/:coin", async (req, res) => {
  try {
    console.log("req.params.coin: ", req.params.coin);
    const coinMarketData = await scallopQuery.getMarketPool(req.params.coin);
    res.send(coinMarketData);
  } catch (error) {
    console.error(
      `Error in /apy/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch market data for coin ${req.params.coin}`,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
