package pacote;

import java.time.LocalDate;
import java.util.ArrayList;

import pacote.Emprest;
import pacote.NumeroMaxEmpreEx;
import pacote.Pessoa;
import pacote.Regra;

import java.io.Serializable;

public class Usuario extends Pessoa implements Serializable {
    private static final long serialVersionUID = 1L;
    private String endereco;
    private ArrayList<Emprest> hist = new ArrayList<>();
    Regra regra;
    int numEmprestimos = 0;
    public Usuario(String nome, String sobreNome, int dia, String mes, int ano, String numCPF, String endereco, Regra regra) {
        super(nome, sobreNome, dia, mes, ano, numCPF);
        this.endereco = endereco;
        this.regra = regra;
    }
    
    public Usuario() {

    }

    public void addLivroHist(LocalDate dataEmp, int code) throws NumeroMaxEmpreEx{
        if (numEmprestimos >= regra.getMaxLivros()) {
            throw new NumeroMaxEmpreEx("Número máximo de empréstimos atingido.");
        }
        Emprest inform = new Emprest(dataEmp, null, code);
        hist.add(inform);
        numEmprestimos += 1;

    }

    public void setRegra(Regra regra) {
        this.regra = regra;
    }
    
    public void dev(){
        numEmprestimos -= 1;
    }

    public Emprest getHist() {
        return hist.get(0);
    }

    public String getEndereco() {
        return endereco;
    }

    public String toString() {
        return super.toString() +
                "Endereço: " + endereco + "\n" +
                "Histórico de Empréstimos: " + hist;
    }
}
