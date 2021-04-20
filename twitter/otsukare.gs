//認証用インスタンスの生成
var twitter = TwitterWebService.getInstance(
  'xxxxxxxxxx',//API Key
  'xxxxxxxxxx'//API secret key
);
 
//アプリを連携認証する
function authorize() {
  twitter.authorize();
}
 
//認証を解除する
function reset() {
  twitter.reset();
}
 
//認証後のコールバック
function authCallback(request) {
  return twitter.authCallback(request);
}

// 今月もおつかれ投稿
//このfunctionは最終金曜日にしか実行されない
function postTweet() {
  
  var service  = twitter.getService();
  var endPointUrl = 'https://api.twitter.com/1.1/statuses/update.json';
  
  var response = service.fetch(endPointUrl, {
    method: 'post',
    payload: {
      status: 'みんな今月も偉かった'
    }
  });
}

//その月の最終営業日にtweetするように判定
//このfunctionを毎週金曜日に実行されるようにトリガーに設定しておく。
function trigger(){
  
  //判定したい日の月を取得
  date = new Date();
  var month = date.getMonth()

  //7日を足す
  date.setDate(date.getDate()+7);
  //7日後の月を取得
  var month_next_week = date.getMonth();

  //月が一致しなければ最終週なのでtweetをする
  if (month != month_next_week){
    postTweet();
  };
}


