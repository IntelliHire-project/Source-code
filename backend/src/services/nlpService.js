const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://nlp:5001';

/**
 * Converts a PDF buffer into structured XML via the NLP microservice.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>} XML string representation of the PDF
 */
const convertPdfToXml = async (pdfBuffer) => {
  try {
    const base64Data = pdfBuffer.toString('base64');
    const response = await fetch(`${NLP_SERVICE_URL}/convert-to-xml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pdf_base64: base64Data }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NLP convert-to-xml responded with status ${response.status}: ${errText}`);
    }

    const result = await response.json();
    return result.xml;
  } catch (error) {
    console.error("Error converting PDF to XML with NLP Service:", error);
    throw new Error("Failed to convert CV PDF into XML.");
  }
};

/**
 * Extracts CV candidate data from a pre-converted XML string.
 * @param {string} xmlString
 * @returns {Promise<Object>}
 */
const extractCVDataFromXml = async (xmlString) => {
  try {
    const response = await fetch(`${NLP_SERVICE_URL}/extract-from-xml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xml: xmlString }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NLP extract-from-xml responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error extracting CV data from XML with NLP Service:", error);
    throw new Error("Failed to extract CV data from XML.");
  }
};

/**
 * End-to-end CV extraction:
 * 1. Converts CV PDF into XML.
 * 2. Extracts CV data from the generated XML.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<Object>} Extracted candidate fields plus the generated XML
 */
const extractCVDataFromPdf = async (pdfBuffer) => {
  const xml = await convertPdfToXml(pdfBuffer);
  const data = await extractCVDataFromXml(xml);
  return { ...data, xml };
};

/**
 * Universal extraction method for backward compatibility.
 * Accepts a PDF Buffer, XML string, or raw text string.
 * @param {Buffer|string} input
 * @returns {Promise<Object>}
 */
const extractCVData = async (input) => {
  try {
    // If input is a Buffer, convert PDF to XML first and extract from XML
    if (Buffer.isBuffer(input)) {
      return await extractCVDataFromPdf(input);
    }

    // If input is an XML string
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (trimmed.startsWith('<') && (trimmed.includes('<pages>') || trimmed.includes('<?xml') || trimmed.includes('<document>'))) {
        return await extractCVDataFromXml(trimmed);
      }

      // Fallback for plain text string
      const response = await fetch(`${NLP_SERVICE_URL}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error(`NLP service responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    }

    throw new Error("Unsupported input type for CV extraction.");
  } catch (error) {
    console.error("Error in extractCVData:", error);
    throw new Error("Failed to extract CV data.");
  }
};

module.exports = {
  convertPdfToXml,
  extractCVDataFromXml,
  extractCVDataFromPdf,
  extractCVData
};

