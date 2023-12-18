function english(){
    selecao = document.getElementById('selecao').value
    console.log('ta indo')
    if(selecao === 'english'){
        
        document.getElementById('centro').innerHTML = 'This site is where practical and learning <br> the basics about HTMLCSS and JavaScript.<br> Basically the minimum a developer needs <br>Frontend needs to know to consider yourself<br> a programmer.This site is where practical and<br> learning the basics about HTMLCSS and <br> JavaScript. Basically the minimum that a <br> developerFrontend needs to know for you to be <br> considered a programmer.'
        document.getElementById('apresentacao').innerHTML = 'Hello, I am Natan'
        document.getElementById('titulo').innerHTML = 'FRONT-END <br> DEVELOPER'
        document.getElementById('hab').innerHTML = 'SKILLS'
        document.getElementById('con').innerHTML = 'CONTACTS'
        document.getElementById('pro').innerHTML = 'PROJECTS'
        document.getElementById('sob').innerHTML = 'ABOUT'
        document.getElementById('contatinhos').innerHTML='CONTACTS'
    } else {
        document.getElementById('centro').innerHTML = 'Neste site é onde pratico e aprendendo <br> o basico sobre HTML CSS e JavaScript.<br> Basicamente o minimo que um desenvolvedor <br>Frontend precisa saber para se considerar<br> um progamador. Neste site é onde pratico <br>e aprendendo o basico sobre HTML CSS e <br> JavaScript. Basicamente o minimo que um <br> desenvolvedorFrontend precisa saber para <br> se considerar um progamador.'
        document.getElementById('apresentacao').innerHTML = 'Olá, eu sou o Natan'
        document.getElementById('titulo').innerHTML = 'DESENVOLVEDOR <br> FRONT-END'
        document.getElementById('hab').innerHTML = 'HABILIDADE'
        document.getElementById('con').innerHTML = 'CONTATOS'
        document.getElementById('pro').innerHTML = 'PROJETOS'
        document.getElementById('sob').innerHTML = 'SOBRE'
        document.getElementById('contatinhos').innerHTML='CONTATOS'
    }
}

ScrollReveal({reset:true}).reveal('.headline', {duration: 1000});