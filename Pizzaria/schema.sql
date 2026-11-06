-- Criação do Schema e Tabelas

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    endereco TEXT
);

CREATE TABLE Funcionario (
    id_funcionario SERIAL PRIMARY KEY,
    nome_funcionario VARCHAR(100) NOT NULL,
    salario DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Pizzaiolo (
    id_funcionario INT PRIMARY KEY,
    numero_acidentes INT DEFAULT 0 CHECK (numero_acidentes >= 0),
    pizzas_feitas INT DEFAULT 0 CHECK (pizzas_feitas >= 0),
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario) ON DELETE CASCADE
);

CREATE TABLE Atendente (
    id_funcionario INT PRIMARY KEY,
    gorjeta_acumulada DECIMAL(10, 2) DEFAULT 0.00,
    pedidos_atendidos INT DEFAULT 0,
    tipo BOOLEAN NOT NULL, -- TRUE para entregador, FALSE para garçom
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario) ON DELETE CASCADE
);

CREATE TYPE STATUS_PEDIDO AS ENUM ('pendente', 'finalizado', 'cancelado');

CREATE TABLE Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT,
    id_pizzaiolo INT NOT NULL,
    id_atendente INT NOT NULL,
    valor_pedido DECIMAL(10, 2) NOT NULL,
    forma_de_pagamento VARCHAR(30) NOT NULL,
    delivery BOOLEAN NOT NULL,
    status STATUS_PEDIDO DEFAULT 'pendente',
    observacoes TEXT,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_pizzaiolo) REFERENCES Pizzaiolo(id_funcionario),
    FOREIGN KEY (id_atendente) REFERENCES Atendente(id_funcionario)
);

CREATE TABLE Sabor(
    id_sabor SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Pizza (
    id_pizza SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_sabor INT NOT NULL,
    tamanho DECIMAL(5, 2) NOT NULL,
    tipo BOOLEAN NOT NULL, -- TRUE para doce, FALSE para salgada
    recheio_borda BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_sabor) REFERENCES Sabor(id_sabor) ON DELETE CASCADE
);

CREATE TABLE Ingrediente (
    id_ingrediente SERIAL PRIMARY KEY,
    nome_ingrediente VARCHAR(50) NOT NULL,
    valor_ingrediente DECIMAL(10, 2) NOT NULL,
    quantidade_ingrediente INT NOT NULL
);

CREATE TABLE ListaIngredientes (
    id_sabor INT NOT NULL,
    id_ingrediente INT NOT NULL,
    PRIMARY KEY(id_sabor, id_ingrediente),
    FOREIGN KEY (id_sabor) REFERENCES Sabor(id_sabor) ON DELETE CASCADE,
    FOREIGN KEY (id_ingrediente) REFERENCES Ingrediente(id_ingrediente) ON DELETE CASCADE
);