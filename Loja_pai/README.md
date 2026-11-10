# Sistema de Gestão e Análise de Dados para Assistência Técnica

Este projeto nasceu de uma necessidade real: otimizar a gestão de uma loja de assistência técnica familiar especializada em refrigeração e eletrodomésticos (micro-ondas, fornos, cafeteiras, etc.). 

O objetivo foi tirar a gestão do papel e criar um banco de dados relacional robusto, além de um pipeline de dados em Python (ETL) para limpar dados bagunçados, extrair informações e gerar visualizações que auxiliem o proprietário na tomada de decisão.

*Nota: Embora o escopo inicial tenha sido desenhado para a empresa do meu pai, a arquitetura de dados é genérica e pode ser aplicada a qualquer assistência técnica ou prestadora de serviços.*

## Tecnologias Utilizadas
- **Python 3**
- **SQLite:** Banco de dados relacional local para armazenamento das Ordens de Serviço (OS).
- **Pandas:** Extração, limpeza (Data Cleansing) e manipulação dos dados.
- **Jupyter Notebook:** Ambiente utilizado para as análises exploratórias e testes.
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
- `inserir_dados.py`: Script DML com dados iniciais simulando a rotina da loja.
- `dados_sujos.csv`: Arquivo CSV simulando uma exportação de sistema antigo, contendo dados despadronizados (espaços extras, datas em formatos diferentes, valores como texto).
- `analise.ipynb`: Jupyter Notebook contendo o pipeline de limpeza (ETL) do CSV e as queries de análise de negócios.
- `analise.py`: Script que conecta ao banco, executa as queries e gera os gráficos.

## Insights de Negócio
Principais Insights Extraídos

O pipeline de análise foi capaz de responder a perguntas cruciais de negócio, como:

    Padronização de Serviços: Identificação e correção de erros de digitação no banco (ex: "Instalação" vs "Instalacao"), permitindo o cálculo correto da média de faturamento por tipo de serviço.

    Gargalos Operacionais: Descoberta de que pequenos eletrodomésticos (como Cafeteiras e Micro-ondas) representam a maior fila de espera (pendências), superando os consertos de grande porte.

    Ranking de Clientes: Identificação dos Top 5 clientes que mais geram receita para a loja, permitindo criar estratégias de fidelização.