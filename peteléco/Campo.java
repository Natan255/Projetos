import javax.swing.JPanel;
import java.awt.*;

public class Campo extends JPanel {

    double moeda_X;
    double moeda_Y;
    double b;
    double velocidade = 1;
    double coeficienteAngular;
    double deltaX;
    double deltaY;
    int mlinha_X;
    int mlinha_Y;
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
                    System.out.printf("Arrastando mouse em: (%d, %d)%n", mouse_x, mouse_y);
                    moedaClicada = true;
                    mlinha_X = mouse_x;
                    mlinha_Y = mouse_y;

                } else {
                    if (!(mouse_x > moeda_X && mouse_x < moeda_X + raio * 4 && mouse_y > moeda_Y
                            && mouse_y < moeda_Y + raio * 4)) {
                        System.out.printf("Arrastando mouse em: (%d, %d)%n", mouse_x, mouse_y);
                        mlinha_X = mouse_x;
                        mlinha_Y = mouse_y;
                        deltaX = mlinha_X - (moeda_X + raio * 2);
                        deltaY = mlinha_Y - (moeda_Y + raio * 2);

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
                    coeficienteAngular = (double) deltaY / deltaX;
                    b = moeda_Y - (coeficienteAngular * moeda_X);
                    moedaClicada = false;
                    System.out.println("Moeda lançada");
                }

                repaint();
            }

        });

    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        int largura = getWidth();
        int altura = getHeight();

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
        g.fillOval((int) moeda_X, (int) moeda_Y, raio * 4, raio * 4);

        if (moedaClicada == true) {
            g.drawLine((int) moeda_X + raio * 2, (int) moeda_Y + raio * 2, mlinha_X, mlinha_Y);
            repaint();

        }
        if (moedaLancada) {
            // Atualiza posição
            double modulo = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            moeda_X += -(deltaX / modulo) * velocidade; //normaliza e multiplica pela velocidade
            moeda_Y += -(deltaY / modulo) * velocidade;

            // Colisão com as paredes
            if ((moeda_X <= 0) && !colidiu) {
                deltaX = -deltaX;
                colidiu = true;
            }
            if ((moeda_X + raio * 4 >= largura) && !colidiu) {
                deltaX = -deltaX;
                colidiu = true;
            }
            if ((moeda_Y - raio * 2 <= altura / 7) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }
            if ((moeda_Y + raio * 2 >= altura - altura / 8) && !colidiu) {
                deltaY = -deltaY;
                colidiu = true;
            }
            if (colidiu) {
                colidiu = false;
            }
            repaint();
        }

    }

}
