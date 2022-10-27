const BASE_URL = 'https://mock-api.driven.com.br/api/v6/uol';
let user = ''; 3;
const BAD_REQUEST = 400;
const OK_REQUEST = 200;
let loginStatus;
let messages = [];
let selectedContact;
const menuContainer = document.querySelector('.menu-container');
const menu = document.querySelector('.menu');
const messagesContainer = document.querySelector('.messages');
const messageInput = document.querySelector('input');
const sendMessageButton = document.querySelector('.send-button');


const getMessages = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/messages`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// API Functions ----------------------------------------------------

const getParticipants = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/participants`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

const login = async () => {
  let loginStatus;
  do {
    user = prompt('Qual seu lindo nome?');
    try {
      const res = await axios.post(`${BASE_URL}/participants`, { name: user });
      const status = res.status;
      loginStatus = status;
    } catch (error) {
      const res = error.response;
      const status = res.status;
      alert('Este nome já está em uso, tente outro nome.');
      loginStatus = status;
    }
  } while (loginStatus === BAD_REQUEST);

};

const keepConnection = async () => {
  const body = {
    name: user
  };

  try {
    const res = await axios.post(`${BASE_URL}/status`, body);
    const postStatus = res.status;
    return postStatus;
  } catch (error) {
    const errorResponse = error.response;
    const postStatus = errorResponse?.status;
    return postStatus;
  }
};

const sendMessage = async (to, text, type = 'message') => {
  const body = {
    from: user,
    to,
    text,
    type
  };

  try {
    const res = await axios.post(`${BASE_URL}/messages`, body);
    const postStatus = res.status;
    return postStatus;
  } catch (error) {
    const errorResponse = error.response;
    const postStatus = errorResponse.status;
    return postStatus;
  }
};

// API Functions END --------------------------------------------------

const checkParticipant = (element) => {
  const selectedElement = document.querySelector('.contacts .selected')

  if (selectedElement !== null) {
    selectedElement.classList.remove('selected')
    selectedElement.querySelector('.checkmark').remove()
  }

  selectedContact = element.lastElementChild.innerHTML
  element.classList.add('selected')
  element.innerHTML += `
    <div class="checkmark">
      <ion-icon name="checkmark"></ion-icon>
    </div>
  `
}

// Interface Action Functions -----------------------------------------
const openMenu = () => {
  menuContainer.classList.remove('no-show');
  menu.classList.add('slide');
};

const closeMenu = (event) => {
  const isOutside = !event.target.closest('nav.slide')
  if (isOutside) {
    menuContainer.classList.add('no-show');
    menu.classList.remove('slide');
  }
};

const selectParticipant = (element) => {
  checkParticipant(element)
  const sendToElement = document.querySelector('.message-status')
  sendToElement.innerHTML = `Enviando para ${selectedContact}`
}

// Interface Action Funtions END --------------------------------------

// Participant Render Functions ---------------------------------------

const createParticipantHTML = (participant) => {
  const { name } = participant;
  const isSelectedParticipant = name === selectedContact

  if (isSelectedParticipant) {
    const participantHTML = `<li class="contact selected" onclick="selectParticipant(this)">
    <ion-icon name="person-circle"></ion-icon>
    <p>${name}</p>
    <div class="checkmark">
      <ion-icon name="checkmark"></ion-icon>
    </div>
    </li>`;
    
    return participantHTML
  }
  const participantHTML = `<li class="contact" onclick="selectParticipant(this)">
    <ion-icon name="person-circle"></ion-icon>
    <p>${name}</p>
  </li>`;

  return participantHTML;
};

const renderParticipants = async () => {
  const participants = await getParticipants();
  const participantsList = document.querySelector('.contacts');
  const participantsHTML = participants
    .map(participant => createParticipantHTML(participant));

  participantsList.innerHTML = `
  <div class="category Todos">
    <ion-icon name="people"></ion-icon>
    <p>Todos</p>
  </div>
  ${participantsHTML.join(' ')}
  `;
};

// Participant Render Functions END -----------------------------------

// Messages Render Functions ------------------------------------------

const createMessageHTML = (time, from, to, type, text) => {
  let messageHTML;

  if (type === 'status') {
    messageHTML = `<div class="message ${type}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> ${text}</p>
    </div>`;
  } else {
    messageHTML = `<div class="message ${type === 'message' ? '' : type}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> para <span class="name">${to}</span>: ${text}</p>
    </div>`;
  }

  return messageHTML;
};

const filterMessages = () => {
  return messages.filter(message => {
    const isPrivate = message.type === 'private_message';
    if (isPrivate) {
      const messageToUser = message.to === user || message.to === 'Todos';
      return messageToUser;
    }
    return true;
  });
};

const ScrollToLastMessage = () => {
  const lastMessageElement = document.querySelector('.message:last-child');
  lastMessageElement.scrollIntoView();
};

const printMessages = async () => {
  messages = await getMessages();
  const filteredMessages = filterMessages();
  const messagesHTML = filteredMessages.map(message => {
    const { from, to, text, type, time } = message;
    const messageHTML = createMessageHTML(time, from, to, type, text);
    return messageHTML;
  });
  messagesContainer.innerHTML = messagesHTML.join(' ');
  ScrollToLastMessage();
};

const reloadMessages = async () => {
  const newMessages = await getMessages();
  const lastMessage = messages[messages.length - 1];
  const lastNewMessage = newMessages[newMessages.length - 1];
  if (lastMessage.time === lastNewMessage.time) {
    return;
  }
  printMessages();
};

// Messages Render Functions END ---------------------------------------

const handleSendClick = async () => {
  const input = messageInput.value;
  if (!input) return;

  const to = selectedContact || 'Todos'

  const messageStatus = await sendMessage(to, input);

  if (messageStatus === OK_REQUEST) {
    messageInput.value = '';
    printMessages();
    return;
  }

  if (messageStatus === BAD_REQUEST) {
    alert('Você foi desconectado');
    window.location.reload();
    return;
  }
};

// CODE START --------------------------------------------------------

printMessages();
login();
renderParticipants();
const connectionInterval = setInterval(keepConnection, 5000);

const reloadMessageTimer = setInterval(reloadMessages, 3000);
const reloadParticipantsTimer = setInterval(renderParticipants, 10000);
menuContainer.addEventListener('click', closeMenu);

//TODO: Criar check para tipo de mensagem
//TODO: Configurar envio de mensagem privada
//FIXME: Acertar toggle do menu lateral