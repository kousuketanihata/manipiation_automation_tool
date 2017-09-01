class Mail {
  constructor(){
    require('dotenv').config();
  }

  sendMail(destination) {
    let fs = require('fs');
    let helper = require('sendgrid').mail;
    //todo 松原さんからもらう予定のメールアドレスにする
    let fromEmail = new helper.Email('kosuke.tanihata@leverages.jp');
    let toEmail = new helper.Email(destination.emailTo);
    let subject = destination.title + '調査結果';
    let content = new helper.Content('text/plain', destination.title + '調査結果');
    let mail = new helper.Mail(fromEmail, subject, toEmail, content);

    const fileName = destination.filename;
    // ファイル存在確認
    fs.access(fileName, function (err) {
      if (err !== null) {
      }
    });
    let attachment = new helper.Attachment();
    let file = fs.readFileSync(destination.filename);
    let base64File = new Buffer(file).toString('base64');
    attachment.setContent(base64File);
    attachment.setType('application/xlsx');
    attachment.setFilename(fileName);
    attachment.setDisposition('attachment');
    mail.addAttachment(attachment);

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

  sendErrorMail(destination) {
    let helper = require('sendgrid').mail;
    // todo 修正(松原さんにアドレスもらう)
    let fromEmail = new helper.Email('kosuke.tanihata@leverages.jp');
    let toEmail = new helper.Email(destination.emailTo);
    let subject = destination.title + 'エラー報告';
    let content = new helper.Content('text/plain', destination.title + "を調査した結果以下のエラーが発生しています\n" + destination.error);
    let mail = new helper.Mail(fromEmail, subject, toEmail, content);
    let sendgrid = require('sendgrid')(process.env.SENDGRID_API);

    let request = sendgrid.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON(),
    });

    sendgrid.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
      }else{
        console.log('メール送信成功')
      }
    })
  }
}

export default Mail;