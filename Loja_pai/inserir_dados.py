import sqlite3

conexao = sqlite3.connect("loja_pai.db")
cursor = conexao.cursor()

clientes = [
    ('João Silva', '11111111111', '1199999-1111'),
    ('Maria Souza', '22222222222', '1199999-2222'),
    ('Padaria Pão Quente', '33333333333', '1199999-3333'),
    ('Mercado do Zé', '44444444444', '1199999-4444'),
    ('Ana Beatriz', '55555555555', '1199999-5555')
]

cursor.executemany("""
INSERT INTO Cliente (nome, cpf, telefone) 
VALUES (?, ?, ?)
""", clientes)

funcionarios = [
    ('Wellington (Pai)', 'Chefe', 3500.50, 0),
    ('Carlos', 'Ajudante', 1800.00, 0),
    ('Rodrigo', 'Técnico', 2500.00, 0)
]

cursor.executemany("""
INSERT INTO Funcionario (nome, cargo, salario, atendimentos) 
VALUES (?, ?, ?, ?)
""", funcionarios)

materiais = [
    ('Cobre', 32, 23.24),
    ('Fio', 25, 10.30),
    ('Gás R410', 10, 150.00),
    ('Capacitor', 20, 15.00),
    ('Suporte de Parede', 15, 40.00)
]

cursor.executemany("""
INSERT INTO Material (nome, estoque, custo)
VALUES (?, ?, ?)
""", materiais)

servicos = [
    (1, 1, 'Geladeira', 'Manutencao', 250.00, 'Rua Juvenal, 50', '08:00', 'Fazendo barulho', 'entregue', 1),
    (2, 2, 'Ar Split', 'Instalacao', 400.00, 'Rua A, 123', '10:00', 'Instalado com sucesso', 'finalizado', 1),
    (3, 1, 'Forno', 'Conserto', 120.00, 'Padaria Pão Quente', '14:30', 'Não acende', 'entregue', 1),
    (4, 3, 'Ar Split', 'Manutencao', 300.00, 'Mercado do Zé', '09:00', 'Limpeza feita', 'finalizado', 1),
    (5, 2, 'Micro-ondas', 'Conserto', 150.00, 'Rua C, 789', '16:00', 'Não esquenta', 'pendente', 0),
    (1, 3, 'Máquina de Lavar', 'Conserto', 350.00, 'Rua Juvenal, 50', '11:00', 'Vazando água', 'entregue', 1),
    (3, 1, 'Cafeteira', 'Conserto', 80.00, 'Padaria Pão Quente', '08:30', 'Queimou a resistência', 'entregue', 1),
    (2, 2, 'Geladeira', 'Instalacao', 500.00, 'Rua A, 123', '13:00', 'Geladeira nova', 'finalizado', 1),
    (4, 3, 'Ar Split', 'Instalacao', 600.00, 'Mercado do Zé', '15:00', 'Instalação de 2 splits', 'pendente', 0),
    (5, 1, 'Forno', 'Visita', 50.00, 'Rua C, 789', '09:30', 'Apenas orçamento', 'finalizado', 1)
]

cursor.executemany("""
INSERT INTO Servico (id_cliente, id_funcionario, aparelho, servico, valor, endereco, hora, observacao, status, pago)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", servicos)

servicos_materiais = [
    (1, 1, 2),
    (2, 1, 5),
    (2, 2, 2),
    (2, 5, 1),
    (3, 4, 1),
    (4, 3, 1),
    (6, 1, 3),
    (8, 1, 4),
    (8, 2, 1),
    (9, 1, 6),
    (9, 5, 2)
]

cursor.executemany("""
INSERT INTO ServicosMaterial (id_servico, id_material, usado)
VALUES (?, ?, ?)
""", servicos_materiais)

conexao.commit()
conexao.close()
print("Dados inseridos com sucesso!")