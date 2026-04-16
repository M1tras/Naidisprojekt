require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { Op } = require("sequelize");
const { EnergyReading, sequelize } = require("./models");

const app = express();

app.use(cors());
app.use(express.json());


// =====================
// HEALTH
// =====================
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", db: "down" });
  }
});


// =====================
// SYNC PRICES (STABLE VERSION)
// =====================
app.post("/api/sync/prices", async (req, res) => {
  try {
    let { start, end, location } = req.body || {};

    const toISO = (d) => new Date(d).toISOString();

    const now = new Date();

    if (!start || !end) {
      const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
      const e = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

      start = toISO(s);
      end = toISO(e);
    } else {
      start = toISO(start);
      end = toISO(end);
    }

    if (!location) location = "EE";

    const map = { EE: "ee", LV: "lv", FI: "fi" };
    const apiLocation = map[location];

    if (!apiLocation) {
      return res.status(400).json({ error: "INVALID_LOCATION" });
    }

    // IMPORTANT: correct Elering endpoint usage
    const url = `https://dashboard.elering.ee/api/nps/price?start=${start}&end=${end}`;

    console.log("🔥 REQUEST:", url);

    const response = await axios.get(url);

    const data = response.data?.data?.ee;

    if (!Array.isArray(data)) {
      return res.status(500).json({
        error: "PRICE_API_UNAVAILABLE",
        debug: response.data
      });
    }

    let count = 0;

    for (const item of data) {
      if (!item?.timestamp || item.price == null) continue;

      const timestamp = new Date(item.timestamp * 1000);
      if (isNaN(timestamp.getTime())) continue;

      await EnergyReading.upsert({
        timestamp,
        location,
        price_eur_mwh: item.price,
        source: "API"
      });

      count++;
    }

    res.json({
      message: "sync complete",
      inserted_or_updated: count
    });

  } catch (err) {
    console.error("SYNC ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "PRICE_API_UNAVAILABLE",
      debug: err.response?.data || err.message
    });
  }
});


// =====================
// READINGS (FOR DASHBOARD)
// =====================
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

    const data = await EnergyReading.findAll({
      where: {
        location,
        timestamp: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      },
      order: [["timestamp", "ASC"]]
    });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "FAILED_TO_FETCH" });
  }
});


// =====================
// START SERVER
// =====================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});