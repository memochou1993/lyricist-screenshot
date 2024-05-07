const http = require('http');
const url = require('url');
const puppeteer = require('puppeteer');

const API_URL = 'https://share.lyricist.ai';

const fetch = async (id) => {
  if (!id) return null;
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`${API_URL}/${id}`);
  const ele = await page.$('.styled-background-card');
  if (!ele) return null;
  await page.evaluate(() => {
    document.querySelector('.toolbar').style.display = 'none';
  });
  const card = await ele.boundingBox();
  const content = await page.screenshot({
    clip: {
      x: card.x,
      y: card.y,
      width: card.width,
      height: card.height,
    },
  });
  await browser.close();
  return content;
};

const requestListener = async (req, res) => {
  const { query } = url.parse(req.url, true);
  const { id } = query;
  const content = await fetch(id);
  if (!content) {
    res.writeHead(404, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({
      message: 'Not found',
    }));
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Disposition': `attachment; filename="${id}.png"`,
  });
  res.end(content);
};

http.createServer(requestListener).listen(process.env.PORT || 80);
