class Mail{
    sendMail(user){
        let Email = require('email').Email;
        let myMessage = new Email({
            from: user.email,
            to: user.to,
            subject: user.subject,
            body: user.body
        });

        mail.send();
    }
}

var okurisaki = {
    email: 'kousuke.tanihata@leverages.jp',
    to: 'test@leverages.jp',
    subject: 'knock knock',
    body: "who is there?"
};

let mail = new Mail();

export default Mail;
