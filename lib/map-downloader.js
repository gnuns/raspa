const request = require('request');
const fs = require('fs');
const zlib = require('zlib');
const unzip = require('./unzip-pipe');

const REQUEST_HEADERS = {
  'accept' : '*/*',
  'from' : 'googlebot@googlebot.com',
  'user-agent' : 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'accept-encoding' : 'gzip,deflate',
};

exports.download = downloadFile;

const hasZip = (encoding) => (encoding == 'gzip' || encoding == 'deflate');
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    let file = url.split('/');
    let path, gzip, ws;
    let req = request({url, headers: REQUEST_HEADERS});
    file = file[file.length - 1];
    path = `./maps/${file}`;
    if (file.indexOf('.gz') > -1) {
      gzip = true;
      path = path.replace('.gz', '');
    }
    ws = fs.createWriteStream(path);
    req.on('error', reject);
    req.on('response', function (res) {
      // console.log(res.headers);
      if (res.statusCode > 302) return reject(res.statusCode);
      // if is not gzipped, just write to file
      if (!gzip && !hasZip(res.headers['content-encoding'])) return res.pipe(ws);
      res
      .pipe(unzip())
      .pipe(ws)
    })
    req.on('end', () => {
      ws.on('finish', () => resolve(path));
    });
  });
}
