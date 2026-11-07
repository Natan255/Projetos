# Sistema de Gestão e Análise de Dados para Assistência Técnica

Este projeto nasceu de uma necessidade real: otimizar a gestão de uma loja de assistência técnica familiar especializada em refrigeração e eletrodomésticos (micro-ondas, fornos, cafeteiras, etc.). 

O objetivo foi tirar a gestão do papel e criar um banco de dados relacional robusto, além de um pipeline em Python para extrair dados e gerar visualizações que auxiliem o proprietário na tomada de decisão (como identificar quais técnicos geram mais receita e qual o real custo de peças por serviço).

*Nota: Embora o escopo inicial tenha sido desenhado para a empresa do meu pai, a arquitetura de dados é genérica e pode ser aplicada a qualquer assistência técnica ou prestadora de serviços.*

## Tecnologias Utilizadas
- **Python 3**
- **SQLite:** Banco de dados relacional local para armazenamento das Ordens de Serviço (OS).
- **Pandas:** Extração e manipulação dos dados.
- **Matplotlib:** Geração de gráficos analíticos.

## Modelagem de Dados
O banco de dados foi normalizado para evitar redundâncias e garantir a integridade das informações.

### Principais Entidades:
- **Cliente:** Dados de contato.
- **Funcionário:** Técnicos e ajudantes.
- **Serviço (OS):** O núcleo do sistema, registrando o aparelho, o tipo de serviço, o endereço de atendimento (que pode ser diferente do endereço do cliente), o status e o valor.
- **Material:** Controle de estoque de peças (gás, cobre, capacitores).
- **Servico_Material:** Tabela associativa (N:N) que registra quais peças foram usadas em cada serviço e a quantidade.

## Estrutura do Projeto
- `criar_banco.py`: Script DDL para criação da estrutura do banco de dados.
- `inserir_dados.py`: Script DML com dados de teste simulando a rotina da loja.
- `analise.py`: Script que conecta ao banco, executa as queries e gera os gráficos.
- `loja_pai.db`: Arquivo do banco de dados SQLite.

## Como Executar
1. Clone o repositório.

2. Instale as dependências:
   ```bash
   pip install pandas matplotlib

3. Crie o banco de dados
    python criar_banco.py

4. Insira os dados de Teste
    python inserir_dados.py

5 Gere as análises e os gráficos
    python analise.py

O script analise.py extrai os seguintes insights:
    Faturamento Total: Soma de todos os serviços pagos.
    Faturamento por Técnico: Identifica a performance individual da equipe.
    Custo de Peças: Calcula o custo total dos materiais utilizados.