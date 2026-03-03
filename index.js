require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

/* ========================
   MONGOOSE CONNECTION
======================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

/* ========================
   POST SHORT URL
======================== */

app.post('/api/shorturl', async (req, res) => {

  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, async (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const existing = await Url.findOne({ original_url: parsedUrl.href });

      if (existing) {
        return res.json({
          original_url: existing.original_url,
          short_url: existing.short_url
        });
      }

      const last = await Url.findOne().sort({ short_url: -1 });
      const shortId = last ? last.short_url + 1 : 1;

      const newUrl = new Url({
        original_url: parsedUrl.href,
        short_url: shortId
      });

      await newUrl.save();

      return res.json({
        original_url: parsedUrl.href,
        short_url: shortId
      });
    });

  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

/* ========================
   REDIRECT
======================== */

app.get('/api/shorturl/:short_url', async function(req, res) {

  const shortUrl = Number(req.params.short_url);

  const entry = await Url.findOne({ short_url: shortUrl });

  if (!entry) {
    return res.json({ error: 'No short URL found' });
  }

  return res.redirect(302, entry.original_url);
});

/* ========================
   START SERVER
======================== */

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});