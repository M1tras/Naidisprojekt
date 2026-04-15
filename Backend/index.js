require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { Op } = require("sequelize");
const { EnergyReading } = require("./models");

const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const { sequelize } = require("./models");
    await sequelize.authenticate();

    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "down" });
  }
});

// IMPORT
app.post("/api/import/json", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "energy_dump.json");
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);

    let inserted = 0;
    let skipped = 0;
    let duplicates_detected = 0;

    for (const item of data) {

      if (!item.timestamp || isNaN(Date.parse(item.timestamp)) || !item.timestamp.endsWith("Z")) {
        skipped++;
        continue;
      }

      const timestamp = new Date(item.timestamp);
      const location = item.location || "EE";
      const price = item.price_eur_mwh;

      if (typeof price === "string") {
        skipped++;
        continue;
      }

      const existing = await EnergyReading.findOne({
        where: { timestamp, location }
      });

      if (existing) {
        duplicates_detected++;
        continue;
      }

      await EnergyReading.create({
        timestamp,
        location,
        price_eur_mwh: price,
        source: "UPLOAD"
      });

      inserted++;
    }

    res.json({
      message: "Import completed",
      inserted,
      skipped,
      duplicates_detected
    });

  } catch (err) {
  console.error("IMPORT ERROR:", err);
  res.status(500).json({ error: err.message });
  }
});

// READINGS
app.get("/api/readings", async (req, res) => {
  try {
    const { start, end, location } = req.query;

    const allowed = ["EE", "LV", "FI"];
    if (!location || !allowed.includes(location)) {
      return res.status(400).json({ error: "Invalid location" });
    }

    const readings = await EnergyReading.findAll({
      where: {
        location,
        timestamp: {
          [Op.between]: [new Date(start), new Date(end)]
        }
      }
    });

    res.json(readings);

  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});