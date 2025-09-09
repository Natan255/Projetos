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
                    if(largura >= 1300){
                        velocidade = modulo * 0.0107;
                    }else{
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

        largura = getWidth();
        altura = getHeight();

        if (moedaLancada == false && moedaInicializada == false) {
            moeda_X = largura / 2 - 10;
            moeda_Y = altura / 2 - 10;

        } else {
            moedaInicializada = true;

        }

        // Cor de fundo do campo
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
        g.drawOval(largura / 2 - raio * 11, altura / 2 - raio * 11, raio * 22, raio * 22);
        g.drawLine(largura / 2, altura / 7, largura / 2, altura - altura / 8);

        // Moeda ----------------------------

        g.setColor(Color.BLACK);
        g.fillOval((int) moeda_X, (int) moeda_Y, raio * 4, raio * 4); //problema de posicionamento da moeda quando a tela é redimensionada

        if (moedaClicada == true) {
            g.drawLine((int) moeda_X + raio * 2, (int) moeda_Y + raio * 2, mlinha_X, mlinha_Y);
            repaint();

        }
        if (moedaLancada) {
            // Atualiza posição
        
            
            moeda_X += -(deltaX / modulo) * velocidade; // normaliza e multiplica pela velocidade
            moeda_Y += -(deltaY / modulo) * velocidade;
            if (largura < 1000){
                velocidade -=  0.00001; // diminui a velocidade a cada atualização
            } else if (largura >= 1000 && largura <= 1300){
                velocidade -=  0.0001; // diminui a velocidade a cada atualização
            } else if (largura > 1300){
                velocidade -=  0.003; // diminui a velocidade a cada atualização
            }
            


            // Colisão com a parede esquerda (exceto se estiver no gol)
            if ((moeda_X < 0) && !colidiu) {
                // Só colide se NÃO estiver na área do gol esquerdo
                if (!(moeda_Y + raio * 4 > golY_esq && moeda_Y < golY_esq + golAltura)) {
                    deltaX = -deltaX;
                    colidiu = true;
                }
            }

            // Colisão com a parede direita
            if ((moeda_X + raio * 4 >= largura) && !colidiu) {

                if (!(moeda_Y + raio * 4 > golY_esq && moeda_Y < golY_esq + golAltura)) {
                    deltaX = -deltaX;
                    colidiu = true;
                }
            }

            // Colisão com as paredes de cima e baixo
            if ((moeda_Y - raio * 2 <= altura / 7) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }
            if ((moeda_Y + raio * 2 >= altura - altura / 8) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }

            // Gol para o time da direita
            if (moeda_Y > golY_esq && moeda_Y < golY_esq + golAltura && moeda_X <= -raio * 4) {
                timeDireita++;
                colidiu = false;
                moedaLancada = false;
                moedaInicializada = false; // pra resetar a posição da moeda
                System.out.println("GOL PARA O TIME DA DIREITA!");
                System.out.println("Placar: " + timeEsquerda + " x " + timeDireita);

            }
            if (moeda_Y > golY_esq && moeda_Y < golY_esq + golAltura && moeda_X >= largura) {
                colidiu = false;
                moedaLancada = false;
                moedaInicializada = false;
                timeEsquerda++;
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
