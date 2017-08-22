class Csv {
    // スクレイピングした内容が配列で入ってくる
    csv_export(scraping) {
        let officegen = require('officegen');
        let xlsx = officegen('xlsx')
        let csv = require('csv');
        let fs = require('fs');
        let dt = new Date();
        // 日本時間に修正
        dt.setTime(dt.getTime() + 1000 * 60 * 60 * 9);
        const thisMonth = dt.getMonth()+1;
        const fileName = scraping.title +'_' + dt.getFullYear() + '_'+ thisMonth + '_' + dt.getDate()+".xlsx";
        xlsx.on('finalize',function(written){
            console.log('ファイル作成完了 ファイル名:' + written)
        })

        xlsx.on('error',(err)=>{
            console.log(err)
        })

        let sheet = xlsx.makeNewSheet();
        sheet.name = fileName;
        sheet.data = [];
        sheet.data[0] = [];
        // 記述処理
        // ヘッダー部分
        sheet.data[0][0] = "結果";

        let out = fs.createWriteStream(fileName)
        for(let right_i = 0; right_i <= scraping.results.length-1 ; right_i ++){
            sheet.data[right_i+1] = [];
            sheet.data[right_i+1][0] = scraping.results[right_i]
        }

        out.on('error',function (err) {
            console.log(err)
        })

        xlsx.generate(out)
    }
}

let a = new Csv();
var scraping = {
    url:     'https://next.rikunabi.com/?vos=prnnrikunabitop001',
    title:   'なんやテスト',
    column:  ['面白カラム','スクレイピングするカラム'],
    xpath:   ['classとか','idとか'],
    results: ['社名A','社名B','社名A','社名B']
};
a.csv_export(scraping);
//export default Csv

