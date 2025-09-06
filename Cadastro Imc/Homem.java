public class Homem extends PessoaIMC {

    public Homem(String nome, String sobreNome, int dia, String mes, int ano, String numCPF, float peso, float altura) {
        super(nome, sobreNome, dia, mes, ano, numCPF, peso, altura);

    }

    public void resultIMC(){
        float imc = calcularIMC();
        if (imc < 20.7) {
            System.out.println("Abaixo do peso ideal");
        } else if (20.7 <= imc && imc <= 26.4) {
            System.out.println("Peso normal");
        } else{
            System.out.println("Acima do peso ideal");
        }  
    }
    

    @Override
    public String toString() {
        return super.toString() +
        "Genero: Homem\n";
    }
}