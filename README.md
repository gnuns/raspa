# raspa
a simple website scraper

For now, you can only list links on a sitemap:
```sh
git clone https://github.com/gnuns/raspa
npm install
./raspa-cli.js --url "https://www.google.com/sitemap.xml"
```

## TO-DO List
* [ ] TESTS!
* [ ] Process configuration file to know what to get
* [ ] Get data from url, check if it's useful, store structured data on database
* [ ] Use cluster
* [ ] Create url list and put on redis
* [ ] Let a background service processing redis url list
