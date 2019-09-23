const queryselector = require('./queryselector.js');
const util = require('../util/index.js');

class DiliSpider {
  constructor (options) {
    this.options = options;
    this.init();
  }
  
  /**
   * @description 初始化
   */
  init (options) {
    const startobj = util.formatTime(this.options.startTime);
    const endobj = util.formatTime(this.options.endTime);
    this.url = this.options.url || '';
    this.currentY = startobj.y || '';
    this.currentM = startobj.m || '';
    this.endY = endobj.y || '';
    this.endM = endobj.m || '';
    this.runMain();
  }
  
  async runMain () {
    const data = await queryselector.getAnimeList(this.url, this.currentY, this.currentM);
    console.log(data);
    this.checkOver();
  }
  
  runNext () {
    if (this.currentM * 1 === 12) {
    	this.currentM = '01';
    	this.currentY = this.currentY * 1 + 1;
    } else {
    	this.currentM * 1 >= 9 ? (this.currentM = this.currentM * 1 + 1 + '') : (this.currentM = '0' + (this.currentM * 1 + 1));
    }
    this.runMain();
  }
  
  runEnd () {
    console.log('end');
  }
  
  checkOver () {
    if (this.currentY === this.endY && this.currentM === this.endM) {
      this.runEnd();
    } else {
    	setTimeout(() => {
        this.runNext();
    	}, 300);
    }
  }
  
  getImage () {
    
  }
}

const checkOptions = () => {
  
}

module.exports = DiliSpider;
