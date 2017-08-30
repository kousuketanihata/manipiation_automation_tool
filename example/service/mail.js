class Mail {
  sendMail(destination) {
    require('dotenv').config();
    let helper = require('sendgrid').mail;
    let fs = require('fs');
    const fileName = destination.filename;
    // todo  ファイルパス受け取るようにする
    // ファイル存在確認
    fs.access(fileName, function (err) {
      if (err !== null) {
        console.log('ファイルが存在しません');
        // todo ログ記述処理
        // todo プロセス終了処理
      }
    });
    let content = new helper.Content('text/plain', destination.title + '調査結果');
    let fromEmail = new helper.Email(destination.emailFrom);
    let toEmail = new helper.Email(destination.emailFrom);
    let subject = destination.title + '調査結果';
    let mail = new helper.Mail(fromEmail, subject, toEmail, content);

    let attachment = new helper.Attachment();
    let file = fs.readFileSync(destination.filename);
    let base64File = new Buffer(file).toString('base64');
    attachment.setContent(base64File);
    attachment.setType('application/xlsx');
    attachment.setFilename('aaaa.xlsx');
    attachment.setDisposition('attachment');
    mail.addAttachment(attachment);

    let sendgrid = require('sendgrid')(process.env.SENDGRID_API)
    let request = sendgrid.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON(),
    });

    sendgrid.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
      }
      console.log(response.statusCode);
      //ファイル削除処理
      fs.unlink(destination.filename, (err) => {
        console.log('ファイル削除が成功しました');
        if (!err) {
          return true
        } else {
          return false
        }
      });
    })
  }
}

export default Mail;
