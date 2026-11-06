-- Carga de Dados

-- Clientes
INSERT INTO Cliente (nome, cpf, endereco) VALUES
('João Silva', '69661916047', 'Rua das Flores, 123'),
('Maria Oliveira', '53958952054', 'Av. Central, 456'),
('Carlos Souza', '01480779008', 'Rua B, 789'),
('Caio Henrique', '02762568757', 'Ipe Amarelo, 52'),
('Martin Silva', '89301835738', 'Av. Cabos, 78'),
('Robert C. Martin', '48008725702', 'Rua dos caboclos 333'),
('Vlad Khononov', '78628749780', 'Praça dos domínios');

-- Funcionarios
INSERT INTO Funcionario (nome_funcionario, salario) VALUES
('Ana Costa', 2500.00),
('Bruno Santos', 2800.00),
('Carlos Eduardo', 3200.00),
('Daniela Rocha', 3500.00);

-- atendentes
INSERT INTO Atendente (id_funcionario, gorjeta_acumulada, pedidos_atendidos, tipo) VALUES
(1, 150.00, 25, FALSE),
(2, 300.50, 40, TRUE);

-- pizaiolos
INSERT INTO Pizzaiolo (id_funcionario, numero_acidentes, pizzas_feitas) VALUES
(3, 0, 120),
(4, 1, 200);

-- Pedidos
INSERT INTO Pedido (id_cliente, id_pizzaiolo, id_atendente, valor_pedido, forma_de_pagamento, delivery, status, observacoes, data) VALUES
(7, 3, 1, 85.00, 'Cartão de Crédito', FALSE, 'pendente', 'Sem cebola', '2026-10-01'),
(7, 4, 2, 45.00, 'Pix', TRUE, 'finalizado', 'Entregar no portão', '2026-10-02'),
(6, 3, 2, 110.00, 'Dinheiro', TRUE, 'cancelado', 'Borda caprichada', '2026-10-06'),
(6, 4, 1, 55.00, 'Pix', FALSE, 'pendente', 'Troco para 100', '2026-10-06'),
(2, 4, 1, 72.00, 'Cartão de Débito', FALSE, 'finalizado', 'Sem azeitona', '2026-10-01'),
(3, 3, 2, 98.00, 'Pix', TRUE, 'finalizado', 'Entregar na portaria', '2026-10-02'),
(1, 4, 1, 62.00, 'Dinheiro', TRUE, 'pendente', 'Troco para 100', '2026-10-03'),
(4, 3, 2, 125.00, 'Cartão de Crédito', FALSE, 'finalizado', 'Pizza bem assada', '2026-10-03'),
(2, 3, 1, 48.00, 'Pix', TRUE, 'cancelado', 'cortar em duas partes', '2026-10-04'),
(5, 4, 2, 89.00, 'Cartão de Crédito', FALSE, 'finalizado', 'Adicionar orégano', '2026-10-04'),
(3, 3, 1, 135.00, 'Dinheiro', TRUE, 'pendente', 'Troco para 200', '2026-10-05'),
(1, 4, 2, 57.00, 'Pix', FALSE, 'finalizado', 'Sem tomate', '2026-10-05'),
(4, 3, 1, 105.00, 'Cartão de Débito', TRUE, 'finalizado', 'Entregar após as 20h', '2026-10-06'),
(5, 4, 2, 76.00, 'Pix', FALSE, 'pendente', 'Pouco queijo', '2026-10-06'),
(2, 3, 1, 92.00, 'Cartão de Crédito', TRUE, 'cancelado', 'muito morango', '2026-10-07'),
(3, 4, 2, 68.00, 'Dinheiro', FALSE, 'finalizado', 'Sem pimentão', '2026-10-07'),
(4, 3, 1, 115.00, 'Pix', TRUE, 'pendente', 'Borda recheada', '2026-10-07'),
(5, 4, 2, 82.00, 'Cartão de Débito', FALSE, 'finalizado', 'Cortar em oito pedaços', '2026-10-07'),
(1, 3, 1, 150.00, 'Cartão de Crédito', TRUE, 'pendente', 'Duas pizzas grandes', '2026-10-07');

-- Sabores
INSERT INTO Sabor (nome) VALUES
('Calabresa'),
('Marguerita'),
('Chocolate com Morango'),
('Quatro Queijos'),
('Frango com Catupiry'),
('Portuguesa'),
('Mussarela'),
('Pepperoni'),
('Napolitana');

-- Pizzas
INSERT INTO Pizza (id_pedido, tamanho, id_sabor, tipo, recheio_borda) VALUES
(1, 35.0, 1, FALSE, TRUE),
(4, 35.0, 2, FALSE, FALSE),
(15, 30.0, 3, TRUE, TRUE),
(2, 40.0, 4, FALSE, TRUE),
(3, 35.0, 5, FALSE, TRUE),
(5, 30.0, 1, FALSE, FALSE),
(6, 40.0, 6, FALSE, TRUE),
(7, 35.0, 5, FALSE, FALSE),
(8, 30.0, 7, FALSE, TRUE),
(9, 40.0, 1, FALSE, TRUE),
(10, 35.0, 2, FALSE, FALSE),
(11, 30.0, 6, FALSE, TRUE),
(12, 40.0, 4, FALSE, FALSE),
(13, 35.0, 9, FALSE, TRUE),
(14, 30.0, 3, TRUE, FALSE),
(16, 40.0, 1, FALSE, TRUE),
(17, 35.0, 5, FALSE, FALSE),
(18, 30.0, 7, FALSE, TRUE),
(19, 40.0, 6, FALSE, TRUE),
(1, 30.0, 1, FALSE, FALSE),
(2, 35.0, 4, FALSE, TRUE),
(3, 40.0, 6, FALSE, FALSE),
(4, 30.0, 5, FALSE, TRUE),
(5, 35.0, 2, FALSE, FALSE),
(6, 30.0, 3, TRUE, TRUE),
(7, 40.0, 8, FALSE, TRUE),
(8, 35.0, 1, FALSE, FALSE),
(9, 30.0, 9, FALSE, TRUE),
(10, 40.0, 4, FALSE, TRUE),
(11, 35.0, 5, FALSE, FALSE),
(12, 30.0, 3, TRUE, TRUE),
(13, 40.0, 7, FALSE, TRUE),
(14, 35.0, 6, FALSE, FALSE),
(15, 30.0, 1, FALSE, TRUE);

-- Ingredientes
INSERT INTO Ingrediente (nome_ingrediente, valor_ingrediente, quantidade_ingrediente) VALUES
('Mussarela', 5.00, 100),
('Calabresa', 6.50, 80),
('Manjericão', 2.00, 50),
('Chocolate', 8.00, 40),
('Gorgonzola', 9.00, 30),
('Frango', 7.00, 70),
('Catupiry', 6.00, 60),
('Tomate', 2.50, 50),
('Cebola', 1.50, 60),
('Pimentão', 2.00, 40),
('Azeitona', 3.00, 45),
('Presunto', 5.50, 60),
('Ovo', 2.50, 50),
('Pepperoni', 8.00, 50),
('Parmesão', 7.00, 40),
('Molho de Tomate', 3.00, 100),
('Orégano', 1.50, 50),
('Morango', 6.00, 40),
('Queijo', 6.50, 200);

-- ListaIngredientes
INSERT INTO ListaIngredientes (id_sabor, id_ingrediente) VALUES
(1, 19),
(1, 2),
(1, 9),
(1, 11),
(1, 16),
(1, 17),
(2, 19),
(2, 1),
(2, 8),
(2, 3),
(2, 16),
(3, 19),
(3, 4),
(3, 18),
(4, 19),
(4, 1),
(4, 5),
(4, 15),
(5, 19),
(5, 6),
(5, 7),
(5, 16),
(5, 1),
(6, 12),
(6, 13),
(6, 9),
(6, 11),
(6, 1),
(7, 1),
(7, 16),
(7, 18),
(8, 14),
(8, 1),
(9, 19),
(9, 1),
(9, 8),
(9, 15),
(9, 17);