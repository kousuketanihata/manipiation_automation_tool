class Sqlite{
    // sqlite読み込み
    connection(){
        let sqlite = require('sqlite3').verbose();
        return new sqlite.Database('config.sqlite3');
    }

    save( scrapingConfig ){
        // いい感じにしたい
        function _joinObj(obj, fDelimiter, sDelimiter) {
            let tmpArr = [];
            if (typeof obj === 'undefined') return '';
            if (typeof fDelimiter === 'undefined') fDelimiter = '';
            if (typeof sDelimiter === 'undefined') sDelimiter = '';

            for (let key in obj) {
                tmpArr.push(key + fDelimiter + obj[key]);
            }
            return tmpArr.join(sDelimiter);
        };

        // タブ文字で結合する
        let saveConfig = scrapingConfig.config.map(function (data,index) {
            return _joinObj(data,'$','\t');
        });

        saveConfig = saveConfig.join('\n');
        // location href から数値だけ取り出す
        let db = this.connection();
        scrapingConfig.config = scrapingConfig.config.join("\t");
        console.log(scrapingConfig.config)
        let id = scrapingConfig.path.replace(/[^0-9^\.]/g,"");
        // 更新処理の時
        if ( typeof( id ).length == 1 ){
            db.serialize(()=>{
                db.run("update config set title = ?,config_blob = ?, schedule = ?, url = ?,email = ?, updated_at = datetime('now')  where id = ?",
                    scrapingConfig.title,saveConfig,scrapingConfig.schedule,scrapingConfig.url,scrapingConfig.email,id)
            })
        }else{
            // 新規作成の時
            db.serialize(()=> {
                db.run("insert into config (title,config_blob,schedule,url,email,created_at,updated_at) values (?,?,?,?,?,datetime('now'),datetime('now'))", scrapingConfig.title,saveConfig,scrapingConfig.schedule,scrapingConfig.url,scrapingConfig.email);
            });
        }
        db.on('error', function (err) {
            console.error(err);
            process.exit(1);
        });
        db.close();
        return true;
    }

    delete(id){
        let db = this.connection();
        db.serialize(()=> {
            db.run("delete from config where id = ?",id);
        })
    }

    fetchAll(){
        let db = this.connection();
        return function (callback) {
            db.serialize(()=>{
                db.all('select * from config order by id desc' , function (err, allRows){
                    if (err != null ) throw  err;
                    callback(allRows);
                    db.close();
                });
            });
        };
    }

    fetchById(id){
        let db = this.connection();
        return function (callback) {
            db.serialize( ()=>{
                db.get('select * from config  where id =  ?' ,id , function (err,rows) {
                    callback(rows);
                    db.close();
                });
            });
        }
    }

    fetchBySchedule(schedule_id){
        let db = this.connection();
        console.log(schedule_id);
        return function (callback) {
            db.serialize(()=>{
                db.all('select * from config where schedule = ?', schedule_id , function (err, allRows){
                    if (err != null ) throw  err;
                    allRows.forEach(function (row) {
                        callback(row)
                    })
                    db.close();
                });
            });
        }
    }
}

//  let sqlite = new Sqlite();
//
// configs =  sqlite.fetchAll();
// configs(function (callback) {
//     console.log(callback);
// })
//
// config = sqlite.fetchById(1);
// config(function (callback) {
//     console.log(callback);
// })
//
// var scraping_config = {
//     title    : 'テスト計画',
//     schedule : 'aaa',
//     config   : 'ccc',
// };
//
//sqlite.save(scraping_config);
// sqlite.delete(2);

export default Sqlite;
