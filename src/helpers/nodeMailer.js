const nodemailer = require('nodemailer');
const randomString = require('./randomString');

const nodeMailer = {};

nodeMailer.SendConfirmationEmail = async (mail) => {
	let mailTransporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'shipmatemailconfirmation@gmail.com',
			pass: 'pfpq orky lgnf gbyj',
		},
	});

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

module.exports = nodeMailer;
