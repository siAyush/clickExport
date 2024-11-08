const express = require("express");
const { ClickHouse } = require("clickhouse");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const clickhouse = new ClickHouse({
  url: "https://bvahl74qw9.us-east-1.aws.clickhouse.cloud",
  port: 8443,
  basicAuth: { username: "default", password: "_w13iEY0SvURM" },
});

app.get("/metrics/query", async (req, res) => {
  try {
    const { aggregate, interval = "minute" } = req.query;

    let query = "SELECT timestamp, value FROM metrics";

    if (aggregate) {
      const validAggregations = ["avg", "sum", "min", "max", "count"];
      if (!validAggregations.includes(aggregate.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid aggregation function. Valid options are: ${validAggregations.join(
            ", "
          )}`,
        });
      }

      // Modify the query for aggregation
      query = `
        SELECT 
          toStartOfInterval(timestamp, INTERVAL 1 ${interval}) AS time_interval,
          ${aggregate.toLowerCase()}(value) AS value
        FROM metrics
        GROUP BY time_interval
        ORDER BY time_interval
      `;
    } else {
      query = "SELECT timestamp, value FROM metrics";
    }

    query += " LIMIT 100";

    const rows = await clickhouse.query(query).toPromise();

    if (!rows || rows.length === 0) {
      return res.json({
        message: "No data found for the given criteria",
      });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
