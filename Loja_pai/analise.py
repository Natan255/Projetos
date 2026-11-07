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


plt.figure(figsize=(7,7))
plt.bar(df2['Nome'], df2['Total'])
plt.xlabel('Funcionarios')
plt.ylabel('Faturamento')
plt.title('faturamento de cada tecnico')
plt.savefig('GraficoBar_tecnicos.png')
plt.show()


conexao.close()
