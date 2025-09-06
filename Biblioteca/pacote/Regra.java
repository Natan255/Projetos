package pacote;
import java.io.Serializable;

public class Regra implements Serializable{
    private static final long serialVersionUID = 1L;
    private int maxLivros;
    private int diasSemMulta;

    public Regra(int maxLivros, int diasSemMulta) {
        this.maxLivros = maxLivros;
        this.diasSemMulta = diasSemMulta;
    }

    public int getMaxLivros() {
        return maxLivros;
    }

    public void setMaxLivros(int maxLivros) {
        this.maxLivros = maxLivros;
    }

    public int getDiasSemMulta() {
        return diasSemMulta;
    }

    public void setDiasSemMulta(int diasSemMulta) {
        this.diasSemMulta = diasSemMulta;
    }
    
}
