// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '{token}';
//スプレッドシートID
var ss = SpreadsheetApp.openById('{SpreadsheetID}');
//シート名
var sh = ss.getSheetByName('{SpreadsheetName}');


function doPost(e) {

  var json = JSON.parse(e.postData.contents);

  // WebHookで受信した応答用Token
  var replyToken = json.events[0].replyToken;
  // ユーザーのメッセージを取得
  var userMessage = json.events[0].message.text;

  //type
  var userMessageType = json.events[0].message.type;

  if(userMessageType != 'text'){
    sendMessage(json, 'テキスト以外送らないで');
  } else if(userMessage == '削除') {
    //シートの最終行を取得する
    var lastRow = sh.getLastRow();
    sh.deleteRows(1,lastRow);
    sendMessage(json, 'リストを削除しました！');
  } else if(userMessage == '一覧') {
    //シートの一覧を取得する
    var lastRow = sh.getLastRow();
    var result = '登録したもの一覧です\n';

    for (let i = 1; i <= lastRow; i++){
      var wordList  = sh.getRange(i,1).getValue();
      result += '\n' + wordList;
    }
    sendMessage(json, result);

  } else {
    sh.appendRow([userMessage]);
    sendMessage(json, '登録できました！');
  }

}


//replyする
function sendMessage(json,msg) {

  var replyToken = json.events[0].replyToken;
  var reply_url = 'https://api.line.me/v2/bot/message/reply';

  UrlFetchApp.fetch(reply_url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages':[
        {
          'type':'text',
          'text':msg
        },
      ]
    }),
  });

  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}
