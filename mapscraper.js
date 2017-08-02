const request = require('request');
const zlib = require('zlib');
let requestOptions = {
      'url': 'https://thepiratebay.org/sitemap-googlish.xml.gz',
      'headers':  {
  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  "accept-language" : "en-US,en;q=0.8",
  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
  "accept-encoding" : "gzip,deflate",
}
    };
request.get(requestOptions,function(err, res) {
  if (res.req.path.indexOf('.gz') > -1) {
    console.log(res.body)
    zlib.gunzip(res.body, function(err, dezipped) {
      if (err) return console.log(err);
      console.log(dezipped);
    });
  }
});
