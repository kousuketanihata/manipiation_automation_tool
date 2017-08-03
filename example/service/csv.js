class Csv {
    // スクレイピングした内容が配列で入ってくる
    csv_export(scraping) {
        // body...
        let csv = require('csv');
        let fs = require('fs');
        let dt = new Date();
        // 日本時間に修正
        dt.setTime(dt.getTime() + 1000 * 60 * 60 * 9);
        const this_month = dt.getMonth()+1;
        const file_name = scraping.title +'_'+ scraping.url +'_' + dt.getFullYear() + '/'+ this_month + '/' + dt.getDate() + '.csv';
        console.log(file_name);
        fs.writeFile(file_name);
    }
}

let a = new csv();
var scraping = {
    url: 'https://next.rikunabi.com/?vos=prnnrikunabitop001',
    title: 'なんやテスト',
    column: ['面白カラム','スクレイピングするカラム'],
    xpath: ['classとかidとか',''],
    results: ['社名A','社名B']
};
a.csv_export(scraping);

export default Csv
