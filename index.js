require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = [];
let counter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/*
  POST /api/shorturl
*/
app.post('/api/shorturl', function(req, res) {

  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Must be http or https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = counter++;

      urlDatabase.push({
        original_url: originalUrl,
        short_url: shortUrl
      });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });

  } catch (err) {
    res.json({ error: 'invalid url' });
  }

});

/*
  GET /api/shorturl/:short_url
*/
app.get('/api/shorturl/:short_url', function(req, res) {

  const shortUrl = parseInt(req.params.short_url);

  const entry = urlDatabase.find(u => u.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(entry.original_url);

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});