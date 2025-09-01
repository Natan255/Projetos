package peteléco;
import java.awt.*;
import javax.swing.*;


public class Janela extends JFrame{
    public Janela() {
        this.setTitle("Piteleco"); // usa "this", que já é um JFrame
        this.setSize(700, 500);
        this.setDefaultCloseOperation(EXIT_ON_CLOSE);
        this.setVisible(true);
    }

    @Override
    public void paint(Graphics g){
        super.paint(g);

        int largura = getWidth();
        int altura = getHeight();

        // Cor de fundo do campo
        g.setColor(new Color(0, 128, 0));
        g.fillRect(0, 0, largura, altura);

        g.setColor(Color.WHITE);
        g.drawLine(0, altura/7, largura, altura/7);
        g.drawLine(0, altura - altura/8, largura, altura - altura/8);
        // ---------------------- Lado esquerdo ----------------------
        int gaLargura = largura / 6;
        int gaAltura = altura / 2;
        int gaY = (altura - gaAltura) / 2;

        // Grande área esquerda

        g.drawRect(0, gaY, gaLargura, gaAltura);

        // Gol esquerda
        int golLargura = gaLargura / 6;
        int golAltura = gaAltura / 3;
        int golY_esq = gaY + (gaAltura - golAltura)/2;
        g.drawRect(0, golY_esq, golLargura, golAltura);

        // Ponto do pênalti esquerda
        int penaltiX_esq = 0 + gaLargura * 3/4;
        int penaltiY = gaY + gaAltura / 2;
        int raio = 5;
        g.fillOval(penaltiX_esq - raio, penaltiY - raio, raio*2, raio*2);

        // Arco esquerda
        int arcoLargura = gaLargura / 2;
        int arcoAltura = gaAltura / 2;
        int arcoX_esq = gaLargura - arcoLargura / 2;
        int arcoY = gaY + (gaAltura - arcoAltura) / 2;
        g.drawArc(arcoX_esq, arcoY, arcoLargura, arcoAltura, 270, 180);

        // ---------------------- Lado direito ----------------------
        int gaX_dir = largura - gaLargura;
        g.drawRect(gaX_dir, gaY, gaLargura, gaAltura);

        int golX_dir = gaX_dir + gaLargura - golLargura;
        g.drawRect(golX_dir, golY_esq, golLargura, golAltura);

        int penaltiX_dir = gaX_dir + gaLargura / 4;
        g.fillOval(penaltiX_dir - raio, penaltiY - raio, raio*2, raio*2);

        int arcoX_dir = gaX_dir - arcoLargura / 2;
        g.drawArc(arcoX_dir, arcoY, arcoLargura, arcoAltura, 90, 180);

        // ---------------------- Meio de canpo ----------------------

        g.fillOval(largura/2 ,altura/2, raio*2, raio*2); //copiei info do ponto do penalti
        g.drawOval((largura - raio*40) / 2 ,(altura - raio*40) / 2, raio*20, raio*20); //copiei info do ponto do penalti
    }
}
