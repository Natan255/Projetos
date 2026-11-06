-- 1. Relatório de pedidos finalizados a partir do dia 6 de outubro de 2026
SELECT 
   c.cpf, 
   pio.nome_funcionario as pizzaiolo, 
   at.nome_funcionario as atendente, 
   s.nome as sabor, 
   pe.valor_pedido, 
   pe.observacoes
FROM Pedido pe
INNER JOIN Cliente c ON c.id_cliente = pe.id_cliente
INNER JOIN Funcionario pio ON pe.id_pizzaiolo = pio.id_funcionario
INNER JOIN Funcionario at ON pe.id_atendente = at.id_funcionario
INNER JOIN Pizza pi ON pi.id_pedido = pe.id_pedido
INNER JOIN Sabor s ON pi.id_sabor = s.id_sabor
WHERE pe.status = 'finalizado' AND pe.data >= '2026-10-06';

-- 2. Gasto total de clientes registrados (Apenas pedidos finalizados)
SELECT 
   c.nome, 
   c.cpf, 
   SUM(p.valor_pedido) as total_gasto
FROM Cliente c
INNER JOIN Pedido p ON p.id_cliente = c.id_cliente
WHERE p.status = 'finalizado'
GROUP BY c.nome, c.cpf;

-- 3. Sabores de pizza com custo de ingredientes acima de 20 reais
SELECT
   s.nome as sabor, 
   SUM(i.valor_ingrediente) as custo_total 
FROM Sabor s
INNER JOIN ListaIngredientes li ON s.id_sabor = li.id_sabor
INNER JOIN Ingrediente i ON li.id_ingrediente = i.id_ingrediente
GROUP BY s.nome 
HAVING SUM(i.valor_ingrediente) > 20.0;