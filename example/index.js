// 公式ライブラリー
const co = require('co');
const expressValidator = require("express-validator");
const express = require('express');
const expressBatch = require("express-batch");
const bodyParser = require('body-parser');

// 自作ライブラリー(service以下に設置)
import Csv from "./service/csv";
import Fool from '../index';
import Sqlite from './service/sqlite.js';
import Mail from './service/mail.js'
import Scraping from './service/scraping';

let app = express();
// エクスプレス初期設定
app.use(require('connect-flash')());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
  })
);
app.use(expressValidator());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// schedule
const masterConfig = {
  schedule: {
    month: 1,
    week: 2,
    day: 3,
  }
};

//// webルーティング
// 一覧ページ
app.get('/', function (req, res) {
  let configs = new Sqlite().fetchAll();
  configs((callback) => {
    res.render('index', {
      configs: callback,
      master: masterConfig
    })
  })
});

// 新規登録ページ
app.get('/new', function (req, res) {
  res.render('new', {url: 'new'});
});

// 編集ページ(新規登録ページと同じでおk)
app.get('/edit/:id(\\d+)', function (req, res) {
  let configCallback = new Sqlite().fetchById(req.params.id);
  configCallback((callback) => {
    res.render('new', {config: callback, url: 'edit'})
  });
});

app.post('/crawl_site', function (req, res) {
  // クローラーのエンジン部分
  const fool = new Fool();
  let scraping_by_http = req.body;
  // json形式にデータ構造を変換する
  let scraping = new Scraping().parsePreprocess(scraping_by_http.config, scraping_by_http.url);

  co(function* () {
    let results = [];
    try {
      results.push(
        yield fool.travel({data: scraping})
      );
    } catch (e) {
      res.end(JSON.stringify({
        success: false,
        result: e
      }));
    }
    fool.kill();
    return results;
  }).then((results) => {
    let designedResults = Array.prototype.concat.apply([], results);
    designedResults = Array.prototype.concat.apply([], designedResults);
    res.end(JSON.stringify({
        success: true,
        result: designedResults
      }
    ));
  });
});

app.post('/delete/:id', (req, res) => {
  const sqlite = new Sqlite();
  const id = req.params.id;
  sqlite.deleteConfig(id);
  res.contentType("application/json");
  res.status(200);
});

// クローリング処理を保存 渡されたオブジェクト全保存
app.post('/save', function (req, res) {
  // バリデーション
  req.check('title', 'タイトル').notEmpty();
  req.check('url', 'url').notEmpty().isURL();
  req.check('email', 'メール').notEmpty().isEmail();
  req.check('schedule', 'スケジュール').notEmpty().isInt();
  req.check('path', 'パス').notEmpty();
  req.getValidationResult().then(function (result) {
    // バリデーションエラーの個数が0以外の時
    if (result.array().length != 0) {
      console.log(result.array());
    } else {
      let scrapingByHttp = req.body;
      const sqlite = new Sqlite();
      if (sqlite.save(scrapingByHttp)) {
        res.contentType("application/json");
        res.status(200);
        res.end(JSON.stringify({"message": "upload success"}));
      } else {
        // エラーの時の処理
        res.status(500).send('something error');
      }
    }
  });
});

// apiで使う共通処理
let apiMain = function (scrapingConfig) {

  let onError = function (conf) {
    console.log('クローリングがエラーだ 辛い');
    let mail = new Mail();
    mail.sendErrorMail({
      emailTo:scrapingConfig.email,
      title:scrapingConfig.title
    });
  };

  // jsonに戻す処理
  let userInputConfig = scrapingConfig.config.split('\n');

  let scraping = [];
  for (let i = 0; i <= userInputConfig.length - 1; i++) {
    let configArray = userInputConfig[i].split("\t");
    // 一旦ハッシュを受ける
    let tmp = {};
    for (let i in configArray) {
      let parseCharPlace = configArray[i].search("\\$");
      tmp[configArray[i].slice(0, parseCharPlace)] = configArray[i].slice(parseCharPlace + 1, configArray[i].length)
    }
    scraping.push(tmp);
  }
  // クローリング
  let parsedConfig = new Scraping().parsePreprocess(scraping, scrapingConfig.url);
  const fool = new Fool();
  co(function* () {
    let results = [];
      results.push(
        yield  fool.travel({data: parsedConfig})
      );
    return results
  }).then(results => {
    // 多重配列を一次元に直す もう少しいい感じにしたい
    let designedResults = Array.prototype.concat.apply([], results);
    designedResults = Array.prototype.concat.apply([], designedResults);
    console.log(designedResults);
    // csv出力
    let csv = new Csv();
    let fileTitle = csv.csvExport({
      url: scrapingConfig.url,
      title: scrapingConfig.title,
      results: designedResults,
    });
    // ファイル出力を待つ必要がある
    setTimeout(() => {
      // 宛先に送信
      let mail = new Mail();
      mail.sendMail({
        filename: fileTitle,
        isScrapingSuccess: true,
        emailTo: scrapingConfig.email,
        // todo 松原さんにもらったアドレスに変える
        title: scrapingConfig.title,
      });
    }, 500)
  }).catch(
    onError
  )
};

// apiルーティング
// 毎月実行されるやつ
app.get('/api/month', (req, res) => {
  const sqlite = new Sqlite();
  let configs = sqlite.fetchBySchedule(masterConfig.schedule.month);
  configs((callback) => {
    apiMain(callback);
  });
  res.header('Access-Control-Allow-Origin', '*');
  res.json({message: '通信に成功しました'});
});
//
// // 週ごとのやつ
app.get('/api/week', () => {
  const sqlite = new Sqlite();
  let configs = sqlite.fetchBySchedule(masterConfig.schedule.week);
  configs((callback) => {
    apiMain(callback)
  });
  res.header('Access-Control-Allow-Origin', '*');
  res.json({message: '通信に成功しました'});
});

// 日毎のやつ
app.get('/api/day', () => {
  const sqlite = new Sqlite();
  let configs = sqlite.fetchBySchedule(masterConfig.schedule.day);
  configs((callback) => {
    apiMain(callback)
  });
  res.header('Access-Control-Allow-Origin', '*');
  res.json({message: '通信に成功しました'});
});

app.listen(9988, () => {
});
