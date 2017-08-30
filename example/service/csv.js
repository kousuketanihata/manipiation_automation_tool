class Csv {
  // スクレイピングした内容が配列で入ってくる
  csvExport(scraping) {
    let officegen = require('officegen');
    let xlsx = officegen('xlsx')
    let fs = require('fs');
    let dt = new Date();
    // 日本時間に修正
    dt.setTime(dt.getTime() + 1000 * 60 * 60 * 9);
    const thisMonth = dt.getMonth() + 1;
    const fileName = scraping.title + '_' + dt.getFullYear() + '_' + thisMonth + '_' + dt.getDate() + ".xlsx";
    xlsx.on('finalize', function (written) {
    })

    xlsx.on('error', (err) => {
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
    for (let right_i = 0; right_i <= scraping.results.length - 1; right_i++) {
      sheet.data[right_i + 1] = [];
      sheet.data[right_i + 1][0] = scraping.results[right_i]
    }
    out.on('error', function (err) {
      console.log(err)
    });
    xlsx.generate(out);
    return fileName;
  }
}

export default Csv
