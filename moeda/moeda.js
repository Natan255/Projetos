let link_real = 'https://v6.exchangerate-api.com/v6/105734da53f65dfc96dc79c4/latest/USD'
let link_cripto = 'https://api.coincap.io/v2/assets'
let linha;
let conta;
let numero;
let buscar = document.getElementById('busca')

buscar.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Evita o comportamento padrão de enviar formulários
    enter(linha);
  }
});


function calcularConta(linha, conj, moedaSelecionada) {
  numero = document.getElementById('numero').value
  for (const n in linha) {
    let g = Math.pow(10, 3)
    let contaItem = linha[n].priceUsd * (conj[moedaSelecionada] * numero);
    contaItem = Number(contaItem)
    linha[n].conta = contaItem; // Armazenar a conta no objeto correspondente em linha
    let texto = document.getElementById(`div${n}`)
    texto.textContent = ''
    texto.innerHTML += `${linha[n].name} &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp $${(Math.round(linha[n].priceUsd * g)/g).toLocaleString()}&nbsp&nbsp&nbsp&nbsp&nbsp...............................................................................................&nbsp&nbsp&nbsp&nbsp&nbsp${(Math.round(contaItem*g) /g).toLocaleString()}`
  }
}

function enter(linha) {
  let busca = document.getElementById('busca').value
  const selecionar = document.querySelector('header').querySelectorAll('.gaveta')
  selecionar.forEach(div => div.remove());

  for (const n in linha){
    let nome = linha[n].name
    nome = nome.toUpperCase()
    busca = busca.toUpperCase()
    if(nome.startsWith(busca)){
      let h = Math.pow(10, 3);
      console.log(`Nome encontrado: ${linha[n].name}`);
      let div_nova = `<div class="gaveta" id="div${n}" > <p>${linha[n].name} &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp    $${(Math.round(linha[n].priceUsd * h)/h).toLocaleString()}&nbsp&nbsp&nbsp&nbsp&nbsp...............................................................................................&nbsp&nbsp&nbsp&nbsp&nbsp${(Math.round(linha[n].conta*h) /h).toLocaleString()}`
      document.querySelector('header').insertAdjacentHTML('beforeend', div_nova)
      
      
    }
  }
}


fetch(link_cripto)
  .then((res) => res.json())
  .then((dados) =>{
    linha = dados.data
    for ( const i in linha){
        let f = Math.pow(10, 3)
        let div = `<div class="gaveta" id="div${i}" > <p>${linha[i].name} &nbsp&nbsp&nbsp&nbsp-&nbsp&nbsp&nbsp    $${(Math.round(linha[i].priceUsd * f)/f).toLocaleString()}</p></div>`
        document.querySelector('header').insertAdjacentHTML('beforeend', div)

    }
    fetch(link_rea)
    .then((res) => res.json())
    .then((data) => {

      const conj = data.conversion_rates;
        
      const lista = document.getElementById('lista')
      const num = document.getElementById('numero')
      

      for (const posicao in conj) {
        const opcao = document.createElement('option')
        opcao.text = `${posicao} `
        opcao.value = `${posicao}`
        lista.add(opcao);
      
    }

    // Chama a função inicialmente
    calcularConta(linha, conj, lista.value);

    // Adiciona um ouvinte de evento para a mudança na lista
    lista.addEventListener('change', () => {
      // Chama a função sempre que houver uma mudança
      calcularConta(linha, conj, lista.value);

    })
     
    num.addEventListener('input', () => {
        // Chama a função sempre que houver uma mudança
        calcularConta(linha, conj, lista.value)
  
      })
  

        
  })})
  



