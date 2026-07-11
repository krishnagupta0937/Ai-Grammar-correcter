// ============================================================
//  AI Grammar Corrector — Vercel Serverless Function (api/correct.js)
//  Receives text via POST, calls Gemini API, returns JSON response
// ============================================================

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  // Extract the input text from body (either urlencoded or JSON)
  const inputText = req.body?.text ? String(req.body.text).trim() : '';

  if (!inputText) {
    return res.status(400).json({ error: 'Please enter some text to correct.' });
  }

  if (inputText.length > 5000) {
    return res.status(400).json({ error: 'Text is too long. Please keep it under 5000 characters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key is not configured on Vercel. Please add GEMINI_API_KEY to your Vercel Environment Variables.'
    });
  }

  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';
  const prompt = `You are a professional grammar correction assistant. Correct the grammar, spelling, and punctuation of the following text. Return ONLY the corrected text — no explanations, no extra commentary, no quotes, just the corrected version of the input text.\n\nText to correct:\n${inputText}`;

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `API error (HTTP ${response.status})`;
      return res.status(response.status).json({ error: `Gemini API Error: ${errMsg}` });
    }

    const data = await response.json();
    const correctedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!correctedText) {
      return res.status(500).json({ error: 'Could not extract corrected text from the API response.' });
    }

    return res.status(200).json({
      success: true,
      original: inputText,
      corrected: correctedText.trim()
    });
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
