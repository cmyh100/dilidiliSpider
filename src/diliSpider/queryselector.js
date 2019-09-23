const http = require('http');
const cheerio = require('cheerio');

const getAnimeList = (url, y, m) => {
  return new Promise((resolve, reject) => {
    const _url = `${url}${y}${m}/`;
    console.log(`Start Get Anime: ${_url}`);
    let htmlstr = '';
    http.get(_url, function (res) {
      if (res.statusCode === 200) {
        res.on('data', function (chunk) {
          console.log(chunk);
          htmlstr += chunk;
        });
        res.on('end', async function () {
          console.log('end');
          const $ = cheerio.load(html);
          const domlist = $('.anime_list dl');
          resolve(true);
        });
        res.on('error', function (e) {
          console.log('\x1B[31m%s\x1b[0m:', `Got Error-Msg: ${e}`);
        });
      }
    });
  });
}

module.exports = {
  getAnimeList
};
