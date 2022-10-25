let loginStatus;
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


login();
const connectionInterval = setInterval(keepConnection, 5000);

const printMessages = async () => {
  const messages = await getMessages();
  const messagesHTML = messages.map(message => {
    const {from, to, text, type, time} = message
    const messageHTML = createMessageHTML(time, from, to, type, text)
    return messageHTML
  })
  messagesContainer.innerHTML = messagesHTML.join(' ')
}

printMessages()

//TODO: Comparar arrays de mensagem atual novo acesso na API.
//TODO: Filtrar mensagens para aparecer apenas para todos e para o usuário.


const handleSendClick = async () => {
  const input = messageInput.value
  if (!input) return

  const messageStatus = await sendMessage('Todos', input)

  if (messageStatus === 200) {
    messageInput.value = ''
    return
  }

  if (messageStatus === 400) {
    alert('Você foi desconectado')
    window.location.reload()
    return
  }
}