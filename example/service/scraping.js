class Scraping {
    parsePreprocess(initial_config,url){
        let scraping = [
            ["goto",url]
        ];

        for ( let i = 0; i < initial_config.length;i++ ){
            // 入力の時
            if (initial_config[i].action === 'type'){
                scraping.push([initial_config[i].action, initial_config[i].query,initial_config[i].input]);
                // スクレイピングする時(表示されるまでwait入れる)
            }else if(initial_config[i].action === 'snatch'){
                scraping.push(["wait", initial_config[i].query]);
                scraping.push([initial_config[i].action, initial_config[i].query,"innerText"]);
            }else{
                scraping.push(["wait", initial_config[i].query]);
                scraping.push([initial_config[i].action, initial_config[i].query]);
            }
        }
        return scraping;
    }
}

export default Scraping
