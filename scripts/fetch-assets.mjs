import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'assets', 'images');
const files = [
  {
    url: 'https://via.placeholder.com/1024.png?text=ScreenStreak',
    file: 'icon.png'
  },
  {
    url: 'https://via.placeholder.com/64.png?text=SS',
    file: 'favicon.png'
  },
  {
    url: 'https://via.placeholder.com/1242x2436.png?text=ScreenStreak+Splash',
    file: 'splash.png'
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        file.close(() => fs.unlink(dest, () => {}));
        return reject(new Error(`Failed ${url}: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      file.close(() => fs.unlink(dest, () => {}));
      reject(err);
    });
  });
}

async function run() {
  try {
    ensureDir(outDir);
    for (const f of files) {
      const dest = path.join(outDir, f.file);
      if (!fs.existsSync(dest)) {
        // eslint-disable-next-line no-console
        console.log(`Fetching ${f.file}...`);
        await download(f.url, dest);
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Asset fetch skipped:', e.message);
  }
}

run();

