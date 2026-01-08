package pacote;
import java.time.LocalDate;
import java.time.Period;

import pacote.ValidaCPF;
import pacote.ValidaData;

import java.io.Serializable;

//calendario numPessoas??
class Pessoa implements Serializable {
    static private int numPessoas = 0;
    private String nome;
    private String sobreNome;
    private LocalDate dataNasc;
    private ValidaData data = new ValidaData();
    private ValidaData mes = new ValidaData();
    private String numCPF;


    public Pessoa(String nome, String sobreNome, int dia, String mes, int ano) {
        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Nome não pode ser vazio ou nulo.");
        }
        if (sobreNome.trim().isEmpty()) {
            throw new IllegalArgumentException("Sobrenome não pode ser vazio ou nulo.");
        }

        if (nome.matches(".*\\d.*")) { 
            throw new IllegalArgumentException("Nome não pode conter números.");
        }

        if (sobreNome.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Sobrenome não pode conter números.");
        }
        if (this.data.isDataValida(dia, mes, ano) == false) {
            throw new IllegalArgumentException("Data inválida.");
        }

        this.nome = nome;
        this.sobreNome = sobreNome;
        this.dataNasc = LocalDate.of(ano, this.mes.getMes(), dia); // 
        numPessoas += 1;

    }

    public Pessoa(){
        
    }

    public Pessoa(String nome, String sobreNome, int dia, String mes, int ano, String numCPF) {

        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Nome não pode ser vazio ou nulo.");
        }
        if (sobreNome.trim().isEmpty()) {
            throw new IllegalArgumentException("Sobrenome não pode ser vazio ou nulo.");
        }

        if (nome.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Nome não pode conter números.");
        }

        if (sobreNome.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Sobrenome não pode conter números.");

        }
        
        if (this.data.isDataValida(dia, mes, ano) == false) {
            throw new IllegalArgumentException("Dia inválido.");
        }

        this.nome = nome;
        this.sobreNome = sobreNome;
        this.dataNasc = LocalDate.of(ano, this.data.getMes(), dia);
        this.numCPF = numCPF;

        numPessoas += 1;

    }

    public String getnome() {

        return this.nome;
    }

    public String getsobreNome() {
        return this.sobreNome;
    }

    public String getnumCPF() {
        return this.numCPF;
    }

    public int getIdade() {
        return Period.between(dataNasc, LocalDate.now()).getYears();
    }

   void setnome(String nome) {
        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Nome não pode ser vazio ou nulo.");
            
        }
        if (nome.matches(".*\\d.*")) { 
            throw new IllegalArgumentException("Nome não pode conter números.");
        }
        this.nome = nome;


    }

    void setsobreNome(String sobreNome) {
        if (sobreNome.trim().isEmpty()) {
            throw new IllegalArgumentException("Sobrenome não pode ser vazio ou nulo.");
        }
        if (sobreNome.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Sobrenome não pode conter números.");
        }
        this.sobreNome = sobreNome;
    }

    void setnumCPF(String numCPF) {

        this.numCPF = numCPF;
    }


    @Override
    public String toString() {
        return  "-------------------------------\n" +
                "Nome: " + this.nome + "\n" +
                "Sobrenome: " + this.sobreNome + "\n" +
                "Idade: " + Period.between(dataNasc, LocalDate.now()).getYears() + "\n" +
                "CPF: " + this.numCPF + "\n";

    }

}