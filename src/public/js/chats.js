import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
//import { route } from '../../routes';

const socket = io();
const messageForm = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages-container');
// const chatForm = document.getElementById('chat-form');
// const chatInput = document.getElementById('chat-input');
const users = document.getElementById('users-container');
const header = document.querySelectorAll('.chats-chat-messages-header');
const url = window.location.href;
const urlSinQuery = url.split('?')[0];

// Obtener la parte de la URL después del último "/"
const numeroConQuery = urlSinQuery.substring(urlSinQuery.lastIndexOf('/') + 1);

// Eliminar cualquier carácter que no sea un número del número con query
const numero = numeroConQuery.replace(/\D/g, '');
const id = numero;
var chatId = -1;

LoadChats();

socket.on('chat message', (msg, user, chat, username) => {
	if (chatId == chat) {
		let item = 1;
		if (user == id) {
			item = ` <div class='bubble me'>
						${msg}
					</div>`;
		} else {
			item = ` <div class='bubble you'>
						${msg}
					</div>`;
		}
		messages.insertAdjacentHTML('beforeend', item);
	}
});

/*
	let item = 1;
	if (sender == receiver) {
		return;
	} else if (sender == id) {
		// item = `
		// 			<li>
		// 				<button class="chats" id="${chat}"> chat name: ${chatName[0].name} </button>
		// 			</li>`;

		item = `
            <div class='chats-contact'>
            <div>
                <img src='/img/default-profile.jpg' alt='profile-picture-another-user' />
                <h1>Whitus</h1>
            </div>
            <hr />
        </div>`;
	} else if (receiver == id) {
		item = `
					<li class = 'req'>
						<button class="chats" id="${chat}"> chat name: ${chatName[0].name} </button>
					</li>`;
	}
	users.insertAdjacentHTML('beforeend', item);
	ListenBtns();
});*/

socket.on('load chat', (ans, chat, users) => {
	if (chat == chatId) {
		LoadMessages(chat, ans, users);
	}
});

socket.on('load chats', (ans, userId, names, userInfo) => {
	if (id == userId) {
		if (ans && names) {
			var name = 1;
			for (let i = 0; i < ans.length; i++) {
				for (let j = 0; j < names.length; j++) {
					if (names[j].id == ans[i].chat_id) {
						name = names[j].name;
					}
				}
				let item = `
                    <div class='chats-contact chat-selector' id="${ans[i].chat_id}">
                        <div>
                            <img src='/img/${userInfo[0].profile_image_route} ' alt='profile-picture-another-user' />
                            <h1>${name}</h1>
                        </div>
                        <hr />
                    </div>`;
				users.insertAdjacentHTML('beforeend', item);
			}
		}
	}
	ListenBtns();
});

messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	if (input.value && chatId != -1) {
		socket.emit('chat message', input.value, id, chatId);
	}
	input.value = '';
});

/*chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	if (chatInput.value) {
		socket.emit('create chat', id, chatInput.value, -1);
	}
	chatInput.value = '';
});*/

function ListenBtns() {
	document.querySelectorAll('.chat-selector').forEach((boton) => {
		boton.addEventListener('click', function (event) {
			document.querySelectorAll('.chat-selector').forEach((b) => {
				b.classList.remove('chat-selected');
			});
			boton.classList.add('chat-selected');

			var id = this.id;
			chatId = id;
			//console.log('actual chat is: ' + chatId);
			socket.emit('load chat', 1, chatId);
		});
	});
}

var lastCharged = -1;
function LoadMessages(chat, ans, users) {
	var item = 1;
	if (lastCharged != chat) {
		const route =
			users.sender.id == id
				? users.receiver.profileImageRoute
				: users.sender.profileImageRoute;
		const username =
			users.sender.id == id ? users.receiver.username : users.sender.username;
		// console.log(route + username);
		header[0].innerHTML = `
			<div>
				<div>
					<img src='/img/${route}' alt='' />
					<h1>${username}</h1>
				</div>
				<img class="gear" src='/img/gear-solid.svg' />
			</div>
		`;
		messages.innerHTML = '';
		//console.log(lastCharged, chat);
		for (let i = 0; i < ans.length; i++) {
			if (ans[i].sender == id) {
				item = `
                    <div class='bubble me'>
                        ${ans[i].content}
                    </div>`;
			} else {
				item = `
                    <div class='bubble you'>
                        ${ans[i].content}
                    </div>`;
			}
			messages.insertAdjacentHTML('beforeend', item);
		}
	}
	lastCharged = chat;
}

function LoadChats() {
	socket.emit('load chats', 1, id);
}
