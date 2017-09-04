# Scraper

リストから項目を設定すると定期的にデータをスクレイピングしてくれるサービスです

##
sendgridでアカウント作成

## todo

## 使用方法

npm run example

## スクレイピング
サイト内の情報を取得します。
### 用意するjson
```json
{
  "data": [
    ["goto", "https://www.google.co.jp/"],
    ["type", "form[action='/search']", "fool"],
    ["click", "form[action*='/search'] [type=submit]"],
    ["wait", "._NId h3 a"],
    ["snatch", "._NId h3 a", "innerText"]
  ]
}
```

### サンプルコード

const data = {
  data: [
    ["goto", "https://www.google.co.jp/"],
    ["type", "form[action='/search']", "fool"],
    ["click", "form[action*='/search'] [type=submit]"],
    ["wait", "._NId h3 a"],
    ["snatch", "._NId h3 a", "innerText"]
  ]
};



### その他の操作について

nightmare.jsを使用しています。下記は主なコマンドです。
Intaract with the pageの詳細は、nightmareをご参照ください。

https://github.com/segmentio/nightmare/blob/master/Readme.md#interact-with-the-page

|概要|intaract with the page|json.dataの例|
|---|---|---|
|WEBページを開く|goto|["goto", "https://www.google.co.jp/"]|
|テキストボックスに入力|type|["type", "form[action='/search']", "fool"]|
|セレクターで指定された<br>要素の表示を待つ|wait|["wait", "._NId h3 a"]|
|セレクターで指定された<br>要素をクリックする|click|["click", "form[action*='/search'] [type=submit]"]|
|セレクターで指定された<br>単一の要素のpropertyを取得する|scrape|["scrape", "._NId h3 a", "innerText"]|
|セレクターで指定された<br>要素のpropertyを配列で取得する|snatch|["snatch", "._NId h3 a", "innerText"]|

