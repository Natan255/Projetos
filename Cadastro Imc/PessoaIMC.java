abstract class PessoaIMC extends Pessoa {
    protected float peso;
    protected float altura;
    protected float imc;
    
    
    public PessoaIMC(String nome, String sobreNome, int dia, String mes, int ano, String numCPF, float peso, float altura) {
        super(nome, sobreNome, dia, mes, ano, numCPF);
        
        
        if (peso > 500 || peso < 0) {
            throw new IllegalArgumentException("Peso inválido.");
        }
        if (altura > 2.5 || altura < 0) {
            throw new IllegalArgumentException("Altura inválida.");
        }
        this.peso = peso;
        this.altura = altura;
        this.imc = this.peso / (this.altura * this.altura);
       
    }
       

    float getPeso() {
        return this.peso;
    }

    float getAltura() {
        return this.altura;
    }

    void setPeso(float peso) {
        if (peso > 500 || peso < 0) {
            throw new IllegalArgumentException("Peso inválido.");
        }
        this.peso = peso;
    }

    void setAltura(float altura) {
        if (altura > 2.5 || altura < 0) {
            throw new IllegalArgumentException("Altura inválida.");
        }
        this.altura = altura;
    }


    float calcularIMC(){
        return this.imc;

    }

    @Override
    public String toString() {
        return super.toString() +
               "Nome: " + getnome() + "\n" +
               "Data de nascimento: "  + getDia() +"/"+ getMes() + "/" + getAno() + "\n" +
               "Peso: " + this.peso + "\n" +
               "Altura: " + this.altura + "\n" +
               "IMC: " + this.imc + "\n"; 
               
    }
}