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
    let tela = document.querySelector('tela')
    if (miolo.innerHTML == ''){
        miolo.innerHTML = simbolo
        if (miolo.innerHTML == 'X'){
            simbolo = 'O'
        } else{
            simbolo ='X'
        }
    }
    if (it1.innerHTML === 'X' && it2.innerHTML === 'X' && it3.innerHTML === 'X') {
    barra.style.top = '-60px'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it4.innerHTML === 'X' && it5.innerHTML === 'X' && it6.innerHTML === 'X') {
    barra.style.top = '9vw'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it7.innerHTML === 'X' && it8.innerHTML === 'X' && it9.innerHTML === 'X') {
    barra.style.top = '22vw'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it1.innerHTML === 'X' && it4.innerHTML === 'X' && it7.innerHTML === 'X') {
    barra_vert.style.right = '745px'
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it2.innerHTML === 'X' && it5.innerHTML === 'X' && it8.innerHTML === 'X') {
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it3.innerHTML === 'X' && it6.innerHTML === 'X' && it9.innerHTML === 'X') {
    barra_vert.style.right = '325px'
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it1.innerHTML === 'X' && it5.innerHTML === 'X' && it9.innerHTML === 'X') {
    barra_lat_di.style.zIndex = '1';
    tela.disabled
} else if (it3.innerHTML === 'X' && it5.innerHTML === 'X' && it7.innerHTML === 'X') {
    barra_lat_esq.style.zIndex = '1';
    tela.disabled
} else if (it1.innerHTML === 'O' && it2.innerHTML === 'O' && it3.innerHTML === 'O') {
    barra.style.top = '-60px'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it4.innerHTML === 'O' && it5.innerHTML === 'O' && it6.innerHTML === 'O') {
    barra.style.top = '9vw'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it7.innerHTML === 'O' && it8.innerHTML === 'O' && it9.innerHTML === 'O') {
    barra.style.top = '22vw'
    barra.style.zIndex = '1';
    tela.disabled
} else if (it1.innerHTML === 'O' && it4.innerHTML === 'O' && it7.innerHTML === 'O') {
    barra_vert.style.right = '745px'
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it2.innerHTML === 'O' && it5.innerHTML === 'O' && it8.innerHTML === 'O') {
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it3.innerHTML === 'O' && it6.innerHTML === 'O' && it9.innerHTML === 'O') {
    barra_vert.style.right = '325px'
    barra_vert.style.zIndex = '1';
    tela.disabled
} else if (it1.innerHTML === 'O' && it5.innerHTML === 'O' && it9.innerHTML === 'O') {
    barra_lat_di.style.top = ''
    barra_lat_di.style.zIndex = '1';
    tela.disabled
} else if (it3.innerHTML === 'O' && it5.innerHTML === 'O' && it7.innerHTML === 'O') {
    barra_lat_esq.style.zIndex = '1';
    tela.disabled
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

    barra.style.zIndex = '-1'
    barra_vert.style.zIndex = '-1'
    barra_lat_di.style.zIndex = '-1'
    barra_lat_esq.style.zIndex = '-1'
}




    







