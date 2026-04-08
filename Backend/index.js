require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      status: "ok",
      db: "ok"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      db: "down"
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const { sequelize } = require("./models");

sequelize.authenticate()
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB error:", err));