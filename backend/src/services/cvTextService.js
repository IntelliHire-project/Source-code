const pdf = require('pdf-parse');
const https = require('https');
const http = require('http');

/**
 * Extracts raw text from a PDF Buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromBuffer = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) return '';
    const parsed = await pdf(buffer);
    return parsed?.text ? parsed.text.trim() : '';
  } catch (err) {
    console.error('Error extracting text from PDF buffer:', err);
    return '';
  }
};

/**
 * Downloads a PDF from a URL and extracts its text
 * @param {string} url
 * @returns {Promise<string>}
 */
const extractTextFromUrl = async (url) => {
  return new Promise((resolve) => {
    try {
      if (!url) return resolve('');
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        // Handle potential redirects (e.g. HTTP 301, 302)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(extractTextFromUrl(res.headers.location));
        }
        if (res.statusCode !== 200) {
          console.warn(`Failed to fetch PDF from URL, status code: ${res.statusCode}`);
          return resolve('');
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const text = await extractTextFromBuffer(buffer);
            resolve(text);
          } catch (e) {
            console.error('Error parsing downloaded PDF:', e);
            resolve('');
          }
        });
        res.on('error', (err) => {
          console.error('Error during PDF download stream:', err);
          resolve('');
        });
      }).on('error', (err) => {
        console.error('HTTP request error fetching PDF:', err);
        resolve('');
      });
    } catch (err) {
      console.error('Error in extractTextFromUrl:', err);
      resolve('');
    }
  });
};

module.exports = {
  extractTextFromBuffer,
  extractTextFromUrl,
};
