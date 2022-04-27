

    // pegando os elementos principais
    const closeBtn = document.getElementById('closeBtn') // botão de fechar
    const menuToggle = document.getElementById('menu-toggle') // menu mobile
    const menu = document.getElementById('menu') // menu
    const separador = document.querySelector('.separador')
    const lista = document.getElementById('lista') // lista do menu

    // abre o menu mobile lateral
    function openSideMenu(){

        // exibindo o menu
        menu.style.display = 'initial'

        // exibindo o botão de fechar
        closeBtn.style.display = 'initial'

        // ocultando o separador de lista
        separador.style.display = 'none'

        // alterando a classe da lista do menu
        if(lista){lista.className = 'menu-list-toggle'}

        // alterando a classe de cada item da lista(menu desktop)
        const items = document.querySelectorAll('.list-item')
        if(items){
            for(let item of items){item.className = 'list-item-toggle'}
        }

    }

    // fecha o menu mobile lateral
    function closeSideMenu(){

        // ocultando o menu
        menu.removeAttribute('style')
    
        // ocultando o botão de fechar
        closeBtn.removeAttribute('style')

        // mostrando o separador de lista
        separador.style.display = 'initial'

        // alterando a classe da lista do menu
        if(lista){lista.className = 'menu-list'}

        // alterando a classe de cada item da lista(menu mobile)
        const items = document.querySelectorAll('.list-item-toggle')
        if(items){
            for(let item of items) {item.className = 'list-item'}
        }
    }

    // adicionando eventos
    menuToggle.onclick = openSideMenu
    closeBtn.onclick = closeSideMenu

    // fechando menu mobile ao clicar fora do próprio menu
    document.body.onclick = e => {
        
        if(e.target.id != 'menu-toggle'
        && e.target.className != 'menu-list-toggle') closeSideMenu()
    }
