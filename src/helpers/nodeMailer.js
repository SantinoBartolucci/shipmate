const nodemailer = require('nodemailer');
const randomString = require('./randomString');

const nodeMailer = {};

let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'shipmatemailconfirmation@gmail.com',
		pass: 'pfpq orky lgnf gbyj',
	},
});

nodeMailer.SendConfirmationEmail = async (mail) => {
	let confirmationCode = randomString.GenerateRandomString(5);

	let mailDetails = {
		from: 'shipmatemailconfirmation@gmail.com',
		to: mail,
		subject: 'Porfavor, verifique su dirección de correo electrónico',
		text:
			'Hola! Vemos que estas intentando crear una nueva cuenta en nuestra plataforma SHIPMATE.\nPara completar el proceso te pedimos porfavor que ingreses el siguiente codigo de verificación en el formulario presentado.\nCódigo de Verificación:  ' +
			confirmationCode +
			'\n\nSi tu no has intentado crear una cuenta con este gmail te pedimos que ignores este mensaje.\n\nSHIPMATE',
	};

	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurs' + err);
		} else {
			console.log('Email sent successfully');
		}
	});

	return confirmationCode;
};

nodeMailer.SendPasswordRecoveryMail = async (mail, link) => {
	const output = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            .button {
                color: white;
                text-decoration: none;
                background-color: #3b8ff3;
                padding: 10px;
                border-radius: 20px;
            }
        </style>
    </head>
    <body>
        <p>Hola! Vemos que estás intentando recuperar tu contraseña de SHIPMATE.</p>
        <p>Haz click en el siguiente enlace para acceder a la página:</p>
        <a href="${link}" target="_blank" class="button">Recuperar Contraseña</a>
        <p>Si tú no eres el dueño de esta cuenta y no has intentado cambiar la contraseña, por favor ignora este mensaje.</p>
        <p>SHIPMATE</p>
    </body>
    </html>`;

	let mailDetails = {
		from: 'shipmatemailconfirmation@gmail.com',
		to: mail,
		subject: 'Email de recuperación de contraseña',
		html: output,
	};

	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurs' + err);
		} else {
			console.log('Email sent successfully');
		}
	});
};

module.exports = nodeMailer;
