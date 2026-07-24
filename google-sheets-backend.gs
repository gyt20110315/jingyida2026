// =====================================================
// 精艺达客诉系统 — Google Sheets 后端脚本
// 部署步骤：
// 1. 打开 https://sheets.new 创建新表格
// 2. 第一行写入表头：时间 | 公司 | 联系人 | 电话 | 订单号 | 类型 | 紧急度 | 描述
// 3. 扩展程序 → Apps Script → 粘贴本文件 → 部署为 Web 应用
// 4. 获取 URL 填入 service.html 的 GOOGLE_SHEET_URL
// =====================================================

var SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      new Date(),
      data.customer || '',
      data.contactPerson || '',
      data.phone || '',
      data.orderRef || '',
      data.category || '',
      data.urgency || '',
      data.description || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
