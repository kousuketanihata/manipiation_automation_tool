const co = require('co');
import Fool from '../index';
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const googleItineraryPath = path.join(__dirname, './google.json');
const googleItinerary = JSON.parse(fs.readFileSync(googleItineraryPath, 'utf8'));

// クローラーのエンジン部分
const fool = new Fool();

let app = express();
// エクスプレス初期設定
app.set('views', __dirname + '/views');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended : true
    })
);

// 一覧ページ
app.get('/',function (req,res) {
    res.render('index',{});
});

// 新規登録ページ
app.get('/new',function(req,res) {
    res.render('new',{});
});

// 編集ページ(新規登録ページと同じでおk)
app.get('/edit', function (req,res) {
    res.render('new',{});
});

// 入力内容でスクレイピングして出力と一致していたら
app.get('/confirm',function (req,res) {

});

app.post('/crawl_site',function (req,res) {
    console.dir(req.body);
    let scrapingByHttp = req.body;
    // json形式にデータ構造を変換する
    let scraping = [];
    for ( let scraping in scrapingByHttp ){
        console.log(scraping);
        scraping.[].push();
    }

    //
    // let trimedScaping = scrapingByHttp.map(function (value) {
    //     console.log(value);
    //     if (value){
    //         return ["goto",value]
    //     }
    // });
    // co(function* (scraping) {
    //     const results = [];
    //     results.push(yield fool.travel(googleItinerary));
    //     fool.kill();
    //     return results;
    // }).then(results => {
    //     console.log(results);
    // });
});

// クローリング処理を保存
app.post('/save',function(req,res) {
    console.log('test');
});


app.listen(9996,()=> {
});
