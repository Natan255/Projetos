var simbolo = 'X'
const it1 = document.getElementById('it1')
const it2 = document.getElementById('it2')
const it3 = document.getElementById('it3')
const it4 = document.getElementById('it4')
const it5 = document.getElementById('it5')
const it6 = document.getElementById('it6')
const it7 = document.getElementById('it7')
const it8 = document.getElementById('it8')
const it9 = document.getElementById('it9')
const todo = document.getElementsByClassName('conteiner')
let barra = document.getElementById('barra')
let barra_vert = document.getElementById('barra_vert')
let barra_lat_esq = document.getElementById('barra_lat_esq')
let barra_lat_di = document.getElementById('barra_lat_di')





function escolha(miolo){
    if (miolo.innerHTML == ''){
        miolo.innerHTML = simbolo
        if (miolo.innerHTML == 'X'){
            simbolo = 'O'
        } else{
            simbolo ='X'
        }
    }
    if (it1.innerHTML === 'X' && it2.innerHTML === 'X' && it3.innerHTML === 'X') {
    it1.style.backgroundColor = 'yellow'
    it2.style.backgroundColor = 'yellow'
    it3.style.backgroundColor = 'yellow'
    bloquear()
} else if (it4.innerHTML === 'X' && it5.innerHTML === 'X' && it6.innerHTML === 'X') {
    it4.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it6.style.backgroundColor = 'yellow'
    bloquear()
} else if (it7.innerHTML === 'X' && it8.innerHTML === 'X' && it9.innerHTML === 'X') {
    it7.style.backgroundColor = 'yellow'
    it8.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it1.innerHTML === 'X' && it4.innerHTML === 'X' && it7.innerHTML === 'X') {
    it1.style.backgroundColor = 'yellow'
    it4.style.backgroundColor = 'yellow'
    it7.style.backgroundColor = 'yellow'
    bloquear()
} else if (it2.innerHTML === 'X' && it5.innerHTML === 'X' && it8.innerHTML === 'X') {
    it2.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it8.style.backgroundColor = 'yellow'
    bloquear()
} else if (it3.innerHTML === 'X' && it6.innerHTML === 'X' && it9.innerHTML === 'X') {
    it3.style.backgroundColor = 'yellow'
    it6.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it1.innerHTML === 'X' && it5.innerHTML === 'X' && it9.innerHTML === 'X') {
    it1.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it3.innerHTML === 'X' && it5.innerHTML === 'X' && it7.innerHTML === 'X') {
    it3.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it7.style.backgroundColor = 'yellow'
    bloquear()
} else if (it1.innerHTML === 'O' && it2.innerHTML === 'O' && it3.innerHTML === 'O') {
    it1.style.backgroundColor = 'yellow'
    it2.style.backgroundColor = 'yellow'
    it3.style.backgroundColor = 'yellow'
    bloquear()
} else if (it4.innerHTML === 'O' && it5.innerHTML === 'O' && it6.innerHTML === 'O') {
    it4.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it6.style.backgroundColor = 'yellow'
    bloquear()
} else if (it7.innerHTML === 'O' && it8.innerHTML === 'O' && it9.innerHTML === 'O') {
    it7.style.backgroundColor = 'yellow'
    it8.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it1.innerHTML === 'O' && it4.innerHTML === 'O' && it7.innerHTML === 'O') {
    it1.style.backgroundColor = 'yellow'
    it4.style.backgroundColor = 'yellow'
    it7.style.backgroundColor = 'yellow'
    bloquear()
} else if (it2.innerHTML === 'O' && it5.innerHTML === 'O' && it8.innerHTML === 'O') {
    it2.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it8.style.backgroundColor = 'yellow'
    bloquear()
} else if (it3.innerHTML === 'O' && it6.innerHTML === 'O' && it9.innerHTML === 'O') {
    it3.style.backgroundColor = 'yellow'
    it6.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it1.innerHTML === 'O' && it5.innerHTML === 'O' && it9.innerHTML === 'O') {
    it1.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it9.style.backgroundColor = 'yellow'
    bloquear()
} else if (it3.innerHTML === 'O' && it5.innerHTML === 'O' && it7.innerHTML === 'O') {
    it3.style.backgroundColor = 'yellow'
    it5.style.backgroundColor = 'yellow'
    it7.style.backgroundColor = 'yellow'
    bloquear()
     
}
}



function reiniciar(){
    it1.innerHTML = ''
    it2.innerHTML = ''
    it3.innerHTML = ''
    it4.innerHTML = ''
    it5.innerHTML = ''
    it6.innerHTML = ''
    it7.innerHTML = ''
    it8.innerHTML = ''
    it9.innerHTML = ''
    it1.style.backgroundColor = 'white'
    it2.style.backgroundColor = 'white'
    it3.style.backgroundColor = 'white'
    it4.style.backgroundColor = 'white'
    it5.style.backgroundColor = 'white'
    it6.style.backgroundColor = 'white'
    it7.style.backgroundColor = 'white'
    it8.style.backgroundColor = 'white'
    it9.style.backgroundColor = 'white'
    ativar()

}

function ativar(){
    let a = 9
    while (a != 0) {
        botao = document.getElementById(`it${a}`)
        botao.removeAttribute('disabled')
        a -= 1
    }
}

function bloquear(){
    let i = 9
    while (i != 0) {
        botao = document.getElementById(`it${i}`)
        botao.disabled = true
        i -= 1
    }
}



    







