const TelegramBot = require("node-telegram-bot-api");
const { scrapeEpaperImages } = require("./scraper");
const { generatePDF } = require("./pdfGenerator");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

async function uploadPDFToTelegram() {
  const epaperUrl = process.env.PAPER_URL;

  console.log("Starting the scraping process...");
  try {
    const imagePaths = await scrapeEpaperImages(epaperUrl);
    console.log("Scraping completed. Generating PDF...");

    const pdfPath = await generatePDF(imagePaths);
    const caption = `E-paper for ${new Date().toLocaleDateString()}`;

    console.log("Uploading PDF to Telegram...");
    await bot.sendDocument(process.env.TELEGRAM_CHANNEL_ID, pdfPath, {
      caption,
    });
    console.log("E-paper uploaded successfully.");

    // Cleanup: delete the PDF and the images
    await fs.unlink(pdfPath);
    for (const imagePath of imagePaths) {
      await fs.unlink(imagePath);
    }
    console.log("Cleaned up local storage.");
  } catch (error) {
    console.error("Error uploading PDF to Telegram:", error);
  }
}

// Run the upload function immediately
uploadPDFToTelegram();
