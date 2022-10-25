const BASE_URL = 'https://mock-api.driven.com.br/api/v6/uol';
let user = ''; 3;


const getMessages = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/messages`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

const reloadMessages = () => {
  const reloadInterval = setInterval(getMessages, 3000);
  return reloadInterval;
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
  } while (loginStatus === 400);

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
    const postStatus = errorResponse.status;
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