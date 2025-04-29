import { Scallop } from "@scallop-io/sui-scallop-sdk";
import { MmtSDK } from "@mmt-finance/clmm-sdk";
import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { QueryChain } from "@firefly-exchange/library-sui/dist/src/spot/index.js";
import { SuiClient } from "@firefly-exchange/library-sui";
import { mainnet } from "./config.js";
import { getFullnodeUrl } from "@mysten/sui/client";

import { BETA_CONFIG, MAINNET_CONFIG, SteammSDK } from "@suilend/steamm-sdk";

const address =
  "0x298d88a5819930540d10503ca722c2a82d431bf0b36391b84a11079f925412fa";

import express from "express";
import axios from "axios";
const app = express();
const port = 3000;
import http from "http";
import * as dotenv from "dotenv";
dotenv.config();

const server = http.createServer(app);
server.setTimeout(4 * 60 * 1000); // 2 минуты

server.on("timeout", (socket) => {
  console.log("Timeout occurred");
  socket.end("Request timed out"); // Закрываем соединение
});

app.use(express.json());

const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });

const scallopSDK = new Scallop({
  addressId: "67c44a103fe1b8c454eb9699",
  networkType: "mainnet",
});

let scallopQuery;

scallopSDK
  .createScallopQuery()
  .then((sq) => {
    scallopQuery = sq;
    console.log("ScallopQuery initialized");
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing Scallop SDK:", error);
  });

const cetusSDK = initCetusSDK({ network: "testnet" });

const mmtSDK = MmtSDK.NEW({
  network: "mainnet",
});

const rpcUrl = getFullnodeUrl("mainnet");
const suilendSDK = new SteammSDK({
  ...(process.env.NEXT_PUBLIC_STEAMM_USE_BETA_MARKET === "true"
    ? BETA_CONFIG
    : MAINNET_CONFIG),
  fullRpcUrl: rpcUrl,
});

suilendSDK.senderAddress =
  address ??
  "0x0000000000000000000000000000000000000000000000000000000000000000";

app.get("/", (req, res) => {
  res.send(process.env.START_PHRASE);
});

app.get("/sca/balance/:address", async (req, res) => {
  try {
    const balance = await scallopQuery.getUserPortfolio({
      walletAddress: req.params.address,
    });
    res.send(balance);
  } catch (error) {
    console.error("Error in /sca/balance/:address route:", error);
    res.status(500).send({ error: "Failed to fetch user balance" });
  }
});

app.get("/sca/pools", async (req, res) => {
  try {
    const marketData = await scallopQuery.getMarketPools();
    res.send(marketData);
  } catch (error) {
    console.error("Error in /sca/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/sca/pools/:coin", async (req, res) => {
  try {
    const coinMarketData = await scallopQuery.getMarketPool(req.params.coin);
    res.send(coinMarketData);
  } catch (error) {
    console.error(
      `Error in /sca/pools/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch market data for coin ${req.params.coin}`,
    });
  }
});

app.get("/sca/collateral", async (req, res) => {
  try {
    const collateralData = await scallopQuery.getMarketCollaterals();
    res.send(collateralData);
  } catch (error) {
    console.error(`Error in /sca/collateral route:`, error);
    res.status(500).send({ error: "Failed to fetch collateral data" });
  }
});

app.get("/sca/collateral/:coin", async (req, res) => {
  try {
    const coinCollateralData = await scallopQuery.getMarketCollateral(
      req.params.coin,
    );
    res.send(coinCollateralData);
  } catch (error) {
    console.error(
      `Error in /sca/collateral/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch collateral data for coin ${req.params.coin}`,
    });
  }
});

app.get("/sca/price/:coin", async (req, res) => {
  try {
    const coinPrice = await scallopQuery.getPriceFromPyth(req.params.coin);
    res.send(coinPrice);
  } catch (error) {
    console.error(
      `Error in /sca/price/:coin route for coin ${req.params.coin}:`,
      error,
    );
    res.status(500).send({
      error: `Failed to fetch price for coin ${req.params.coin}`,
    });
  }
});

app.get("/mmt/balance/:address", async (req, res) => {
  try {
    const balance = await mmtSDK.Position.getAllUserPositions(
      req.params.address,
    );
    res.send(balance);
  } catch (error) {
    console.error("Error in /mmt/balance/:address route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/mmt/pools", async (req, res) => {
  try {
    const marketData = await mmtSDK.Pool.getAllPools();
    res.send(marketData);
  } catch (error) {
    console.error("Error in /mmt/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/mmt/pools/:poolId", async (req, res) => {
  try {
    const poolInfo = await mmtSDK.Pool.getPool(req.params.poolId);
    res.send(poolInfo);
  } catch (error) {
    console.error("Error in /mmt/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/mmt/tokens", async (req, res) => {
  try {
    const marketData = await mmtSDK.Pool.getAllTokens();
    res.send(marketData);
  } catch (error) {
    console.error("Error in /mmt/tokens route:", error);
    res.status(500).send({ error: "Failed to fetch tokens" });
  }
});

app.get("/cetus/balance/:address", async (req, res) => {
  try {
    const balance = await cetusSDK.Position.getPositionList(
      req.params.address,
      [],
      false,
    );
    res.send(balance);
  } catch (error) {
    console.error("Error in /cetus/balance/:address route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/cetus/pools", async (req, res) => {
  try {
    const marketData = await cetusSDK.Pool.getPoolsWithPage([]);
    res.send(marketData);
  } catch (error) {
    console.error("Error in /cetus/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/cetus/pools/:poolId", async (req, res) => {
  try {
    const poolInfo = await cetusSDK.Pool.getPool(req.params.poolId);
    res.send(poolInfo);
  } catch (error) {
    console.error("Error in /mmt/pools route:", error);
    res.status(500).send({ error: "Failed to fetch pool data" });
  }
});

app.get("/blue/pools", async (req, res) => {
  try {
    const { data } = await axios.get(
      process.env["BLUEFIN_URL"] + "/pools/info",
    );

    const serializedPoolData = data.map((item) => serializeObject(item));

    res.send(serializedPoolData);
  } catch (error) {
    console.error("Error in /blue/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/blue/tokens", async (req, res) => {
  try {
    const { data } = await axios.get(
      process.env["BLUEFIN_URL"] + "/tokens/info",
    );

    const serializedTokenData = data.map((item) => serializeObject(item));

    res.send(serializedTokenData);
  } catch (error) {
    console.error("Error in /blue/tokens route:", error);
    res.status(500).send({ error: "Failed to fetch tokens" });
  }
});

app.get("/blue/balance/:address", async (req, res) => {
  try {
    const qc = new QueryChain(client);
    const balances = await qc.getUserPositions(
      mainnet.BasePackage,
      req.params.address,
    );
    res.send(balances);
  } catch (error) {
    console.error("Error in /blue/tokens route:", error);
    res.status(500).send({ error: "Failed to fetch tokens" });
  }
});

function serializeObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeObject);
  }

  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = serializeObject(obj[key]);
    }
  }
  return newObj;
}

app.get("/suilend/pools", async (req, res) => {
  try {
    const marketData = await suilendSDK.getPools();
    res.send(marketData);
  } catch (error) {
    console.error("Error in /suilend/pools route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});

app.get("/suilend/balance/:address", async (req, res) => {
  try {
    const balances = await suilendSDK.getUserPositions(req.params.address);
    res.send(balances);
  } catch (error) {
    console.error("Error in /suilend/balance route:", error);
    res.status(500).send({ error: "Failed to fetch market data" });
  }
});
