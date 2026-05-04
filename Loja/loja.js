const input = require('prompt-sync')();
const sql = require('sqlite3').verbose();
const data = new Date().toLocaleDateString('pt-BR');

const db = new sql.Database("Estoque.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco REAL NOT NULL,
            data TEXT
        )
    `);
});

function menu() {
    console.clear();
    console.log(" GERENCIA DE ESTOQUE ");
    console.log("----------------------");
    console.log("1 - Adicionar produto");
    console.log("2 - Remover produto");
    console.log("3 - Alterar produto");
    console.log("4 - Produto vendido");
    console.log("5 - Listar estoque");
    console.log("6 - Apagar todo estoque");
    console.log("100 - Sair");
    console.log("----------------------");
    
    let opcao = Number(input(":> "));
    executarOpcao(opcao);
}

function removerProduto(){
    console.clear()
    console.log("\n--- REMOVER PRODUTO ---");
    const id = Number(input("Selecione o ID do produto que deseja retirar "))
    db.run(`DELETE FROM produtos WHERE id = ?`, [id], function (err) {
        if (err){
            console.log("Erro: " + err.message);
        } else{
            console.log(`\n Removido! ID: ${id}`);
        } 
        
        input("\nPressione Enter para voltar...");
        menu();
    });
    
}

function alterarProduto(){
    console.clear();
    console.log("\n--- ALTERAR PRODUTO ---");
    console.log("1 - Alterar nome");
    console.log("2 - Adicionar estoque");
    console.log("3 - Alterar preço");
    let opcao = Number(input(":> "));
    let id = Number(input("Qual o ID do produto: "));

    let sql, valor;

    switch(opcao) {
        case 1:
            valor = input("Digite o novo nome: ");
            sql = `UPDATE produtos SET nome = ? WHERE id = ?`;
            break;
        case 2:
            valor = Number(input("Quantidade a adicionar: "));
            sql = `UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?`;
            break;
        case 3:
            valor = Number(input("Novo preço: "));
            sql = `UPDATE produtos SET preco = ? WHERE id = ?`;
            break;
        default:
            console.log("Opção inválida!");
            return menu();
    }

    db.run(sql, [valor, id], function(err) {
        if (err) {
            console.log("Erro ao atualizar: " + err.message);
        } else if (this.changes === 0) {
            console.log("Produto não encontrado.");
        } else {
            console.log("Alteração concluída com sucesso!");
        }
        input("\nPressione Enter para voltar...");
        menu();
    });
}

function produtoVendido(){
    console.clear();
    let id = input("Digite o id do produto vendido: ");
    
    db.run(`UPDATE produtos SET quantidade = quantidade - 1 WHERE id = ? AND quantidade > 0`, [id], function(err) {
        if (err) {
            console.log("Erro: " + err.message);
        } else if (this.changes === 0) {
            console.log("Venda não realizada: ID inexistente ou estoque zerado.");
        } else {
            console.log("Venda computada! Quantidade subtraída.");
        }
        input("\nPressione Enter para voltar...");
        menu();
    });
}

function adicionarProduto() {
    console.clear()
    console.log("\n--- NOVO PRODUTO ---");
    const nome = input("Nome: ");
    const qtd = Number(input("Quantidade: "));
    const preco = Number(input("Preço: "));
    
    const query = `INSERT INTO produtos (nome, quantidade, preco, data) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [nome, qtd, preco, data], function (err) {
        if (err){
            console.log("Erro: " + err.message);
        } else{
            console.log(`\n Adicionado! ID: ${this.lastID}`);
        } 
        
        input("\nPressione Enter para voltar...");
        menu();
    });
}

function listarProduto() {
    console.clear();
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            console.error("Erro:", err.message);
        } else {
            console.log("\n=== ESTOQUE ATUAL ===");

            if (rows.length === 0) {
                console.log("Nenhum produto cadastrado.");
            } else {
                rows.forEach((prod) => {
                    console.log(`${prod.id}. ${prod.nome} - Qtd: ${prod.quantidade} - R$ ${prod.preco.toFixed(2)}`);
                });
            }
        }
        console.log("----------------------\n");
        input("Pressione Enter para voltar...");
        menu();
    });
}

function executarOpcao(opcao) {
    switch (opcao) {
        case 1:
            adicionarProduto();
            break;
        case 2:
            removerProduto()
            break;
        case 3:
            alterarProduto();
            break;
        
        case 4:
            produtoVendido()
            break;
        case 5: 
            listarProduto();
            break;
        case 100:
            console.log("Saindo...");
            db.close();
            process.exit();
            break;
        default:
            console.log("Opção inválida!");
            setTimeout(menu, 1000);
            break;
    }
}

menu();