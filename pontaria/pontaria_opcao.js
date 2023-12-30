let sec_armazem = localStorage.getItem('valor_fixo_s')
let dez_armazem = localStorage.getItem('valor_fixo_ds')
let min_armazem = localStorage.getItem('valor_fixo_m')
 
document.getElementById('sec_unidade').value = sec_armazem
document.getElementById('sec_dezena').value = dez_armazem
document.getElementById('min').value = min_armazem
    

function atualizar_valor_s(novo_valor) {
    // Atualizar o valor do input number com o valor inserido
    let sec_unidade = document.getElementById("sec_unidade").value
    novo_valor = sec_unidade
    // Armazenar o novo valor no localStorage
    localStorage.removeItem('valor_fixo_s')
    localStorage.setItem('valor_fixo_s', novo_valor)
    
}
function atualizar_valor_ds(novo_valor) {
    // Atualizar o valor do input number com o valor inserido
    let sec_dezena = document.getElementById("sec_dezena").value
    novo_valor = sec_dezena
    // Armazenar o novo valor no localStorage
    localStorage.removeItem('valor_fixo_ds')
    localStorage.setItem('valor_fixo_ds', novo_valor)
}
function atualizar_valor_m(novo_valor) {
    // Atualizar o valor do input number com o valor inserido
    let min = document.getElementById("min").value
    novo_valor = min
    // Armazenar o novo valor no localStorage
    localStorage.removeItem('valor_fixo_m')
    localStorage.setItem('valor_fixo_m', novo_valor)
}


