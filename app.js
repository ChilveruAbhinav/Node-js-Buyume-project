const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "inventoryDb.db");
const db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is listening at 3000");
    });
  } catch (err) {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("inventory_path", async (request, response) => {
  const { payload } = request.body;
  for (let product of payload) {
    const { productId, quantity, operation } = product;
    if (operation === "add") {
      const addQuery = `
            UPDATE inventory_table
            SET quantity=(SELECT quantity FROM inventory_table) as table_quantity + ${quantity}
            WHERE productId=${productId}
            `;
      await db.run(addQuery);
      response.send("Added quantity");
    } else if (operation === "subtract") {
      const deleteQuery = `
             UPDATE inventory_table
            SET quantity=(SELECT quantity FROM inventory_table) as table_quantity - ${quantity}
            WHERE productId=${productId}
            `;
      await db.run(deleteQuery);
      response.send("Deleted quantity");
    }
  }
});

module.exports = app;
