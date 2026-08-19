const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
let translatorPromise;

app.use(cors());
app.use(express.json());

const languages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
};

async function getTranslator() {
  if (!translatorPromise) {
    translatorPromise = import('translate').then((module) => {
      const translate = module.default;

      translate.engine = process.env.TRANSLATE_ENGINE || 'google';
      translate.key = process.env.TRANSLATE_KEY;

      if (process.env.TRANSLATE_URL) {
        translate.url = process.env.TRANSLATE_URL;
      }

      return translate;
    });
  }

  return translatorPromise;
}

async function translateText(text, from, to) {
  if (from === to) {
    return {
      translatedText: text,
      unknownWords: [],
    };
  }

  const translate = await getTranslator();
  const translatedText = await translate(text, { from, to });

  return {
    translatedText,
    unknownWords: [],
  };
}

app.get('/api/languages', (req, res) => {
  res.json({
    languages: Object.entries(languages).map(([code, name]) => ({ code, name })),
  });
});

app.post('/api/translate', async (req, res) => {
  const { text, from = 'en', to = 'es' } = req.body || {};
  const cleanText = typeof text === 'string' ? text.trim() : '';

  if (!cleanText) {
    return res.status(400).json({ error: 'Please enter text to translate.' });
  }
  let count = 0;
  for(let i = 0; i < cleanText.length; i++) {
    if(cleanText[i] === ' ') {
      count++;
    }
  }
  if(count > 4) {
    return res.status(400).json({ error: 'Text is too long. Please enter text with 5 characters or less.' });
  }

  if (!languages[from] || !languages[to]) {
    return res.status(400).json({ error: 'Please choose supported source and target languages.' });
  }

  try {
    const result = await translateText(cleanText, from, to);

    return res.json({
      input: cleanText,
      from,
      to,
      fromName: languages[from],
      toName: languages[to],
      ...result,
      note: 'Translated by the backend using the JavaScript translate package.',
    });
  } catch (error) {
    console.error('Translation failed:', error);
    return res.status(502).json({
      error:
        'The translator service is not reachable right now. Please try again, or configure TRANSLATE_ENGINE, TRANSLATE_KEY, or TRANSLATE_URL on the backend.',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Translator API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
