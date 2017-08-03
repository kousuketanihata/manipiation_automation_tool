const co = require('co');
import Fool from '../index';
const fs = require('fs');
const path = require('path');
const flash = require('connect-flash');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('./service/sqlite.js');

let app = express();
// エクスプレス初期設定
app.set('views', __dirname + '/views');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(flash());
app.use(bodyParser.urlencoded({
    extended : true
    })
);

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
// app.get('/confirm',function (req,res) {
//     res.render('confirm',{});
//     console.dir(res,req);
// });

app.post('/crawl_site',function (req,res) {

    // クローラーのエンジン部分
    const fool = new Fool();

    let scraping_by_http = req.body;
    // json形式にデータ構造を変換する
    let scraping = [
        ["goto",scraping_by_http.url]
    ];

    for ( let i = 0; i < scraping_by_http.config.length;i++ ){
        // 入力の時
        if (scraping_by_http.config[i].action === 'type'){
            scraping.push([scraping_by_http.config[i].action , scraping_by_http.config[i].query,scraping_by_http.config[i].input]);
        // スクレイピングする時(表示されるまでwait入れる)
        }else if(scraping_by_http.config[i].action === 'snatch'){
            scraping.push(["wait", scraping_by_http.config[i].query]);
            scraping.push([scraping_by_http.config[i].action , scraping_by_http.config[i].query,"innerText"]);
        }else{
            scraping.push(["wait", scraping_by_http.config[i].query]);
            scraping.push([scraping_by_http.config[i].action , scraping_by_http.config[i].query]);
        }
    }

    co(function* () {
        let results = [];
        results.push(
                // todo エラー処理
            yield fool.travel({data : scraping})
        );
        fool.kill();
        return results;
    }).then(results => {
        // 多重配列を一次元に直す もう少しいい感じにしたい
        let designedResults = Array.prototype.concat.apply([],results);
        designedResults = Array.prototype.concat.apply([],designedResults);
        res.end(JSON.stringify(designedResults));
    });
});

// クローリング処理を保存 渡されたオブジェクト全保存
app.post('/save',function(req,res) {
    let scrapingByHttp = req.body;
    if (sqlite.save(scrapingByHttp)){
        req.flash('message','保存が成功しました');
    }else {
        // エラーの時の処理
        res.status(500).send('Wrong password');
    }
});


app.listen(8888,()=> {
});
