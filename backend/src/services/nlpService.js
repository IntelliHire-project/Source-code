const extractCVData = async (cvText) => {
  try {
    const response = await fetch('http://nlp:5001/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: cvText }),
    });

    if (!response.ok) {
      throw new Error(`NLP service responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error extracting CV data with NLP Service:", error);
    throw new Error("Failed to extract CV data.");
  }
};

module.exports = {
  extractCVData
};
