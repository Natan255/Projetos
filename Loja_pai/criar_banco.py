import sqlite3

conexao = sqlite3.connect("loja_pai.db")
cursor = conexao.cursor()

#faz um comando sql por vez, executescript
cursor.execute(""" 
CREATE TABLE IF NOT EXISTS Cliente(

    id_cliente INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL,
    telefone TEXT NOT NULL

)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS Funcionario(

    id_funcionario INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    salario INTEGER NOT NULL,
    atendimentos INTEGER NOT NULL

)
""")

cursor.execute("""

CREATE TABLE IF NOT EXISTS Servico(

    id_servico INTEGER PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_funcionario INTEGER NOT NULL,
    aparelho TEXT NOT NULL,
    servico TEXT NOT NULL,
    valor REAL NOT NULL,
    endereco TEXT NOT NULL,
    hora TEXT NOT NULL,
    observacao TEXT NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'finalizado', 'entregue')),
    pago INTEGER CHECK (pago IN (0, 1)),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario)

)

""")

cursor.execute("""

CREATE TABLE IF NOT EXISTS Material(

    id_material INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    estoque INTEGER NOT NULL,
    custo REAL NOT NULL

)
""")

cursor.execute("""

CREATE TABLE IF NOT EXISTS ServicosMaterial(

    id_servico INTEGER NOT NULL,
    id_material INTEGER NOT NULL,
    usado INTEGER NOT NULL,
    FOREIGN KEY (id_servico) REFERENCES Servico(id_servico),
    FOREIGN KEY (id_material) REFERENCES Material(id_material)
    PRIMARY KEY (id_servico, id_material)
)
""")


conexao.commit()
conexao.close()
print("SQLite está funcionando perfeitamente!")