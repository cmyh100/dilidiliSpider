const queryselector = require('./queryselector.js');
const util = require('../util/index.js');
const Excel = require('exceljs');

class DiliSpider {
  constructor (options) {
    this.options = options;
    this.init();
  }
  
  /**
   * @description 初始化数据
   */
  init () {
    const startobj = util.formatTime(this.options.startTime);
    const endobj = util.formatTime(this.options.endTime);
    this.url = this.options.url || '';
    this.currentY = startobj.y || '';
    this.currentM = startobj.m || '';
    this.endY = endobj.y || '';
    this.endM = endobj.m || '';
    this.data = [];
    this.runMain();
  }
  
  /**
   * @description 主任务函数
   */
  async runMain () {
    const data = await queryselector.getAnimeList(this.url, this.currentY, this.currentM);
    this.data = [
      ...this.data,
      ...data
    ];
    this.checkOver();
  }
  
  /**
   * @description 检查任务是否结束
   */
  checkOver () {
    if (this.currentY === this.endY && this.currentM === this.endM) {
      this.runEnd();
    } else {
    	setTimeout(() => {
        this.runNext();
    	}, 300);
    }
  }
  
  /**
   * @description 进入下一个周期
   */
  runNext () {
    if (this.currentM * 1 === 12) {
    	this.currentM = '01';
    	this.currentY = this.currentY * 1 + 1;
    } else {
    	this.currentM * 1 >= 9 ? (this.currentM = this.currentM * 1 + 1 + '') : (this.currentM = '0' + (this.currentM * 1 + 1));
    }
    this.runMain();
  }
  
  /**
   * @description 收尾函数
   */
  runEnd () {
    // console.log(this.data);
    let columns = queryselector.getColumns() || [];
    this.createExcel(`./excel/anime_info${this.options.startTime}_${this.options.endTime}.xlsx`, columns, this.data)
  }

  /**
   * @description 创建Excel
   */
  createExcel(_filename, _columns, _dataSource) {
    // let start_time = new Date();
    let workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: _filename
    });
    let worksheet = workbook.addWorksheet('Sheet');
    worksheet.columns = _columns
    let data = _dataSource
    let length = data.length;
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
    // let end_time = new Date();
    // let duration = end_time - start_time;
    // console.log('用时：' + duration);
  }
}

module.exports = DiliSpider;
