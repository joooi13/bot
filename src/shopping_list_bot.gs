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

    var result = '削除する商品の番号を入力してね\nカンマ区切りにするか、ハイフンで範囲を指定してね\n';
    for (let i = 1; i <= lastRow; i++){
      var wordList  = sh.getRange(i,1).getValue();
      result += '\n' + i + '：' + wordList;
    }
    sendMessage(json, result);
  } else if(!isNaN(userMessage) || userMessage.match(/,/)) {

    var userMessages = userMessage.split(",");

    for (var i = userMessages.length - 1; i >= 0 ; i--){

      //削除する商品を取得
      var deleteWord  = sh.getRange(userMessages[i],1).getValue();

      if (deleteWord) {
        //選ばれた行の商品を削除
        sh.deleteRow(userMessages[i]);
      } else {
        sendMessage(json, '削除するものがないよ');
      }
    }

    afterDelete(sh,json);

  } else if(!isNaN(userMessage) || userMessage.match(/-/)) {

    var userMessages = userMessage.split("-");

    var deleteFirstNum = Number(userMessages[0]);
    var deleteLastNum = Number(userMessages[1]);

    for (var i = deleteLastNum; i >= deleteFirstNum; i--){

      //削除する商品を取得
      var deleteWord  = sh.getRange(i,1).getValue();

      if (deleteWord) {
        //選ばれた行の商品を削除
        sh.deleteRow(i);
      } else {
        sendMessage(json, '削除するものがないよ');
      }
    }

    afterDelete(sh,json);

  } else if(userMessage == '全削除') {
    //シートの最終行を取得し、全行削除
    var lastRow = sh.getLastRow();
    sh.deleteRows(1,lastRow);
    sendMessage(json, 'リストを全削除したよ');
  } else if(userMessage == '一覧') {
    //シートの一覧を取得する
    var lastRow = sh.getLastRow();

    //1件も登録がない場合
    if (lastRow === 0) {
      sendMessage(json, 'ない');
      return;
    }

    //1件でもある場合
    var result = 'お買い物リスト一覧\n';
    for (let i = 1; i <= lastRow; i++){
      var wordList  = sh.getRange(i,1).getValue();
      result += '\n' + wordList;
    }
    sendMessage(json, result);
  } else {
    sh.appendRow([userMessage]);
    pushMessage(userMessage);
  }

}

//削除後の処理
function afterDelete(sh,json){
    //シートの一覧を取得する
    var lastRow = sh.getLastRow();
    var result = '残りは';

    //1件も登録がない場合
    if (lastRow === 0) {
      sendMessage(json, '選択された商品を削除したよ \n登録されているものはもうないよ');
      return;
    }

    //1件でもある場合
    for (let j = 1; j <= lastRow; j++){
      var wordList  = sh.getRange(j,1).getValue();
      result += '\n' + wordList;
    }

    sendMessage(json, '選択された商品を削除したよ\n' + '\n' + result + '\nだよ');
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

//push通知する
function pushMessage(msg) {

  var push_url = 'https://api.line.me/v2/bot/message/broadcast';

  UrlFetchApp.fetch(push_url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'messages':[
        {
          'type':'text',
          'text':'「' + msg + '」の登録があったよ'
        },
      ]
    }),
  });

}

//明日は8のつく日
function pushEightDayTomorrow() {

  var push_url = 'https://api.line.me/v2/bot/message/broadcast';

  UrlFetchApp.fetch(push_url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'messages':[
        {
          'type':'text',
          'text':'明日は８のつく日！'
        },
      ]
    }),
  });

}

//今日は8のつく日
function pushEightDay() {

  var push_url = 'https://api.line.me/v2/bot/message/broadcast';

  UrlFetchApp.fetch(push_url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'messages':[
        {
          'type':'text',
          'text':'今日は８のつく日！ハッピーデー！'
        },
      ]
    }),
  });

}
