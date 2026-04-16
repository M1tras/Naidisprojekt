require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { Op } = require("sequelize");
const { EnergyReading, sequelize } = require("./models");

const app = express();

// MIDDLEWARE (IMPORTANT)
app.use(cors());
app.use(express.json());


// HEALTH CHECK
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "down" });
  }
});

// SYNC PRICES (ELERING)
app.post("/api/sync/prices", async (req, res) => {
  try {
    let { start, end, location } = req.body;

    const now = new Date();

    // default: today UTC
    if (!start || !end) {
      start = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0
      )).toISOString();

      end = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23, 59, 59
      )).toISOString();
    }

    if (!location) location = "EE";

    // internal -> external mapping
    const map = { EE: "ee", LV: "lv", FI: "fi" };
    const apiLocation = map[location];

    if (!apiLocation) {
      return res.status(400).json({ error: "INVALID_LOCATION" });
    }

    const url =
      `https://dashboard.elering.ee/api/nps/price` +
      `?start=${start}&end=${end}&fields=${apiLocation}`;

    const response = await axios.get(url);

    // IMPORTANT: real structure
    const data = response.data?.data?.[apiLocation];

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: "PRICE_API_UNAVAILABLE" });
    }

    let upserted = 0;

    for (const item of data) {
      const timestamp = new Date(item.timestamp * 1000);

      await EnergyReading.upsert({
        timestamp,
        location,
        price_eur_mwh: item.price,
        source: "API"
      });

      upserted++;
    }

    res.json({
      message: "sync complete",
      inserted_or_updated: upserted
    });

  } catch (err) {
    console.error("SYNC ERROR:", err.message);
    res.status(500).json({ error: "PRICE_API_UNAVAILABLE" });
  }
});


// READINGS API
app.get("/api/readings", async (req, res) => {
  try {
    const { start, end, location } = req.query;

    const allowed = ["EE", "LV", "FI"];
    if (!location || !allowed.includes(location)) {
      return res.status(400).json({ error: "INVALID_LOCATION" });
    }

    if (!start || !end) {
      return res.status(400).json({ error: "MISSING_DATE_RANGE" });
    }

    const readings = await EnergyReading.findAll({
      where: {
        location,
        timestamp: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      },
      order: [["timestamp", "ASC"]]
    });

    res.json(readings);

  } catch (err) {
    console.error("READINGS ERROR:", err.message);
    res.status(500).json({ error: "FAILED_TO_FETCH" });
  }
});


// START SERVER
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});