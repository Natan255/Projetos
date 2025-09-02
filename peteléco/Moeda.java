import javax.swing.JPanel;
import java.awt.*;
public class Moeda extends JPanel{
    @Override
    protected void paintComponent(Graphics g){
        super.paintComponent(g);
        int largura = getWidth();
        int altura = getHeight();
        int raio = 5;
        g.setColor(Color.black);
        g.fillOval(largura / 2 - raio, altura / 2 - raio, raio*2, raio*2);

    }
}
