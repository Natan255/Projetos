# Sistema de Gerenciamento de Banco de Dados - Pizzaria Barriguda

Projeto acadêmico desenvolvido para a disciplina de Banco de Dados I. O objetivo é modelar, implementar e consultar um banco de dados relacional para resolver os problemas logísticos de uma pizzaria (gestão de pedidos, funcionários, ingredientes e entregas), substituindo um gerenciamento analógico por um sistema robusto.

## Tecnologias e Conceitos Aplicados
- **PostgreSQL:** Sistema Gerenciador de Banco de Dados (SGBD) relacional.
- **SQL:** DDL (Data Definition Language), DML (Data Manipulation Language) e DQL (Data Query Language).
- **Modelagem de Dados:** Diagramas ER, Modelo Lógico e Normalização.
- **Álgebra Relacional:** Fundamentação matemática para as consultas.

## Modelagem de Dados
O banco de dados foi modelado para garantir a integridade dos dados, evitar redundâncias e otimizar as consultas de relatórios da pizzaria.

- **Diagrama Entidade-Relacionamento (ER):** [Ver imagem](docs/diagrama_er.png)
- **Diagrama Lógico:** [Ver imagem](docs/diagrama_logico.png)

### Principais Entidades e Relacionamentos
- **Cliente e Pedido:** Um cliente faz vários pedidos (1:N). O endereço é mantido para pedidos futuros.
- **Funcionário (Superclasse) e Especializações:** Atendentes (garçons e entregadores) e Pizzaiolos herdam de Funcionário, compartilhando dados como salário, mas com atributos específicos (gorjetas/acidentes).
- **Pedido, Pizza, Sabor e Ingrediente:** Um pedido contém uma ou mais pizzas. Cada pizza tem um sabor e os sabores são compostos por ingredientes (Relacionamento N:N entre Sabor e Ingrediente).

## Normalização
A modelagem foi validada até a **Terceira Forma Normal (3FN)** para garantir a integridade e evitar anomalias de inserção, atualização e exclusão.

- **1FN (Primeira Forma Normal):** Todos os atributos possuem valores atômicos (ex: o endereço é um campo de texto único, não uma lista). Não há tabelas aninhadas.
- **2FN (Segunda Forma Normal):** Todas as tabelas possuem chave primária simples (ex: `id_pedido`), exceto a tabela de associação `ListaIngredientes`. Nesta, a chave primária é composta (`id_sabor`, `id_ingrediente`), e os demais atributos dependem inteiramente dessa chave composta, sem dependências parciais.
- **3FN (Terceira Forma Normal):** Não existem dependências transitivas. Todos os atributos não-chave (ex: `nome_cliente`, `valor_pedido`) dependem única e exclusivamente da chave primária de suas respectivas tabelas, e não de outros atributos não-chave.

## Estrutura do Repositório
- `docs/`: Imagens dos diagramas e documentação de Álgebra Relacional (`algebra_relacional.md`).
- `sql/01_schema.sql`: Script DDL para criação das tabelas, chaves, tipos e restrições (CHECK, CASCADE).
- `sql/02_seed.sql`: Script DML com a carga inicial de dados fictícios para testes.
- `sql/03_queries.sql`: Consultas SQL implementadas para responder às perguntas de negócio.

## Como executar
1. Crie um banco de dados no PostgreSQL (ex: `CREATE DATABASE pizzaria;`).
2. Execute o arquivo `01_schema.sql` para criar a estrutura.
3. Execute o arquivo `02_seed.sql` para popular o banco com dados de teste.
4. Utilize o arquivo `03_queries.sql` para rodar as consultas de relatórios.

## Restrições de Integridade e Validações
O projeto conta com validações rigorosas no banco de dados:
- **Integridade Referencial:** Uso de chaves estrangeiras com `ON DELETE CASCADE`. Por exemplo, se um pedido for deletado, as pizzas associadas a ele são removidas automaticamente (evitando registros órfãos).
- **Restrições de Domínio:** Uso de `ENUM` para o status do pedido (`pendente`, `finalizado`, `cancelado`) e `CHECK` para impedir números negativos em acidentes ou pizzas feitas.
- **Validação de Inserção:** O banco impede a inserção de pedidos vinculados a funcionários (pizzaiolos/atendentes) que não existem na base de dados.

## Análises e Consultas
As consultas SQL no repositório foram desenhadas para responder a perguntas de negócio, como:
- Relatório de pedidos finalizados a partir de uma data específica.
- Gasto total acumulado por cada cliente.
- Sabores de pizza cujo custo de ingredientes ultrapassa R$ 20,00.

Para visualizar a lógica matemática por trás dessas consultas, consulte o arquivo de [Álgebra Relacional](docs/algebra_relacional.md).