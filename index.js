import { Scallop, ScallopAddress } from "@scallop-io/sui-scallop-sdk";
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 3000;

let client, scallopQuery;

const scallopSDK = new Scallop({
  addressId: "67c44a103fe1b8c454eb9699",
  networkType: "mainnet",
});

const scallopAddress = new ScallopAddress({
  addressId: "67c44a103fe1b8c454eb9699",
  network: "mainnet",
});

scallopSDK
  .createScallopClient()
  .then((c) => {
    client = c;
    return scallopSDK.createScallopQuery();
  })
  .then((sq) => {
    scallopQuery = sq;
    console.log("Client and ScallopQuery initialized");
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing Scallop SDK:", error);
  });

app.use(express.json());

app.get("/", (req, res) => {
  console.log('process.env["START_PHRASE"]: ', process.env["START_PHRASE"]);
  res.send(process.env["START_PHRASE"]);
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

app.get("/collateral", async (req, res) => {
  try {
    const collateralData = await scallopQuery.getMarketCollaterals();
    res.send(collateralData);
  } catch (error) {
    console.error(`Error in /collateral route:`, error);
    res.status(500).send({ error: "Failed to fetch collateral data" });
  }
});

app.get("/collateral/:coin", async (req, res) => {
  try {
    const coinCollateralData = await scallopQuery.getMarketCollateral(
      req.params.coin,
    );
    res.send(coinCollateralData);
  } catch (error) {
    console.error(
      `Error in /collateral/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch collateral data for coin ${req.params.coin}`,
    });
  }
});

app.get("/price/:coin", async (req, res) => {
  try {
    const coinPrice = await scallopQuery.getPriceFromPyth(req.params.coin);
    res.send(coinPrice);
  } catch (error) {
    console.error(
      `Error in /price/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch collateral data for coin ${req.params.coin}`,
    });
  }
});

app.get("/addresses", async (req, res) => {
  try {
    await scallopAddress.read();
    const addresses = scallopAddress.getAddresses();
    res.send(addresses);
  } catch (error) {
    console.error(`Error in /addresses route:`, error);
    res.status(500).send({ error: "Failed to fetch address data" });
  }
});

app.get("/client-address", async (req, res) => {
  try {
    res.send(client.walletAddress);
  } catch (error) {
    console.error(`Error in /addresses route:`, error);
    res.status(500).send({ error: "Failed to fetch client stake data" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
