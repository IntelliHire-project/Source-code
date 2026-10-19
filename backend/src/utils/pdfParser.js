/**
 * Resilient PDF text parser supporting both pdf-parse v1 and v2 (PDFParse class).
 */

/**
 * Extracts plain text from a PDF Buffer using pdf-parse (v1 or v2).
 * @param {Buffer} buffer - Raw PDF binary buffer
 * @returns {Promise<string>} Extracted text string
 */
const parsePdfText = async (buffer) => {
  if (!buffer || buffer.length === 0) return "";

  try {
    const pdfModule = require('pdf-parse');

    // v2 API: { PDFParse } class constructor
    const ParserClass = pdfModule.PDFParse || (typeof pdfModule === 'function' && pdfModule.prototype && pdfModule.prototype.getText ? pdfModule : null);
    if (ParserClass) {
      const parser = new ParserClass({ data: buffer });
      try {
        const result = await parser.getText();
        return result && result.text ? result.text.trim() : "";
      } finally {
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      }
    }

    // v1 API: default export is a function taking (buffer)
    if (typeof pdfModule === 'function') {
      const result = await pdfModule(buffer);
      return result && result.text ? result.text.trim() : "";
    }

    return "";
  } catch (err) {
    console.warn("[parsePdfText] Warning extracting text via pdf-parse:", err.message);
    return "";
  }
};

module.exports = {
  parsePdfText
};
