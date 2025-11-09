// helpers/pdfHelper.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // load CommonJS module correctly

import fs from "fs";

export const extractPdfText = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer); // now works
    return data.text;
  } catch (err) {
    console.error("PDF extraction error:", err.message);
    throw new Error("Failed to extract PDF text");
  }
};
