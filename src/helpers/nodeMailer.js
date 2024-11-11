const nodemailer = require('nodemailer');
const randomString = require('./randomString');
const pool = require('../database');

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

nodeMailer.NotifyAllTravelers = async (place_from, place_to, id, user_id) => {
	const people = await pool.query(`select U.mail from (SELECT id, place_from, place_to FROM viajes WHERE place_from = "${place_to}" AND place_to = "${place_from}") VS JOIN (SELECT travel_id, user_id FROM viajando) VO ON VS.id = VO.travel_id JOIN (SELECT id, mail FROM usuario) U ON VO.user_id = U.id WHERE U.id != ${user_id};`);
	const extractedEmails = people.map(row => row.mail); 
	const emails = new Set(extractedEmails);
	
	for (email of emails) {
		let mailDetails = {
			from: 'shipmatemailconfirmation@gmail.com',
			to: email,
			subject: 'Importante! Alguien quiere comprar algo en tu viaje',
			text:
			`Hola! Te comunicamos que alguien esta queriendo comprar un producto en el mismo trayecto de tu viaje.\nEl producto es http://localhost:3000/productoenoferta/${id}`,
		};

		mailTransporter.sendMail(mailDetails, function (err, data) {
			if (err) {
				console.log('Error Occurs' + err);
			} else {
				console.log('Email sent successfully');
				// console.log(mailDetails);
			}
		});
	}
};

nodeMailer.NotifyOwnerOfOffer = async (offer_id) => {
	const oferta = await pool.query(`SELECT id, id_pedido FROM ofertas WHERE id = ${offer_id}`);
	const pedido = await pool.query(`SELECT id, user_id FROM pedidos WHERE id=?`, [oferta[0].id_pedido]);
	const usuario = await pool.query(`SELECT id, mail FROM usuario WHERE id=?`, [pedido[0].user_id]);

	const email = usuario[0].mail;

	let mailDetails = {
		from: 'shipmatemailconfirmation@gmail.com',
		to: email,
		subject: 'Importante!!! Alguien realizó una oferta en tu producto',
		text:
		`Hola! Te comunicamos que alguien esta colocó una oferta en uno de tus productos publicados.\nEl producto es http://localhost:3000/productoenoferta/${offer_id}`,
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