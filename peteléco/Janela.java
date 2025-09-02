import java.awt.*;
import javax.swing.*;


public class Janela extends JFrame{
    public Janela() {
        this.setTitle("Piteleco");
        this.setSize(700, 500);
        this.setDefaultCloseOperation(EXIT_ON_CLOSE);
        Campo campo = new Campo();
        //Moeda moeda = new Moeda(); Ocorrendo problema de subrepossição completa do da moeda no campo
        add(campo);
        //add(moeda);
        this.setVisible(true);
        
    }

    
}
