const co = require('co');
const fs = require('fs');
const path = require('path');
const flash = require('connect-flash');
const expressValidator  = require("express-validator");
const express = require('express');
const session = require('express-session');
const expressBatch = require("express-batch");
const bodyParser = require('body-parser');
import Fool from '../index';
import Sqlite from'./service/sqlite.js';

let app = express();
// エクスプレス初期設定
app.use(require('connect-flash')());
app.set('views', __dirname + '/views');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended : true
    })
);
app.use(expressValidator());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(function (req,res,next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



// schedule
const master_config = {
    schedule: {
        month : 1,
        week  : 2,
        day   : 3,
    }
};

//// webルーティング
// 一覧ページ
app.get('/',function (req,res) {
    let configs =  new Sqlite().fetchAll();
    configs((callback)=>{
        res.render('index',{
            configs : callback,
            master  : master_config
        })
    })
});

// 新規登録ページ
app.get('/new',function(req,res) {
    res.render('new',{url:'new'});
});

// 編集ページ(新規登録ページと同じでおk)
app.get('/edit/:id(\\d+)', function (req,res) {
    let configCallback = new Sqlite().fetchById(req.params.id);
    configCallback((callback)=>{
        res.render('new',{config: callback,url:'edit'})
    });
});

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
    // バリデーション
    req.check('title','タイトル').notEmpty().isAlphanumeric();
    req.check('url','url').notEmpty().isURL();
    req.check('email','メール').notEmpty().isEmail();
    req.check('schedule','スケジュール').notEmpty().isInt();
    req.check('path','パス').notEmpty();
    req.getValidationResult().then(function (result) {
        // バリデーションエラーの個数が0以外の時
        console.log(result.array())
        if (result.array().length != 0 ){
            console.log('バリデーションエラー')
        }else{
            let scrapingByHttp = req.body;
            const sqlite = new Sqlite();
            if (sqlite.save(scrapingByHttp)){
                console.log('aaaaaaaaa')
                res.contentType("application/json");
                res.status(200);
                res.end(JSON.stringify({"message": "upload success"}));
            }else {
                // エラーの時の処理
                res.status(500).send('something error');
            }
        }
    });
    // ここまでバリデーション

});

app.post('/delete/:id', (req,res)=>{
    const sqlite =  new Sqlite();
    const id = req.params.id;
    // エラー処理的なやつ
    if(sqlite.delete(id)){
        res.contentType("application/json");
        res.status(200);
    }else{
        // 500番返す的な
        res.status(500);
    };
})



// apiで使う共通処理
let main  = function(configs) {
    configs((callback)=>{
        console.log(callback);
    })
    // jsonに戻す処理
    // クローリング

    // csv出力
    // 宛先に送信
}

// apiルーティング
// 月別のやつ
// app.get('/api/month',()=>{
//     const sqlite = new Sqlite();
//     let configs =  sqlite.fetchBySchedule(month);
//     console.log('aa');
//     configs((callback)=>{
//         console.log(callback);
//     })
//     // main(configs);
// });
//
// // 週ごとのやつ
// app.get('/api/week',()=>{
//
// });
//
// // 日毎のやつ
// app.get('/api/day',()=>{
//
// });

app.listen(9994,()=> {
});
