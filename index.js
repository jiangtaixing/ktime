var domApp = document.querySelector(".app");
var domTime = document.querySelector(".time");
var domDate = document.querySelector(".date");
var domCnDate = document.querySelector(".cn-date");
var domStandAlert = document.querySelector(".stand-alert");

function geturl(url) {
  var arr = url.split("?");

  if (!arr[1]) {
    return {};
  }

  var res = arr[1].split("&");
  var items = {};
  for (var i = 0; i < res.length; i++) {
    var a = res[i].split("=");
    items[a[0]] = a[1];
  }
  return items;
}
function formatDate(date, fmt) {
  if (typeof fmt === "undefined") {
    fmt = "yyyy-MM-dd";
  }
  if (!date) {
    return "";
  }
  if (typeof date === "number" || typeof date === "string") {
    date = new Date(Number(date));
  }
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr((o[k] + "").length)
      );
  return fmt;
}
function render() {
  try {
    // Kindle浏览器的new Date()返回UTC时间，需要转换为中国时间（UTC+8）
    // 如果您的设备时间不准确，请检查设备设置，或在此处恢复补偿逻辑
    var date = new Date(); 
    // var date = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000) + (3 * 60 * 1000)); // 旧逻辑：加8小时3分钟

    var lunar = calendar.solar2lunar(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    
    var dateText = formatDate(date, "yyyy.M.d") + " " + (
      urlQuery.l == "en"
        ? ["SUN", "MON", "TUES", "WED", "THUR", "FRI", "SAT"][date.getDay()]
        : "星期" + ["日", "一", "二", "三", "四", "五", "六"][date.getDay()]
    );
    
    // 修复分钟显示格式，确保两位数显示（兼容老版本浏览器）
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var timeText = hours + ":" + (minutes < 10 ? '0' + minutes : minutes);
    
    var cnDateText = lunar.IMonthCn + lunar.IDayCn + " " + lunar.Animal + "年";

    var standAlertText = "";
    if (hours % 2 !== 0) {
      standAlertText = "现在是站立时间";
    }

    if (domDate && domDate.innerHTML != dateText) domDate.innerHTML = dateText;
    if (domTime && domTime.innerHTML != timeText) domTime.innerHTML = timeText;
    if (domCnDate && domCnDate.innerHTML != cnDateText) domCnDate.innerHTML = cnDateText;
    if (domStandAlert && domStandAlert.innerHTML != standAlertText) domStandAlert.innerHTML = standAlertText;
  } catch (e) {
    // 如果出现错误，至少显示基本时间
    if (domTime) {
      var now = new Date();
      var h = now.getHours();
      var m = now.getMinutes();
      domTime.innerHTML = h + ":" + (m < 10 ? '0' + m : m);
    }
  }
}

var urlQuery = geturl(location.href);
var config = {
  fontSize: +(urlQuery.fs || 7),
  rotate: urlQuery.r,
  lang: urlQuery.l,
};

domTime.style.fontSize = config.fontSize + "rem";
domDate.style.fontSize = config.fontSize / 2.5 + "rem";
domCnDate.style.fontSize = config.fontSize / 4 + "rem";
if (domStandAlert) domStandAlert.style.fontSize = config.fontSize / 4 + "rem";
domApp.style.cssText = "-webkit-transform: rotate(" + (config.rotate || 0) + "deg) translate3d(-50%,-50%,0)";

// 添加版本信息用于调试缓存问题
console.log("Kindle Time Script v2.6 - Precise 3min Compensation - " + new Date().toISOString());

render();
setInterval(function() {
  render();
}, 1000);
