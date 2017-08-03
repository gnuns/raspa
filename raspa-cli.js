#!/usr/bin/node
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const args  = require('yargs').argv;
const mapDownloader = require('./lib/map-downloader');

async function getMapLinks (url) {
  let path = await mapDownloader.download(url);
  fs.readFile(path, function(err, data) {
    parser.parseString(data, function (err, result) {
      if (err) return console.log(err);
      let mapId = Object.keys(result)[0];
      let arrayId = Object.keys(result[mapId])[1];
      let urlList = result[mapId][arrayId].map((u) => {
        let href = u.loc[0];
        if (href.indexOf('/') !== 0) return href;
        let site = url.split('://');
        let protocol = site[0];
        site = site[1].split('/')[0];
        return `${protocol}://${site}${href}`;
      });
      console.log(urlList.join('\n'));
    });
  });
}
(async function main() {
  let url = args['u'] || args['url'];
  getMapLinks(url);
})();
