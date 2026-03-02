require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = [];
let counter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {

  const originalUrl = req.body.url;

  // Must start with http or https
  const urlRegex = /^https?:\/\/.+/;

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const parsedUrl = new URL(originalUrl);

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

app.get('/api/shorturl/:short_url', function(req, res) {

  const shortUrl = parseInt(req.params.short_url);

  const entry = urlDatabase.find(u => u.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(302, entry.original_url);   

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
