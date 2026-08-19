# Translator Backend

Simple Express API for translating text. The backend uses the JavaScript `translate` package, so the frontend and direct API users both call the same endpoint.

## Run

```bash
npm start
```

The API runs on `http://localhost:4000` by default.

## Translate API

```bash
curl -X POST http://localhost:4000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello friend","from":"en","to":"es"}'
```

Response shape:

```json
{
  "input": "Hello friend",
  "from": "en",
  "to": "es",
  "fromName": "English",
  "toName": "Spanish",
  "translatedText": "Hola amigo",
  "unknownWords": [],
  "note": "Translated by the backend using the JavaScript translate package."
}
```

## Options

The translator defaults to the package's free Google engine. You can configure another engine with environment variables:

```bash
TRANSLATE_ENGINE=libre TRANSLATE_URL=https://libretranslate.example.com npm start
```

Supported language codes in this sample app: `en`, `es`, `fr`, `hi`, `de`, `it`, `ja`, `ko`, `pt`, `ru`, `zh`.
