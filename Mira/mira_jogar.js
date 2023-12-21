let contador = 1
let min = 0
let sec_unidade = 0
let sec_dezena = 0

function cronometro(){
    
    let tempo = document.getElementById('tempo')

    if (sec_dezena == 6){
        min += 1
        sec_dezena = 0
    }
    
    if (sec_unidade == 10){
        sec_unidade = 0
        sec_dezena += 1
        cronometro()
    }else{
        tempo.innerHTML ='Tempo:    :'
        tempo.innerHTML += ` 0${min}:${sec_dezena}${sec_unidade}`
        sec_unidade += 1
        setTimeout(cronometro, 1000)

    }
}

function tempo(){
    let timer =  document.getElementById('timer')
    let conteiner = document.getElementById('conteiner')
    timer.innerHTML = `${contador}`
    contador +=1
    if (contador <= 4){
        setTimeout(tempo, 1000) 
    }else{
        timer.style.display = 'none'
        conteiner.style.color = 'white'
        cronometro()
    }
       
}   



tempo()




    


