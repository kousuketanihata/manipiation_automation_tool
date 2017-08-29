class Mail{
    sendMail(destination){
        require('dotenv').config();

        let helper = require('sendgrid').mail;
        let fs = require('fs');
        // todo  ファイルパス受け取るようにする
        // ファイル存在確認
        try {
            fs.statSync(destination.filename);
        } catch(err) {
            console.log(err);
        }

        let content = new helper.Content('text/plain', destination.title + '調査結果');
        let fromEmail = new helper.Email(destination.emailFrom);
        let toEmail = new helper.Email(destination.emailFrom);
        let subject = destination.title + '調査結果';
        let mail    = new helper.Mail(fromEmail, subject, toEmail, content);

        let attachment = new helper.Attachment();
        let file = fs.readFileSync(destination.filename);
        let base64File = new Buffer(file).toString('base64');
        attachment.setContent(base64File);
        attachment.setType('application/type');
        attachment.setFilename(destination.filename);
        attachment.setDisposition('attachment');
        mail.addAttachment(attachment);

        let sendgrid = require('sendgrid')(process.env.SENDGRID_API)
        let request = sendgrid.emptyRequest({
            method: "POST",
            path : '/v3/mail/send',
            body: mail.toJSON(),
        });

        sendgrid.API(request,function (error,response) {
            if (error) {
                console.log('Error response received');
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
            // ファイル削除処理
            // fs.unlink(destination.filename,(err)=>{
            //     console.log('ファイル削除が成功しました');
            //     if (! err){
            //         return true
            //     }else{
            //         return false
            //     }
            // });
        })
    }
}
export default Mail;
