/**
 * @description nodejs抓取数据并生成excel工具，下载图片数据
 * 按月抓取，增加每end-begin个存一次excel
 * @author cmyh100
 * www.dilidili.name
 */
const http = require('http')
const cheerio = require('cheerio')
const Excel = require('exceljs');
const fs = require('fs');
const request = require('request');
// const _today = new Date().getFullYear() + '' + (new Date().getMonth() + 1) + '' + new Date().getDate()
const today = '201804'
const _file = ''
let ratio = 0 // 系数
ratio = process.argv[2].split('=')[1] // 从控制台录入
let begin = 50 * ratio // 开始
let end = 50 * (ratio * 1 + 1) // 结束
let dataList = []
let year = '2018'
let month = '01'
// 2010xq 2000xqq
getData()
async function getData() {
	// 获取月番初始化
	try {
		_time = year + month
		console.log('start crawling ' + _time + ' data')
		await getMonthData(_time)
		console.log('end crawling ' + _time + ' data')
		updateYearMonth()
		checkOver(_time)
	} catch (e) {
		console.log('main error')
		animeList()
		episodeList()
	}
}
function updateYearMonth() {
	// 年月递增
	if (month * 1 === 12) {
		month = '01'
		year = year * 1 + 1 + ''
	} else {
		month * 1 >= 9 ? (month = month * 1 + 1 + '') : (month = '0' + (month * 1 + 1))
	}
}
function checkOver() {
	// 检查何时结束
	if (_time === today) {
		// console.log(dataList)
		// console.log('\x1B[33m%s\x1b[0m:', `共计${dataList.length}个资源`)
		animeList(_time)
		episodeList(_time)
	} else {
		setTimeout(() => {
			animeList(_time)
			episodeList(_time)
			getData()
		}, 300)
	}
}
function getMonthData(_time) {
	// get请求获取月番
	return new Promise(function (resolve, reject) {
		animeHttp()
		function animeHttp () {
			console.log(`Start Get Anime: http://www.dilidili.name/anime/${_time}/`)
			http.get(`http://www.dilidili.name/anime/${_time}/`, function (data) {
				if (data.statusCode === 200) {
					let html = "";
					let _animeRunState = true
					let _animetimer = setTimeout(() => {
						if (animeHttp) {
							console.log('\x1B[31m%s\x1b[0m:', 'timeout: ' + _time)
							_animeRunState = false
							data && data.destroy()
							animeHttp()
						}
					}, 15000)
					data.on('data', function (chunk) {
						console.log(`Getting anime html chunk: ${_time}/`)
						html += chunk;
					})
					data.on('end', async function () {
						if (_animeRunState) {
							console.log(`Getting Anime: ${_time}`)
							clearTimeout(_animetimer)
							animeHttp = null
							let $ = cheerio.load(html)
							let domlist = $('.anime_list dl')
							if (domlist.length < end) {
								end = domlist.length
							}
							for (let i = begin; i < end; i++) {
								console.log(`Looping Anime: ${_time}`)
								let dataitem = {}
								let img_src = domlist.eq(i).find('dt a img').attr('src');
								let timestamp = new Date().getTime()
								dataitem.animeid = '101' + timestamp
								dataitem.time = _time
								dataitem.linkurl = domlist.eq(i).find('dt a').attr('href')
								dataitem.verticalimage = await getImagesData(img_src, '105' + timestamp + 'v' + _time)
								dataitem.name = domlist.eq(i).find('dd h3 a').text()
								dataitem.country = domlist.eq(i).find('dd .d_label').eq(0).find('a').text()
								dataitem.years = domlist.eq(i).find('dd .d_label').eq(1).find('a').text()
								dataitem.foucks = domlist.eq(i).find('dd p').eq(4).text()
								dataitem.voiceactors = domlist.eq(i).find('dd p').eq(5).find('a').text()
								dataitem.info = domlist.eq(i).find('dd p').eq(6).text()
								dataitem.popularity = 0
								dataitem.collection = 0
								dataitem.year = year
								dataitem.month = month
								dataitem.updateweekly = ''
								dataitem.quarter = month * 1
								dataitem.episode = await getEpisodeData(dataitem.linkurl, dataitem.animeid)
								if (dataitem.episode.length > 0) {
									dataitem.nowepisode = dataitem.episode[dataitem.episode.length - 1].namekey
									dataitem.totalepisode = dataitem.episode[dataitem.episode.length - 1].namekey
								} else {
									dataitem.nowepisode = 0
								}
								dataitem.state = 1
								dataList.push(dataitem)
								if (dataList.length >= 50) {
									
								}
							}
							console.log(`Got AnimeList`)
							resolve('')
						}
					})
					data.on('error', function (e) {
						console.log('\x1B[31m%s\x1b[0m:', `Got Error-Anime: ${e}`)
						resolve('empty')
					});
				} else {
					resolve('empty')
				}
			})	
		}
	})
}
function getImagesData (img_src, img_filename) {
	//采用request模块，向服务器发起一次请求，获取图片资源
	return new Promise (function (resolve, reject) {
		try{
			if (!img_src) {
				resolve(img_filename + '.jpg')
			}
			request.head(img_src, function(err,res,body) {
				if (err) {
					console.log(err);
				}
			})
			// let filelink = './source/' + year + '/' + month + '/' + img_filename + '.jpg'
			let filelink = `./source/${year}/${month}/${ratio}/${img_filename}.jpg`
			request(img_src).pipe(fs.createWriteStream(filelink));
			resolve(img_filename + '.jpg')
		} catch(e) {
			resolve(img_filename + '.jpg')
		}
	})
}
function getEpisodeData (_url, animeid) {
	// 获取具体item数据
	return new Promise(function (resolve, reject) {
		let episodeList = []
		episodeHttp()
		function episodeHttp() {
			console.log(`Start Get Episode: http://www.dilidili.name${_url}`)
			if (!/^https?:\/\/www\.dilidili.name\/anime\/[a-zA-z]{2,}/.test(`http://www.dilidili.name${_url}`)) {
				resolve(episodeList)
				return
			}
			http.get(`http://www.dilidili.name${_url}`, function (data) {
				if (data.statusCode === 200) {
					let html = "";
					let _episodeRunState = true
					let _episodetimer = setTimeout(() => {
						if (episodeHttp) {
							console.log('\x1B[31m%s\x1b[0m:', 'timeout: ' + _url)
							_episodeRunState = false
							data && data.destroy()
							episodeHttp()
						}
					}, 5000)
					data.on('data', function (chunk) {
						console.log(`Getting episode html chunk: ${_url}/`)
						html += chunk;
					})
					data.on('end', async function () {
						if (_episodeRunState) {
							console.log(`Getting Episode: ${_url}`)
							clearTimeout(_episodetimer)
							episodeHttp = null
							let $ = cheerio.load(html)
							let domlist = $('.list .swiper-container .clear li')
							for (let i = 0; i < domlist.length; i++) {
								console.log(`Looping Episode: ${_url}`)
								let videourl = await getVideoData(domlist.eq(i).find('a').attr('href'))
								let namekey = ''
								let name = ''
								try {
									namekey = domlist.eq(i).find('a em').children()[0].children[0].data.slice(1, -1)
									name = domlist.eq(i).find('a em').children()[0].next.data
								} catch (e) {
									console.log('\x1B[31m%s\x1b[0m:', 'namekey error')
								}
								episodeList[i] = {
									animeid: animeid,
									episodeid: '102' + new Date().getTime(),
									namekey: namekey,
									name: name,
									updateweek: $('.detail dd .d_label2').eq(4),
									episodeurl: _url,
									videourl: videourl
								}
							}
							console.log(`Got EpisodeList`)
							resolve(episodeList)
						}
					})
					data.on('error', function (e) {
						console.log('\x1B[31m%s\x1b[0m:', `Got EpisodeList ERROR ${e}`)
						resolve(episodeList)
					});
				} else {
					console.log('\x1B[31m%s\x1b[0m:', `Got EpisodeList ERROR`)
					resolve(episodeList)
				}
			})
		}
	})
}
function getVideoData(_url) {
	// 获取视频url链接
	return new Promise(function (resolve, reject) {
		if (!_url) {
			resolve('')
			return
		}
		_url = _url.replace('.wang', '.name')
		videoHttp()
		function videoHttp() {
			console.log(`Start Get Video: ${_url}`)
			let reg = /^https?:\/\/www\.dilidili.name\/\w+\/\d{2,}/
			if (!reg.test(_url)){
				resolve('')
				return
			}
			http.get(`${_url}`, function getVideoDataHtml(data) {
				if (data.statusCode === 200) {
					let html = "";
					let videourl = ''
					let _videoRunState = true
					let _videotimer = setTimeout(() => {
						if (videourl === '') {
							if (videoHttp) {
								console.log('\x1B[31m%s\x1b[0m:', 'timeout: ' + _url)
								_videoRunState = false
								data && data.destroy()
								videoHttp()
							}
						}
					}, 5000)
					data.on('data', function (chunk) {
						console.log(`Getting video html chunk: ${_url}/`)
						html += chunk;
					})
					data.on('end', function () {
						if (_videoRunState) {
							clearTimeout(_videotimer)
							let $ = cheerio.load(html)
							videourl = $('.player_main iframe').attr('src') ? ($('.player_main iframe').attr('src').split('?url='))[1] : ''
							console.log('Got Video ' + videourl)
							videoHttp = null
							resolve(videourl)
						}
					})
					data.on('error', function (e) {
						console.log('\x1B[31m%s\x1b[0m:', `Got VideoList ERROR ${e}`)
						resolve('VideoList ERROR')
					});
				} else {
					console.log('\x1B[31m%s\x1b[0m:', `Got VideoList ERROR`)
					resolve('VideoList ERROR')
				}
			})
		}
	})
}
function animeList(_time) {
	if (dataList.length <= 0) {
		return
	}
	// 拆分出每个anime数据列表
	let columns = [
		{ header: 'animeid', key: 'animeid' },
		{ header: 'name', key: 'name' },
		{ header: 'banner', key: 'banner' },
		{ header: 'verticalimage', key: 'verticalimage' },
		{ header: 'info', key: 'info' },
		{ header: 'score', key: 'score' },
		{ header: 'popularity', key: 'popularity' },
		{ header: 'collection', key: 'collection' },
		{ header: 'nowepisode', key: 'nowepisode' },
		{ header: 'totalepisode', key: 'totalepisode' },
		{ header: 'country', key: 'country' },
		{ header: 'years', key: 'years' },
		{ header: 'year', key: 'year' },
		{ header: 'month', key: 'month' },
		{ header: 'updateweekly', key: 'updateweekly' },
		{ header: 'quarter', key: 'quarter' },
		{ header: 'foucks', key: 'foucks' },
		{ header: 'state', key: 'state' },
		{ header: 'createtime', key: 'createtime' }
	]
	createExcel(`./excel/${year}/anime_info${_time}_${begin}_${end}.xlsx`, columns, dataList)
}
function episodeList(_time) {
	if (dataList.length <= 0) {
		return
	}
	// 拆分出每个 episode数据列表
	let episodeList = []
	dataList.map(item => {
		episodeList = episodeList.concat(item.episode)
	})
	//	console.log('episodeList:' + episodeList)
	let Relationcolumns = [
		{ header: 'animeid', key: 'animeid' },
		{ header: 'episodeid', key: 'episodeid' },
		{ header: 'episodename', key: 'name' },
		{ header: 'namekey', key: 'namekey' },
		{ header: 'episodeurl', key: 'episodeurl' }
	]
	let episodecolumns = [
		{ header: 'name', key: 'name' },
		{ header: 'namekey', key: 'namekey' },
		{ header: 'episodeid', key: 'episodeid' },
		{ header: 'videourl', key: 'videourl' },
		{ header: 'episodeurl', key: 'episodeurl' }
	]
	createExcel(`./excel/${year}/anime_episode${_time}_${begin}_${end}.xlsx`, Relationcolumns, episodeList)
	createExcel(`./excel/${year}/episode_info${_time}_${begin}_${end}.xlsx`, episodecolumns, episodeList)
	dataList = []
}
function createExcel(_filename, _columns, _dataSource) {
	// json生成excel
	let start_time = new Date();
	let workbook = new Excel.stream.xlsx.WorkbookWriter({
		filename: _filename
	});
	let worksheet = workbook.addWorksheet('Sheet');

	worksheet.columns = _columns

	let data = _dataSource
	let length = data.length;

	// 当前进度
	let current_num = 0;
	let time_monit = 400;
	let temp_time = Date.now();

	console.log(_filename + ' 开始添加数据');
	// 开始添加数据
	for (let i in data) {
		worksheet.addRow(data[i]).commit();
		current_num = i;
		if (Date.now() - temp_time > time_monit) {
			temp_time = Date.now();
			console.log((current_num / length * 100).toFixed(2) + '%');
		}
	}
	console.log('添加数据完毕：', length);
	workbook.commit();

	let end_time = new Date();
	let duration = end_time - start_time;

	console.log('用时：' + duration);
}
