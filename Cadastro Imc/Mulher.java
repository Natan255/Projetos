public class Mulher extends PessoaIMC {
    public Mulher(String nome, String sobreNome, int dia, String mes, int ano, String numCPF, float peso, float altura) {

        super(nome, sobreNome, dia, mes, ano, numCPF, peso, altura);

    }

    public void resultIMC(){
        float imc = calcularIMC();
        if (imc < 19) {
            System.out.println("Abaixo do peso ideal");
        } else if (19 <= imc && imc <= 25.8) {
            System.out.println("Peso normal");
        } else{
            System.out.println("Acima do peso ideal");
        }  
    }

    public String getgenero() {
        return "Mulher";
    }

    @Override
    public String toString() {

        return super.toString() +
                "Genero: Mulher\n";

    }
}
