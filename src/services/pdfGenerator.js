const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");

async function generatePDF(imagePaths) {
  const pdfDoc = await PDFDocument.create();

  for (const imagePath of imagePaths) {
    const imageBytes = await fs.readFile(imagePath);
    const image = await pdfDoc.embedJpg(imageBytes);

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(__dirname, "../../logs/epaper.pdf");
  await fs.writeFile(pdfPath, pdfBytes);

  return pdfPath;
}

module.exports = { generatePDF };
