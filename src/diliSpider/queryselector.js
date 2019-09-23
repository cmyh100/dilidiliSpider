const http = require('http');
const cheerio = require('cheerio');

const httpProxy = (_url) => {
  return new Promise((resolve, reject) => {
    console.log(`Start Get Anime: ${_url}`);
    let htmlsrteam = '';
    http.get(_url, function (res) {
      if (res.statusCode === 200) {
        res.on('data', function (chunk) {
          htmlsrteam += chunk;
        });
        res.on('end', async function () {
          resolve(cheerio.load(htmlsrteam));
        });
        res.on('error', function (e) {
          console.log('\x1B[31m%s\x1b[0m:', `Got Error-Msg: ${e}`);
        });
      } else {
        resolve('');
      }
    });
  });
}

/**
 * @description 此处自定义Dom相关操作
 */
const getAnimeList = async (url, y, m) => {
  const _url = `${url}${y}${m}/`;
  const $ = await httpProxy(_url);
  if (!$) {return []}
  const domlist = $('.anime_list dl');
  let datalist = [];
  for (let i = 0; i < domlist.length; i++) {
    const imgurl = domlist.eq(i).find('dt img').attr('src');
    const name = domlist.eq(i).find('dd h3 a').text();
    const country = domlist.eq(i).find('dd .d_label').eq(0).find('a').text();
    const time = domlist.eq(i).find('dd .d_label').eq(1).find('a').text();
    const label = domlist.eq(i).find('dd .d_label').eq(2).find('a').text();
    const company = domlist.eq(i).find('dd .d_label').eq(3).find('a').text();
    const keypoint = domlist.eq(i).find('dd>p').eq(4).text();
    const singer = domlist.eq(i).find('dd>p').eq(7).text();
    const outline = domlist.eq(i).find('dd>p').eq(8).text();
    const state = domlist.eq(i).find('dd>p').eq(9).text();
    datalist.push({
      imgurl,
      name,
      country,
      time,
      label,
      company,
      keypoint,
      singer,
      outline,
      state,
    });
  }
  return datalist;
}

const getColumns = () => {
  let columns = [];
  [
    'imgurl',
    'name',
    'country',
    'time',
    'label',
    'company',
    'keypoint',
    'singer',
    'outline',
    'state'
  ].map(item => {
    columns.push({
      header: item,
      key: item
    });
  });
  return columns
}

module.exports = {
  getAnimeList,
  getColumns
};
