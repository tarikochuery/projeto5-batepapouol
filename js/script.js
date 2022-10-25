const menuContainer = document.querySelector('.menu-container')
const menu = document.querySelector('.menu')

const openMenu = () => {
  menuContainer.classList.remove('no-show')
  menu.classList.add('slide')
}