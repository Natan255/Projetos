import sqlite3
import pandas as pd
import matplotlib.pyplot as plt


conexao = sqlite3.connect("loja_pai.db")
#Quanto a empresa faturou?
query = "SELECT SUM(valor) AS faturamento FROM Servico WHERE pago = 1;"

#Qual foi o ganho total de cada funcionario?
query2 = """
SELECT 
    f.nome AS Nome,
    SUM(s.valor) AS Total
FROM Servico s
JOIN Funcionario f ON  s.id_funcionario = f.id_funcionario 
WHERE pago = 1
GROUP BY f.nome;
"""

#Qual foi o custo total de peças usadas nos serviços?
query3 = """
SELECT 
    m.nome AS Nome_Material,
    SUM(sm.usado * m.custo) AS Custo_total
FROM ServicosMaterial sm
JOIN Material m ON sm.id_material = m.id_material
GROUP BY m.nome;
"""
df = pd.read_sql_query(query, conexao)
df2 = pd.read_sql_query(query2, conexao)
df3 = pd.read_sql_query(query3, conexao)
print("--- Consultas ---")
print(df)
print("-"*30)
print(df2)
print("-"*30)
print(df3)


plt.figure(figsize=(7,7)) # tamanho da tela
plt.bar(df2['Nome'], df2['Total']) # grafico barrra eixo x e o nome e y o total
plt.xlabel('Funcionarios')
plt.ylabel('Faturamento')
plt.title('faturamento de cada tecnico')
plt.savefig('GraficoBar_tecnicos.png')
plt.show()


conexao.close()



""" 

SELECT -> FROM -> JOIN -> WHERE -> GROUP BY
-------------------------------------------
JOIN acessa outra tabela e selecina as linhas dessa outra tabela, que tem a caracteristica igual a que vc expecifiou

JOIN Funcionario f ON  s.id_funcionario = f.id_funcionario 

-----------------------------------------------
Ele sempre anda de mãos dadas com funções de agregação (como SUM, COUNT, AVG, MAX, MIN).

Sempre que você diz ao banco de dados: "Quero somar o dinheiro" ou "Quero contar quantos serviços
foram feitos", o banco entra em um dilema: "Você quer que eu some tudo do banco inteiro e jogue numa linha só
, ou quer que eu separe isso por funcionário/categoria?". O GROUP BY é a resposta para esse dilema.
RESUMO: compacta diversas linhas com a msm caracteristica e aplica a funcao de agregacao  em cada uma dessas linhas/grupos

GROUP BY f.nome;
---------------------------------------------------

SELECT nome, email FROM usuarios;
-- o LIKE é que nem uma barra de pesquisa

SELECT * FROM usuarios WHERE nome LIKE 'Ana%';

--tudo que tiver entre o select e o from é exibido, e o AS ajuda na exibicao
SELECT 
    id_funcionario AS ID,
    SUM(valor) AS Total
FROM Servico

--pode vir um AND ou OR aqui mais filtros
SELECT * FROM produtos WHERE preco > 50.00 
-----------------------------------------------------------------


Desafio 3: Qual foi o custo total de peças usadas nos serviços?
Aqui está o pulo do gato! O Python vai pegar a quantidade usada (usado), multiplicar pelo custo unitário do material (custo) e somar tudo.

    SQL:
    sql

    SELECT SUM(sm.usado * m.custo) AS custo_total_pecas
    FROM ServicosMaterial sm
    JOIN Material m ON sm.id_material = m.id_material;

 """