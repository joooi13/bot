// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '{token}';

function doPost(e) {

  var json = JSON.parse(e.postData.contents);

  //送信されたimegeを取得
  var image = getImage(json, url);

  //GoofleDriveの任意のフォルダへimageを保存
  var dir = DriveApp.getFolderById('{folderId}');
  dir.createFile(image);

  sendMessage(json, '登録できました！');

}

//コンテンツを取得する
function getImage(json) {

  //コンテンツを取得するAPI
  var url = 'https://api-data.line.me/v2/bot/message/' + json.events[0].message.id + '/content/';

  return UrlFetchApp.fetch(url, {
    "method": "get",
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN
    }
  });
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
