const input = require('prompt-sync')();
const { fork } = require('cluster');
const fs = require('fs');
const { escape } = require('querystring');
const agora = new Date();
const formatoBR = "05/05/2026"

//agora.toLocaleDateString('pt-BR', {
//    timeZone: 'America/Sao_Paulo'
//});

console.log(formatoBR); 
// Saída: 02/05/2026, 18:26:29
console.clear();

const arquivo = 'tarefas.json';
if (fs.existsSync(arquivo) == false){

    fs.writeFileSync(arquivo, JSON.stringify([]));

}

function novoDia(){//reseta o [x] pra []
    const js = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
    let ajuste = js.map(tarefa =>{
        if(tarefa.status == true && tarefa.quantidade[-0] != formatoBR){
            return{...tarefa, status: false}
        }else{
            return tarefa;
        }
    })
    fs.writeFileSync(arquivo, JSON.stringify(ajuste));
    console.clear();


}

function listarTarefas(){

    const conteudoTxt = fs.readFileSync(arquivo, 'utf-8');
    const json = JSON.parse(conteudoTxt);  
    console.log("-----------------------");
    json.forEach((obj) => {
            let status = "";
            if (obj.status == true){
                status = "[X]"
            }else{
                status = "[]"
            }
            console.log(`${obj.id}. ${status} ${obj.tarefa} - ${obj.tempo}: ${" | ".repeat(obj.quantidade.length)}`);
            console.log("")
    });
    

}

function opcaoTarefas(){
    console.log("TAREFAS")
    listarTarefas()
    console.log("-----------------------");
    console.log(" GERENCIADOR DE TAREFAS");
    console.log("-----------------------");
    console.log("Escolha uma opção:");
    console.log("1 - Adicionar tarefa");
    console.log("2 - Excluir tarefas");
    console.log("3 - Editar tarefas");
    console.log("4 - Marcar status tarefa")
    console.log("5 - Sair");
    console.log("-----------------------");


}

function concluirTarefa(){
    const txt = fs.readFileSync(arquivo, 'utf-8');
    const js = JSON.parse(txt);
    const id = Number(input("Numero da tarefa concluida: "));
    
    let arraymarq = js.map(tarefa => {
        if(tarefa.id == id){
            if(tarefa.status == false){

                    return{...tarefa, status: true, quantidade: [...tarefa.quantidade, formatoBR]};
            }else{
                return{...tarefa, status: false, quantidade: tarefa.quantidade.filter(data => data != formatoBR)};
            }
            
        }else{
            return tarefa;
        }
    })

    fs.writeFileSync(arquivo, JSON.stringify(arraymarq));
    console.clear();
        



}


function adicionarTarefa(){
    const conteudoTxt = fs.readFileSync(arquivo, 'utf-8');
    const conteudoJS = JSON.parse(conteudoTxt);
    const tarefa = input("Qual tarefa deseja adicionar a lista? ");
    conteudoJS.push({tarefa: tarefa, status: false, id: (conteudoJS.length == null ? 1 : conteudoJS.length), tempo: formatoBR, quantidade: []});//adicona item no array js
    console.log("Tarefa adicionada com sucesso!")
    const conteudoTxtDnv = JSON.stringify(conteudoJS, null, 2)
    fs.writeFileSync(arquivo, conteudoTxtDnv);
    console.clear()

}

function deletarTarefa(){
    const conteudoTxt = fs.readFileSync(arquivo, 'utf-8');
    const idInformado = Number(input("Qual tarefa deseja retirar da lista? (id): "));
    let tarefas = JSON.parse(conteudoTxt);
    const novaLista = tarefas.filter(tarefa => tarefa.id !== idInformado);

    if (tarefas.length === novaLista.length) {
        console.log("Tarefa não encontrada tente novamente!");
        deletarTarefa();
    }else{
        const conteudoTxtDnv = JSON.stringify(novaLista, null, 2);
        fs.writeFileSync(arquivo, conteudoTxtDnv);
        console.clear()
    }

}

function editarTarefa(){

    const idInformado = Number(input("Qual tarefa deseja editar da lista? (id): "));
    const texto = input("Deseja substituir pelo oque? ");
    const conteudoJS  = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
    let listaAtualizada = conteudoJS.map(task => {
        if (task.id == idInformado){
            return { ...task, tarefa: texto};
        }
        return task;
    })

    fs.writeFileSync(arquivo, JSON.stringify(listaAtualizada, null, 2));
    console.clear();


}

novoDia();
let rodando = true
while (rodando){
    opcaoTarefas();
    const opcao = Number(input("> "));
    switch(opcao){

        case 1:
            adicionarTarefa();
            break;
        case 2:
            deletarTarefa();
            break;
        
        case 3:
            editarTarefa();
            break;

        case 4:
            concluirTarefa();
            break;

        case 5:
            rodando = false;
            break;
    }

}
