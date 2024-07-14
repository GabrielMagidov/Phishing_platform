require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const Mailjet = require("node-mailjet");

const app = express();
const PORT = 5000;
const purchasesFilePath = path.join(__dirname, "purchases.json");
const triggerFilePath = path.join(__dirname, "trigger.txt");
let botProcess;

app.use(cors());
app.use(bodyParser.json());

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

function generateSteamKey() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 15; i++) {
    if (i > 0 && i % 5 === 0) {
      key += "-";
    }
    key += characters[Math.floor(Math.random() * characters.length)];
  }
  return key;
}

function sendPurchaseEmail(purchaseData) {
  if (!purchaseData.cart || !Array.isArray(purchaseData.cart)) {
    console.error("Invalid purchaseData structure:", purchaseData);
    return;
  }

  const items = purchaseData.cart
    .map((item) => {
      const steamKey = generateSteamKey();
      return `${item.name} - ${steamKey}`;
    })
    .join("<br>");

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "cdkeeyss@gmail.com",
          Name: "cdkeeyss",
        },
        To: [
          {
            Email: purchaseData.email,
            Name: purchaseData.name,
          },
        ],
        Subject: "Your Purchase Confirmation",
        TextPart: `Thank you for your purchase!\n\nHere are your items:\n\n${items}`,
        HTMLPart: `<h3>Thank you for your purchase!</h3><p>Here are your items:</p><p>${items}</p>`,
      },
    ],
  });

  request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.error(err.statusCode);
      console.error(err.response.text);
    });
}

app.post("/api/checkout", (req, res) => {
  const purchaseData = req.body;

  if (
    !purchaseData ||
    !purchaseData.cart ||
    !Array.isArray(purchaseData.cart)
  ) {
    console.error("Invalid request body:", purchaseData);
    return res.status(400).send("Invalid request body");
  }

  fs.readFile(purchasesFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading purchases file:", err);
      return res.status(500).send("Error reading purchases file");
    }

    let purchases = [];

    try {
      if (data) {
        purchases = JSON.parse(data);
      }
    } catch (parseError) {
      console.error("Error parsing purchases file:", parseError);
      return res.status(500).send("Error parsing purchases file");
    }

    purchases.push(purchaseData);

    fs.writeFile(
      purchasesFilePath,
      JSON.stringify(purchases, null, 2),
      (writeError) => {
        if (writeError) {
          console.error("Error writing to purchases file:", writeError);
          return res.status(500).send("Error writing to purchases file");
        }

        fs.writeFile(triggerFilePath, "trigger", (err) => {
          if (err) {
            console.error("Error writing trigger file:", err);
            return res.status(500).send("Error writing trigger file");
          }

          sendPurchaseEmail(purchaseData);

          res
            .status(200)
            .send("Purchase data saved and bot triggered successfully");
        });
      }
    );
  });
});

function startBot() {
  console.log("Starting the Telegram bot");
  botProcess = spawn("python", ["TelegramBot.py"]);

  botProcess.stdout.on("data", (data) => {
    console.log(`Bot stdout: ${data}`);
  });

  botProcess.stderr.on("data", (data) => {
    console.error(`Bot stderr: ${data}`);
  });

  botProcess.on("close", (code) => {
    console.log(`Bot process exited with code ${code}`);
  });
}

function stopBot() {
  if (botProcess) {
    botProcess.kill();
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  startBot();
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server and bot");
  stopBot();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server and bot");
  stopBot();
  process.exit(0);
});
