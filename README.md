# URL Shortener API

A simple and fast URL shortening service that converts long URLs into short, shareable links.

## Features

- Convert long URLs to short URLs
- Validate URLs before shortening
- RESTful API endpoints
- CORS enabled
- Environment configuration support

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```
   PORT=3000
   ```

## Usage

Start the server:
```bash
npm start
```

The API will run on `http://localhost:3000`

## API Endpoints

### GET /
Returns the HTML interface

### POST /api/shorturl
Shortens a given URL
- **Request**: `{ "url": "https://example.com/very/long/url" }`
- **Response**: `{ "original_url": "...", "short_url": 1 }`
- **Error**: `{ "error": "invalid url" }`

## Technologies

- Node.js
- Express.js
- DNS lookup validation
- CORS

## License

MIT
