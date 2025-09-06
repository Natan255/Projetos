import java.time.LocalDate;
import java.time.Period;

//calendario numPessoas??
class Pessoa {
    static private int numPessoas = 0;
    private String nome;
    private String sobreNome;
    private LocalDate dataNasc;
    private ValidaData data = new ValidaData();
    private ValidaData mes = new ValidaData();
    private ValidaCPF cpf = new ValidaCPF();
    private String numCPF;
    private float peso = -1;
    private float altura = -1;

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

    public Pessoa(String nome, String sobreNome, int dia, String mes, int ano, String numCPF, float peso,
            float altura) {

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

        if (this.cpf.isCPF(numCPF) == false) {
            throw new IllegalArgumentException("CPF inválido.");

        }
        if (altura > 2.5 || altura < 0) {
            throw new IllegalArgumentException("Altura inválida.");
            
        }
        if (peso > 500 || peso < 0) {
            throw new IllegalArgumentException("Peso inválido.");
            
        }
        this.nome = nome;
        this.sobreNome = sobreNome;
        this.dataNasc = LocalDate.of(ano, this.data.getMes(), dia); // mês começa em 0 no gregori
        this.numCPF = numCPF;
        this.peso = peso;
        this.altura = altura;
        numPessoas += 1;

    }

    String getnome() {

        return this.nome;
    }

    String getsobreNome() {
        return this.nome;
    }

    String getnumCPF() {
        return this.numCPF;
    }

    float getpeso() {
        return this.peso;
    }

    float getaltura() {
        return this.altura;
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
        if (this.cpf.isCPF(numCPF) == false) {
            throw new IllegalArgumentException("CPF inválido.");

        }
        this.numCPF = numCPF;
    }

    void setpeso(float peso) {
        if (peso > 500 || peso < 0) {
            throw new IllegalArgumentException("Peso inválido.");
        }
        this.peso = peso;
    }

    void setaltura(float altura) {
        if (altura > 2.5 || altura < 0) {
            throw new IllegalArgumentException("Altura inválida.");
        }
        this.altura = altura;
    }

    @Override
    public String toString() {
        return  "-------------------------------\n" +
                "Nome: " + this.nome + "\n" +
                "Sobrenome: " + this.sobreNome + "\n" +
                "Idade: " + Period.between(dataNasc, LocalDate.now()).getYears() + "\n" +
                "CPF: " + this.numCPF + "\n" +
                "Peso: " + this.peso + "\n" +
                "Altura: " + this.altura + "\n";
    }

}