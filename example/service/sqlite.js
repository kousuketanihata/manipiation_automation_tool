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
        let id = scrapingConfig.path.replace(/[^0-9^\.]/g,"");
        console.log(id);
        let db = this.connection();
        // 更新処理の時
        if ( typeof( id ).length == 1 ){
            console.log(typeof id);
            db.serialize(()=>{
                db.run("update config set title = ?,config = ?, schedule = ?, url = ?,email = ?, updated_at = datetime('now')  where id = ?", scrapingConfig.title,saveConfig,scrapingConfig.schedule,scrapingConfig.url,scrapingConfig.email,id)
            })
            db.close();
        }else{
            // 新規作成の時
            console.log('新規作成')
            db.serialize(()=> {
                db.run("insert into config (title,config,schedule,url,email,created_at,updated_at) values (?,?,?,?,?,datetime('now'),datetime('now'))", scrapingConfig.title,saveConfig,scrapingConfig.schedule,scrapingConfig.url,scrapingConfig.email);
            });
            db.close();
        }

        // todo エラー処理
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
                db.get('select * from config  where id =  ?' ,id , function (err,row) {
                    callback(row);
                    db.close();
                });
            });
        }
    }

    fetchBySchedule(schedule_id){
        let db = this.connection();
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
