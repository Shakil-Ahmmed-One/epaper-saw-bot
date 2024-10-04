const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

async function scrapeEpaperImages(epaperUrl) {
  const browser = await puppeteer.launch({ headless: true }); // Run in headless mode
  const page = await browser.newPage();
  await page.goto(epaperUrl);

  // Scrape images
  const images = await page.evaluate(() => {
    const imgElements = Array.from(
      document.querySelectorAll("div.image_layer img.img_jpg")
    );
    return imgElements.map((img) => ({
      src: img.getAttribute("xhighres"),
      page: parseInt(
        img.closest("div.turn-page-wrapper").getAttribute("page"),
        10
      ),
    }));
  });

  // Sort by page number
  images.sort((a, b) => a.page - b.page);

  console.log(
    "Scraped image URLs:",
    images.map((img) => img.src)
  ); // Log all image URLs

  // Download images
  const imagePaths = [];
  for (const { src, page } of images) {
    const imagePath = path.join(__dirname, `../../logs/page-${page}.jpg`);
    const response = await axios.get(src, { responseType: "arraybuffer" });
    await fs.writeFile(imagePath, response.data);
    imagePaths.push(imagePath);
  }

  await browser.close();
  return imagePaths;
}

module.exports = { scrapeEpaperImages };
