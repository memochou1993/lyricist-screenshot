const http = require('http');
const puppeteer = require('puppeteer');

const API_URL = 'https://share.lyricist.ai';

const fetchCard = async (id) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${API_URL}/${id}`);
  await page.evaluate(() => {
    document.querySelector('.button-row').style.display = 'none';
  });
  const ele = await page.$('.border-card');
  const card = await ele.boundingBox();
  const buffer = await page.screenshot({
    clip: {
      x: card.x,
      y: card.y,
      width: card.width,
      height: card.height,
    },
  });
  await browser.close();
  return buffer;
};

const requestListener = async (req, res) => {
  const buffer = await fetchCard('2rV14JxwYd');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Disposition': 'attachment; filename="image.png"',
  });
  res.end(buffer);
};

http.createServer(requestListener).listen(80);
