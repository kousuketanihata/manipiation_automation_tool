// export class sqlite{
class Sqlite{

    // sqlite読み込み
    connection(){
        let sqlite = require('sqlite3').verbose();
        return new sqlite.Database('config.sqlite3');
    }

    save( scraping_config ){
        let db = this.connection();
        db.serialize(()=> {
            db.run(
                "insert into config (title,config,schedule,created_at,updated_at) values (?,?,?,datetime('now'),datetime('now'))", scraping_config.title,scraping_config.config,scraping_config.schedule
            );
        });
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
                db.all('select * from config' , function (err, allRows){
                    // if (err != null ) throw  err;
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
                db.get("select * from config  where id =  ?" ,id , function (err,row) {
                    callback(row);
                    db.close();
                });
            });
        }
    }
}

let sqlite = new Sqlite();

configs =  sqlite.fetchAll();
configs(function (callback) {
    console.log(callback);
})

config = sqlite.fetchById(1);
config(function (callback) {
    console.log(callback);
})

var scraping_config = {
    title    : 'テスト計画',
    schedule : 'aaa',
    config   : 'ccc',
};

sqlite.save(scraping_config);
sqlite.delete(2);
