const getTimeObj = (time) => {
  const timeobj = new Date(time);
  return {
    y: timeobj.getFullYear(),
    m: timeobj.getMonth() + 1 >= 10 ? timeobj.getMonth() + 1 : '0' + (timeobj.getMonth() + 1),
    d: timeobj.getDate() >= 10 ? timeobj.getDate() : '0' + timeobj.getDate(),
    wd: timeobj.getDay(),
    h: timeobj.getHours() > 10 ? timeobj.getHours() : '0' + timeobj.getHours(),
    min:timeobj.getMinutes() > 10 ? timeobj.getMinutes() : '0' + timeobj.getMinutes(),
    s: timeobj.getSeconds() > 10 ? timeobj.getSeconds() : '0' + timeobj.getSeconds()
  }
}

module.exports = (time) => {
  switch (typeof time) {
    case 'number':
      return getTimeObj(time);
    break;
    case 'string':
      const reg = /(\d{4})\-?\/?(\d{2})/;
      if (reg.test(time)) {
        return getTimeObj(time);
      } else {
        console.log('参数缺失或格式错误');
      }
    break;
    default:
      console.log('参数缺失或格式错误');
    break;
  }
}