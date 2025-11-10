// helpers/pdfHelper.js
import fs from 'fs';
import {PDFParse} from 'pdf-parse'; // import default ESM version

export const extractPdfText = async (filePath) => {
  try {
    // Read PDF file as Buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Convert Buffer to Uint8Array (required by PDFParse)
    const uint8Array = new Uint8Array(dataBuffer);

    // Create a PDFParse instance
    const parser = new PDFParse(uint8Array);

    // Get text
    const data = await parser.getText(); // data.text, data.metadata, data.info

    return data.text;
  } catch (err) {
    console.error('PDF extraction error:', err.message);
    throw new Error('Failed to extract PDF text');
  }
};
