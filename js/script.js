const BASE_URL = 'https://mock-api.driven.com.br/api/v6/uol';
let user = '';
const BAD_REQUEST = 400;
const OK_REQUEST = 200;
let messages = [];
let selectedContact;
let isVisible = true
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
    try {
      const res = await axios.post(`${BASE_URL}/participants`, { name: user });
      const status = res.status;
      return status;
    } catch (error) {
      const res = error.response;
      const status = res.status;
      alert('Este nome já está em uso, tente outro nome.');
      return status;
    }


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
    <div class="checkmark" data-test="check">
      <ion-icon name="checkmark"></ion-icon>
    </div>
  `
}

const checkVisibility = (element) => {
  const selectedVisibility = document.querySelector('.visibility-menu .selected')

  selectedVisibility.classList.remove('selected')
  selectedVisibility.querySelector('.checkmark').remove()

  isVisible = !element.classList.contains('private')
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
  const sendToElement = document.querySelector('.to')
  sendToElement.innerHTML = `Enviando para ${selectedContact}`
}

const selectVisibility = (element) => {
  checkVisibility(element)
  const sendToElement = document.querySelector('.visibility')
  const visibility = isVisible ? '' : '(Reservadamente)'
  sendToElement.innerHTML = visibility
}

// Interface Action Funtions END --------------------------------------

// Participant Render Functions ---------------------------------------

const createParticipantHTML = (participant) => {
  const { name } = participant;
  const isSelectedParticipant = name === selectedContact

  if (isSelectedParticipant) {
    const participantHTML = `<li data-test="participant" class="contact selected" onclick="selectParticipant(this)" data-identifier="participant">
    <ion-icon name="person-circle"></ion-icon>
    <p>${name}</p>
    <div class="checkmark">
      <ion-icon name="checkmark"></ion-icon>
    </div>
    </li>`;
    
    return participantHTML
  }
  const participantHTML = `<li data-test="participant" class="contact" onclick="selectParticipant(this)">
    <ion-icon name="person-circle"></ion-icon>
    <p>${name}</p>
  </li>`;

  return participantHTML;
};

const renderParticipants = async () => {
  const participants = await getParticipants();
  const isSelectedPariticpantAll = selectedContact === 'Todos'
  const checkmark = `<div class="checkmark">
  <ion-icon name="checkmark"></ion-icon>
</div>`
  const participantsList = document.querySelector('.contacts');
  const participantsHTML = participants
    .map(participant => createParticipantHTML(participant));

  participantsList.innerHTML = `
  <div data-test="all" class="category Todos" onclick="selectParticipant(this)">
    <ion-icon name="people"></ion-icon>
    <p>Todos</p>
    ${isSelectedPariticpantAll ? checkmark : ''}
  </div>
  ${participantsHTML.join(' ')}
  `;
};

// Participant Render Functions END -----------------------------------

// Messages Render Functions ------------------------------------------

const createMessageHTML = (time, from, to, type, text) => {
  let messageHTML;

  if (type === 'status') {
    messageHTML = `<div data-test="message" class="message ${type}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> ${text}</p>
    </div>`;
  } else {
    messageHTML = `<div data-test="message" class="message ${type === 'message' ? '' : type}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> para <span class="name">${to}</span>: ${text}</p>
    </div>`;
  }

  return messageHTML;
};

const filterMessages = () => {
  return messages.filter(message => {
    const isPrivate = message.type === 'private_message';
    if (isPrivate) {
      const isMessageToOrFromUser = message.to === user || message.to === 'Todos' || message.from === user;
      return isMessageToOrFromUser;
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

// Messages Render Functions END -----------------------------------------------------------

// Handlers Functions ----------------------------------------------------------------------

const handleSendClick = async () => {
  const input = messageInput.value;
  if (!input) return;

  const visibility = isVisible ? 'message' : 'private_message'
  const to = selectedContact || 'Todos'

  const messageStatus = await sendMessage(to, input, visibility);

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

const handleLoginClick = async () => {
  const loginInput = document.querySelector('.login-input')
  if (!loginInput) return

  const loginContainer = document.querySelector('.login')
  const loginForm = document.querySelector('.login-form')
  const loading = document.querySelector('.loading')
  user = loginInput.value
  loginForm.classList.add('hide')
  loading.classList.remove('hide')
  const loginStatus = await login()

  if (loginStatus === BAD_REQUEST) {
    loginForm.classList.remove('hide')
    loginInput.value = ''
    user = ''
    loading.classList.add('hide')
  } else {
    loginContainer.classList.add('hide')
    setInterval(keepConnection, 5000);
  }
}

const handleEnterPush = (event) => {
  const isEnterPushed = event.key === 'Enter'
  isEnterPushed && handleSendClick()
}

// Handlers Functions END ----------------------------------------------------------------------

// CODE START --------------------------------------------------------

printMessages();
renderParticipants();

setInterval(reloadMessages, 3000);
setInterval(renderParticipants, 10000);
menuContainer.addEventListener('click', closeMenu);
window.addEventListener('keydown', handleEnterPush)