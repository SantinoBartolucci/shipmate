const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash'); //Mensajes FLash
const { createServer } = require('node:http');
const { Server } = require('socket.io');

//Initializations
const app = express();
const PORT = 3000;

require('./database');
require('./config/passport');

//Settings
app.set('port', process.env.PORT || PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine(
	'.hbs',
	engine({
		defaultLayout: 'main',
		layoutsDir: path.join(app.get('views'), 'layouts'),
		partialsDir: path.join(app.get('views'), 'partials'),
		extname: '.hbs',
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
		helpers: {
			ifeq: function (arg1, arg2, options) {
				arg1 = parseFloat(arg1);
				arg2 = parseFloat(arg2);

				return arg1 == arg2 ? options.fn(this) : options.inverse(this);
			},
		},
	})
);
app.set('view engine', '.hbs');

//Middlewars
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
	session({
		secret: 'mySecretApp',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global Variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg'); //Success Message
	res.locals.error_msg = req.flash('error_msg'); //Error message
	res.locals.user = req.user || null;
	next();
});

const server = createServer(app);
const io = new Server(server);
const pool = require('./database');
const { profile } = require('console');
const { connect } = require('http2');

io.on('connection', (socket) => {
	console.log('user connected');
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('chat message', async (msg, user, chatId) => {
		const ans = await pool.query(
			'insert into messages (chat_id, content, sender) values (?,?,?)',
			[chatId, msg, user]
		);
		const username = await pool.query('select name from usuario where id = ?', [
			user,
		]);
		io.emit('chat message', msg, user, chatId, username);
	});
	socket.on('create chat', async (sender, receiver, chatId) => {
		const ans = await pool.query('insert into chats (name) values (?)', [
			sender,
		]);
		let chat = ans.insertId;
		if (ans) {
			let res = await pool.query(
				'INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)',
				[chat, sender]
			);
			await pool.query(
				'INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)',
				[chat, receiver]
			);
			const chatName = await pool.query('SELECT name FROM chats WHERE id = ?', [
				chat,
			]);
			if (res) io.emit('create chat', sender, receiver, chat, chatName);
			else console.log(-1);
		} else return;
	});
	socket.on('load chat', async (req, chatId) => {
		console.log(chatId);
		const ans = await pool.query(
			'SELECT content, sender FROM messages WHERE chat_id = ?',
			[chatId]
		);
		const user = await pool.query(
			'SELECT id, user_id FROM chat_members WHERE chat_id = ?',
			[chatId]
		);
		var users = {
			sender: {
				username: '',
				id: '',
				profileImageRoute: '',
			},
			receiver: {
				username: '',
				id: '',
				profileImageRoute: '',
			},
		};
		var a;
		for (let i = 0; i < user.length; i++) {
			console.log(i);
			if (i == 0) {
				let res = await pool.query(
					'SELECT name, profile_image_route FROM usuario WHERE id = ?',
					[user[i].user_id]
				);
				//console.log(res);
				users.sender.username = res[0].name;
				users.sender.id = user[i].user_id;
				users.sender.profileImageRoute = res[0].profile_image_route;
				a = user[i].user_id;
			} else if (user[i].user_id != a) {
				let res = await pool.query(
					'SELECT name, profile_image_route FROM usuario WHERE id = ?',
					[user[i].user_id]
				);
				users.receiver.username = res[0].name;
				users.receiver.id = user[i].user_id;
				users.receiver.profileImageRoute = res[0].profile_image_route;
				i = user.length;
			}
		}
		//console.log(users);
		if (ans) {
			io.emit('load chat', ans, chatId, users);
		} else return;
	});
	socket.on('load chats', async (req, userId) => {
		const ans = await pool.query(
			'SELECT chat_id FROM chat_members WHERE user_id = ?',
			[userId]
		);
		const names = await pool.query('SELECT name, id FROM chats ');
		io.emit('load chats', ans, userId, names);
	});
});

//Routes
app.use(require('./routes/index'));
app.use(require('./routes/login'));
app.use(require('./routes/profile'));
app.use(require('./routes/chats'));
app.use(require('./routes/viajes'));
app.use(require('./routes/compras'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Server Initialization
// app.listen(app.get('port'), () => {
// 	console.log(`Server on port ${app.get('port')} on http://localhost:${app.get('port')}`);
// });

server.listen(app.get('port'), () => {
	console.log(
		`Server on port ${app.get('port')} on http://localhost:${app.get('port')}`
	);
});
