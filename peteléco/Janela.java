import java.awt.*;
import javax.swing.*;


public class Janela extends JFrame{
    public Janela() {
        this.setTitle("Piteleco");
        this.setSize(700, 500);
        this.setDefaultCloseOperation(EXIT_ON_CLOSE);
        Campo campo = new Campo();
        add(campo);
        this.setVisible(true);
        
    }

    
}
