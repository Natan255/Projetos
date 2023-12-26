let contador = 1
let score = -1
let myfrime = document.getElementById('myframe')
let iframeContent = myfrime.contentDocument || myfrime.contentWindow.document;
let min = iframeContent.getElementById('min').value
let sec_unidade = iframeContent.getElementById('sec_unidade').value
let sec_dezena = iframeContent.getElementById('sec_dezena').value





function menu(){
    window.location.href = 'pontaria.html'
}

function fim(){
    let alvos = document.getElementById('alvos')
    let pontuacao = document.getElementById('pontuacao')
    let timer =  document.getElementById('timer')
    let tempo = document.getElementById('tempo')

    
    tempo.style.display = 'none'
    pontuacao.style.display = 'none'
    alvos.style.display = "none"
    timer.style.display = ""
    timer.innerHTML = `<div id="juntin"> Fim! <br> Pontuação: ${score}</div> <button id='menu' onclick='menu()'>Menu</button> `


}


function cronometro(){
    
    let alvos = document.getElementById('alvos')
    let tempo = document.getElementById('tempo')

    if (sec_dezena == 0 && sec_unidade == -1 && min == 0 ){
        sec_dezena = 0
        sec_unidade = 0
        min = 0
        alvos.disabled = true
        fim()
        cronometro= saf
        
        
    }
    
    if (sec_dezena == 0 && sec_unidade == -1){
        min -= 1
        sec_dezena = 5
        sec_unidade = 9
        if (min < 0){
            min += 1
        }
    }
    
    if (sec_unidade == -1){
        sec_unidade = 9
        sec_dezena -= 1
        cronometro()
    }else{
        tempo.innerHTML ='Tempo:    :'
        tempo.innerHTML += `${min}:${sec_dezena}${sec_unidade}`
        sec_unidade -= 1
        setTimeout(cronometro, 1000)
    }
    
}
function ativar(){
    let alvos = document.getElementById('alvos')
    let imagem_mira = document.getElementById('imagem_mira')
    imagem_mira.style.width ="120%"
    imagem_mira.style.height ="110%"
    let sort_top = Math.floor(Math.random() * 85)
    let sort_left = Math.floor(Math.random() * 95)
    alvos.style.top = `${sort_top}vh`
    alvos.style.left = `${sort_left}vw`
    score += 1
    pontuacao.innerHTML = `Pontuação: ${score}`
}

function alvo(){
    let div = "<button id='alvos' onclick='ativar()'><img src='imagens/logo_mira.png' width='0' height='0' id='imagem_mira'></button>"
    document.querySelector("body").insertAdjacentHTML("beforeend", div)
    console.log('foi')
    ativar()
    
}

function tempo(){
    let timer =  document.getElementById('timer')
    let conteiner = document.getElementById('conteiner')
    timer.innerHTML = `${contador}`
    contador += 1
    if (contador <= 4){
        setTimeout(tempo, 1000) 
    }else{
        timer.style.display = 'none'
        conteiner.style.color = 'white'
        alvo()
        cronometro()
        
        
    }
       
}   

tempo()




    


