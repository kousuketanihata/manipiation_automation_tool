class Mail {
  sendMail(destination) {
    require('dotenv').config();
    let helper = require('sendgrid').mail;

    //todo 松原さんからもらう予定のメールアドレスにする
    let fromEmail = new helper.Email('kosuke.tanihata@leverages.jp');
    let toEmail = new helper.Email(destination.emailFrom);
    let subject = destination.title + '調査結果';
    let mail = new helper.Mail(fromEmail, subject, toEmail, content);

    // 成功してた時の処理
    if (destination.isScrapingSuccess){
      let content = new helper.Content('text/plain', destination.title + '調査結果');
      let fs = require('fs');
      const fileName = destination.filename;
      // ファイル存在確認
      fs.access(fileName, function (err) {
        if (err !== null) {}
      });
      let attachment = new helper.Attachment();
      let file = fs.readFileSync(destination.filename);
      let base64File = new Buffer(file).toString('base64');
      attachment.setContent(base64File);
      attachment.setType('application/xlsx');
      attachment.setFilename(fileName);
      attachment.setDisposition('attachment');
      mail.addAttachment(attachment);
    }else{
      // スクレイピングが失敗した時の処理
      this.sendErrorMail();
      let content = new helper.Content('text/plain', destination.title + 'をクローリングしましたが、エラーが発生しました。');
    }
    let sendgrid = require('sendgrid')(process.env.SENDGRID_API);
    let request = sendgrid.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON(),
    });

    sendgrid.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
      }
      //ファイル削除処理
      fs.unlink(destination.filename, (err) => {
        console.log('ファイル削除が成功しました');
      });
    })
  }
}

export default Mail;