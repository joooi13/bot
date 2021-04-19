// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '{token}';
//スプレッドシートID
var ss = SpreadsheetApp.openById('{SpreadsheetID}');
//シート名
var sh = ss.getSheetByName('{SpreadsheetName}');


function doPost(e) {
  // WebHookで受信した応答用Token
  var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
  // ユーザーのメッセージを取得
  var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
  // 応答メッセージ用のAPI URL
  var url = 'https://api.line.me/v2/bot/message/reply';
  //シートの最終行を取得する
  var lastRow = sh.getLastRow();
  //シートの全受信語句と返信語句を二次元配列で取得する
  var wordList = sh.getRange(1,1,lastRow,2).getValues();

  //返信語句を格納するための空配列を宣言する
  var replyTextList = [];

  //LINEで受信したuserMessageがシートのA列と同じ場合、B列を返信語句としてreplyTextにpush
  for(var i = 1; i < wordList.length; i++) {
    if(wordList[i][0] == userMessage) {
      replyTextList.push(wordList[i][1]);
    }
  }

 //一度に最大5つの吹き出ししか返信できないため、replyTextListのLengthが5より大きい場合、messageLengthを5にする
　if(replyTextList.length > 5) {
    var messageLength = 5;
  } else {
    var messageLength = replyTextList.length;
  }

  //"messages"に渡す配列を格納するための空配列を宣言する
  //[{"type": "text", "text": "返信語句その1"},{"type": "text", "text": "返信語句その2"}....]
  var messageArray = [];

  //replyTextListに格納されている返信語句を最大5つ、messageArrayにpushする
  for(var j = 0; j < messageLength; j++) {
    messageArray.push({"type": "text", "text": replyTextList[j]});
  }

  //該当しなかったら、登録なしとmessageArrayにpushする
  if(messageArray.length < 1){
    messageArray.push({"type": "text", "text": userMessage + 'は登録がありません'});
  }

  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messageArray,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}
