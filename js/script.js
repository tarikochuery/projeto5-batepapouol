let loginStatus;
let messages = [];
const menuContainer = document.querySelector('.menu-container');
const menu = document.querySelector('.menu');
const messagesContainer = document.querySelector('.messages')
const messageInput = document.querySelector('input')
const sendMessageButton = document.querySelector('.send-button')

const openMenu = () => {
  menuContainer.classList.remove('no-show');
  menu.classList.add('slide');
};

const createMessageHTML = (time, from, to, type, text) => {
  let messageHTML;

  if (type === 'status') {
    messageHTML = `<div class="message ${type}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> ${text}</p>
    </div>`;
  } else {
    messageHTML = `<div class="message ${type === 'message' && ''}">
    <p><span class="time">(${time})</span> <span class="name">${from}</span> para <span class="name">${to}</span>: ${text}</p>
    </div>`
  }

  return messageHTML
};

const ScrollToLastMessage = () => {
  const lastMessageElement = document.querySelector('.message:last-child')
  lastMessageElement.scrollIntoView()
}

const printMessages = async () => {
  messages = await getMessages();
  const messagesHTML = messages.map(message => {
    const {from, to, text, type, time} = message
    const messageHTML = createMessageHTML(time, from, to, type, text)
    return messageHTML
  })
  messagesContainer.innerHTML = messagesHTML.join(' ')
  ScrollToLastMessage()
}

const reloadMessages = async () => {
  const newMessages = await getMessages();
  const lastMessage = messages[messages.length - 1]
  const lastNewMessage = newMessages[newMessages.length - 1]
  if(lastMessage.time === lastNewMessage.time) {
    return
  }
  printMessages();
}

login();
const connectionInterval = setInterval(keepConnection, 5000);

printMessages()
const reloadMessageTimer = setInterval(reloadMessages, 3000)




const handleSendClick = async () => {
  const input = messageInput.value
  if (!input) return
  
  const messageStatus = await sendMessage('Todos', input)
  
  if (messageStatus === OK_REQUEST) {
    messageInput.value = ''
    printMessages()
    return
  }
  
  if (messageStatus === BAD_REQUEST) {
    alert('Você foi desconectado')
    window.location.reload()
    return
  }
}

//FIXME: Alterar a estrutura async await para cadeia .then (Perguntar para Isa)
//TODO: Filtrar mensagens para aparecer apenas para todos e para o usuário.