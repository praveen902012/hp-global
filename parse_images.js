const https = require('https');

const urls = [
  'https://www.hpglobalinfra.com/s-projects-side-by-side',
  'https://www.hpglobalinfra.com/s-projects-side-by-side-1',
  'https://www.hpglobalinfra.com/s-projects-side-by-side-2',
  'https://www.hpglobalinfra.com/s-projects-side-by-side-3'
];

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const parser = async () => {
  for (const url of urls) {
    console.log(`\n--- URL: ${url} ---`);
    const html = await fetchHtml(url);
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    const images = new Set();
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      if (src.includes('static.wixstatic.com')) {
         images.add(src);
      }
    }
    for (const img of images) {
       console.log(img);
    }
  }
}
parser();
