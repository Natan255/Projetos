import javax.swing.JPanel;
import java.awt.*;

public class Campo extends JPanel {

    double moeda_X;
    double moeda_Y;
    double velocidade;
    int largura;
    int altura;
    double deltaX;
    double deltaY;
    double modulo;
    int mlinha_X;
    int mlinha_Y;
    int timeEsquerda = 0;
    int timeDireita = 0;
    private boolean moedaClicada = false;
    private boolean moedaLancada = false;
    private boolean moedaInicializada = false;
    private boolean colidiu = false;

    public Campo() {
        setBackground(Color.GREEN);

        addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            @Override

            public void mouseDragged(java.awt.event.MouseEvent e) {
                int mouse_x = e.getX();
                int mouse_y = e.getY();
                int raio = 5;

                if ((mouse_x > moeda_X && mouse_x < moeda_X + raio * 4 && mouse_y > moeda_Y
                        && mouse_y < moeda_Y + raio * 4)) {

                    moedaClicada = true;
                    mlinha_X = mouse_x;
                    mlinha_Y = mouse_y;

                } else {
                    if (!(mouse_x > moeda_X && mouse_x < moeda_X + raio * 4 && mouse_y > moeda_Y
                            && mouse_y < moeda_Y + raio * 4)) {

                        mlinha_X = mouse_x;
                        mlinha_Y = mouse_y;
                        deltaX = mlinha_X - (moeda_X + raio * 2);
                        deltaY = mlinha_Y - (moeda_Y + raio * 2);
                        modulo = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                    }
                }
                repaint();

            }
        });

        addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseReleased(java.awt.event.MouseEvent e) {
                if (moedaClicada == true) {
                    moedaLancada = true;
                    moedaClicada = false;
                    if (largura >= 1300) {
                        velocidade = modulo * 0.007;
                    } else {
                        velocidade = modulo * 0.001; // use um valor maior para testar
                    }
                }
                repaint();
            }

        });

    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setStroke(new BasicStroke(5));

        largura = getWidth();
        altura = getHeight();

        if (moedaLancada == false && moedaInicializada == false) {
            moeda_X = largura / 2 - 10;
            moeda_Y = altura / 2 - 10;

        } else {
            moedaInicializada = true;

        }

        g.setColor(new Color(0, 128, 0));
        g.fillRect(0, 0, largura, altura);
        g.setColor(Color.WHITE);
        g.drawLine(0, altura / 7, largura, altura / 7);
        g.drawLine(0, altura - altura / 8, largura, altura - altura / 8);

        // Lado esquerdo ----------------------
        int gaLargura = largura / 6;
        int gaAltura = altura / 2;
        int gaY = (altura - gaAltura) / 2;

        // Grande área esquerda

        g.drawRect(0, gaY, gaLargura, gaAltura);

        // Gol esquerda
        int golLargura = gaLargura / 6;
        int golAltura = gaAltura / 3;
        int golY_esq = gaY + (gaAltura - golAltura) / 2;
        g.drawRect(0, golY_esq, golLargura, golAltura);

        // Ponto do pênalti esquerda
        int penaltiX_esq = 0 + gaLargura * 3 / 4;
        int penaltiY = gaY + gaAltura / 2;
        int raio = 5;
        g.fillOval(penaltiX_esq - raio, penaltiY - raio, raio * 2, raio * 2);

        // Arco esquerda
        int arcoLargura = gaLargura / 2;
        int arcoAltura = gaAltura / 2;
        int arcoX_esq = gaLargura - arcoLargura / 2;
        int arcoY = gaY + (gaAltura - arcoAltura) / 2;
        g.drawArc(arcoX_esq, arcoY, arcoLargura, arcoAltura, 270, 180);

        // Lado direito ----------------------
        int gaX_dir = largura - gaLargura;
        g.drawRect(gaX_dir, gaY, gaLargura, gaAltura);
        int golX_dir = gaX_dir + gaLargura - golLargura;
        g.drawRect(golX_dir, golY_esq, golLargura, golAltura);
        int penaltiX_dir = gaX_dir + gaLargura / 4;
        g.fillOval(penaltiX_dir - raio, penaltiY - raio, raio * 2, raio * 2);
        int arcoX_dir = gaX_dir - arcoLargura / 2;
        g.drawArc(arcoX_dir, arcoY, arcoLargura, arcoAltura, 90, 180);

        // Meio de campo ----------------------

        g.fillOval(largura / 2 - raio, altura / 2 - raio, raio * 2, raio * 2);
        g.drawOval(largura / 2 - 55, altura / 2 - 55, 110, 110);
        g.drawLine(largura / 2, altura / 7, largura / 2, altura - altura / 8);

        // Moeda ----------------------------

        g.setColor(Color.RED);
        g.fillOval((int) moeda_X, (int) moeda_Y, raio * 4, raio * 4); // problema de posicionamento da moeda quando a
                                                                      // tela é redimensionada

        // ---------------------------------------------------------------------------------------
        // Pregos (posições dos jogadores)
        g.setColor(Color.BLACK);
        int raioPrego = Math.min(largura, altura) / 35;

        // ---------------- TIME DA ESQUERDA ----------------

        // Goleiro colado no gol
        int xGoleiroEsq = largura / 25;
        int yGoleiroEsq = altura / 2;
        g.fillOval(xGoleiroEsq - raioPrego, yGoleiroEsq - raioPrego, raioPrego * 2, raioPrego * 2);

        // Linha de 2 zagueiros praticamente na frente do goleiro
        int xZagueirosEsq = largura / 12;
        g.fillOval(xZagueirosEsq - raioPrego, altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xZagueirosEsq - raioPrego, 2 * altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Linha de 4 defensores (fechando quase toda a largura do campo)
        int xDefensoresEsq = largura / 6;
        g.fillOval(xDefensoresEsq - raioPrego, altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresEsq - raioPrego, 2 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresEsq - raioPrego, 3 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresEsq - raioPrego, 4 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Meio-campo mais recuado
        int xMeiasEsq = largura / 3;
        g.fillOval(xMeiasEsq - raioPrego, altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xMeiasEsq - raioPrego, 2 * altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Atacante solitário
        int xAtacanteEsq = largura / 2 - largura / 8;
        int yAtacanteEsq = altura / 2;
        g.fillOval(xAtacanteEsq - raioPrego, yAtacanteEsq - raioPrego, raioPrego * 2, raioPrego * 2);

        // ---------------- TIME DA DIREITA (espelhado) ----------------

        int xGoleiroDir = largura - largura / 25;
        int yGoleiroDir = altura / 2;
        g.fillOval(xGoleiroDir - raioPrego, yGoleiroDir - raioPrego, raioPrego * 2, raioPrego * 2);

        // Zagueiros perto do gol
        int xZagueirosDir = largura - largura / 12;
        g.fillOval(xZagueirosDir - raioPrego, altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xZagueirosDir - raioPrego, 2 * altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Linha de 4 defensores
        int xDefensoresDir = largura - largura / 6;
        g.fillOval(xDefensoresDir - raioPrego, altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresDir - raioPrego, 2 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresDir - raioPrego, 3 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xDefensoresDir - raioPrego, 4 * altura / 5 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Meio-campo recuado
        int xMeiasDir = largura - largura / 3;
        g.fillOval(xMeiasDir - raioPrego, altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);
        g.fillOval(xMeiasDir - raioPrego, 2 * altura / 3 - raioPrego, raioPrego * 2, raioPrego * 2);

        // Atacante
        int xAtacanteDir = largura / 2 + largura / 8;
        int yAtacanteDir = altura / 2;
        g.fillOval(xAtacanteDir - raioPrego, yAtacanteDir - raioPrego, raioPrego * 2, raioPrego * 2);
        // ---------------------------------------------------------------------------------------

        if (moedaClicada == true) {
            g.drawLine((int) moeda_X + raio * 2, (int) moeda_Y + raio * 2, mlinha_X, mlinha_Y);
            repaint();

        }
        if (moedaLancada) {
            // Atualiza posição
            moeda_X += -(deltaX / modulo) * velocidade; // normaliza e multiplica pela velocidade
            moeda_Y += -(deltaY / modulo) * velocidade;

            // Redução da velocidade
            if (largura < 1000) {
                velocidade -= 0.00001;
            } else if (largura >= 1000 && largura <= 1300) {
                velocidade -= 0.0001;
            } else if (largura > 1300) {
                velocidade -= 0.0012;
            }

            // ------------------ Colisão com paredes ------------------
            if ((moeda_X < 0) && !colidiu) {
                if (!(moeda_Y + raio * 4 > golY_esq && moeda_Y < golY_esq + golAltura)) {
                    deltaX = -deltaX;
                    colidiu = true;
                }
            }

            if ((moeda_X + raio * 4 >= largura) && !colidiu) {
                if (!(moeda_Y + raio * 4 > golY_esq && moeda_Y < golY_esq + golAltura)) {
                    deltaX = -deltaX;
                    colidiu = true;
                }
            }

            if ((moeda_Y - raio * 2 <= altura / 7) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }
            if ((moeda_Y + raio * 2 >= altura - altura / 8) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }

            // ------------------ Colisão com jogadores (pregos) ------------------
            int[][] jogadores = {
                    // Time Esquerda
                    { xGoleiroEsq, yGoleiroEsq },
                    { xZagueirosEsq, altura / 3 }, { xZagueirosEsq, 2 * altura / 3 },
                    { xDefensoresEsq, altura / 5 }, { xDefensoresEsq, 2 * altura / 5 },
                    { xDefensoresEsq, 3 * altura / 5 }, { xDefensoresEsq, 4 * altura / 5 },
                    { xMeiasEsq, altura / 3 }, { xMeiasEsq, 2 * altura / 3 },
                    { xAtacanteEsq, altura / 2 },
                    // Time Direita
                    { xGoleiroDir, yGoleiroDir },
                    { xZagueirosDir, altura / 3 }, { xZagueirosDir, 2 * altura / 3 },
                    { xDefensoresDir, altura / 5 }, { xDefensoresDir, 2 * altura / 5 },
                    { xDefensoresDir, 3 * altura / 5 }, { xDefensoresDir, 4 * altura / 5 },
                    { xMeiasDir, altura / 3 }, { xMeiasDir, 2 * altura / 3 },
                    { xAtacanteDir, altura / 2 }
            };

            for (int[] jogador : jogadores) {
                double dx = moeda_X + raio * 2 - jogador[0];
                double dy = moeda_Y + raio * 2 - jogador[1];
                double dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < raio + raioPrego) {
                    // Normal da colisão (vetor unitário do jogador para a moeda)
                    double nx = dx / dist;
                    double ny = dy / dist;

                    // Componente da velocidade ao longo da normal
                    double velNormal = (deltaX * nx + deltaY * ny);

                    // Reflete a velocidade em relação à normal
                    deltaX = deltaX - 2 * velNormal * nx;
                    deltaY = deltaY - 2 * velNormal * ny;

                    colidiu = true;
                    break;
                }
            }

            // ------------------ Gol ------------------
            if (moeda_Y > golY_esq && moeda_Y < golY_esq + golAltura && moeda_X <= -raio * 4) {
                timeDireita++;
                colidiu = false;
                moedaLancada = false;
                moedaInicializada = false;
                System.out.println("GOL PARA O TIME DA DIREITA!");
                System.out.println("Placar: " + timeEsquerda + " x " + timeDireita);
            }

            if (moeda_Y > golY_esq && moeda_Y < golY_esq + golAltura && moeda_X >= largura) {
                timeEsquerda++;
                colidiu = false;
                moedaLancada = false;
                moedaInicializada = false;
                System.out.println("GOL PARA O TIME DA ESQUERDA!");
                System.out.println("Placar: " + timeEsquerda + " x " + timeDireita);
            }

            if (velocidade <= 0) {
                velocidade = 0;
                moedaLancada = false;
            }
            if (colidiu) {
                colidiu = false;
            }

            repaint();
        }

        // Placar ----------------------------
        g.setColor(Color.BLACK);
        g.setFont(new Font("Arial", Font.BOLD, 55));
        g.drawString(timeEsquerda + " X " + timeDireita, largura / 2 - 50, 50);

    }

}
