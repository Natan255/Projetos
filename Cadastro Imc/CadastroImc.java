import java.util.Scanner;

public class CadastroImc {
    public static void main(String[] args) {
        Escolhas();
       
    }

    public static void inserir(int opcao) {
        int i;
        MinhaListaOrdenavel lista = new MinhaListaOrdenavel();
        PessoaIMC pessoa = new Homem("João", "Silva", 15, "Janeiro", 2000, "123.456.789-09", 70.0f, 1.75f);
        PessoaIMC pessoa2 = new Mulher("Maria", "Oliveira", 20, "Fevereiro", 1995, "111.444.777-35", 60.0f, 1.65f);
        PessoaIMC pessoa3 = new Homem("Robson", "Souza", 10, "Março", 1990, "987.654.321-00", 80.0f, 1.80f);
        PessoaIMC pessoa4 = new Mulher("Sandra", "Pereira", 5, "Abril", 1985, "111.111.111-11", 55.0f, 1.60f);
        PessoaIMC pessoa5 = new Homem("Pedro", "Lima", 25, "Maio", 1992, "111.444.777-35", 90.0f, 1.85f);
        PessoaIMC pessoa6 = new Mulher("Bia", "Costa", 30, "Junho", 1988, "123.456.789-09", 65.0f, 1.70f);
        PessoaIMC pessoa7 = new Homem("Josias", "Martins", 12, "Julho", 1993, "111.444.777-35", 75.0f, 1.78f);
        PessoaIMC pessoa8 = new Mulher("Juliana", "Almeida", 18, "Agosto", 1991, "987.654.321-00", 58.0f, 1.68f);
        PessoaIMC pessoa9 = new Homem("Ricardo", "Barros", 22, "Setembro", 1989, "111.111.111-11", 85.0f, 1.82f);
        PessoaIMC pessoa10 = new Mulher("Lourdes", "Gomes", 28, "Outubro", 1994, "111.111.111-11", 62.0f, 1.72f);

        lista.add(pessoa);
        lista.add(pessoa2);
        lista.add(pessoa3);
        lista.add(pessoa4);
        lista.add(pessoa5);
        lista.add(pessoa6);
        lista.add(pessoa7);
        lista.add(pessoa8);
        lista.add(pessoa9);
        lista.add(pessoa10);

        lista.ordena(opcao);

        for(i = 0; i < lista.pessoas.size(); i++) {
            PessoaIMC p = lista.get(i);
            System.out.println(p.toString());

        }
        

    }

    public static void Escolhas() {
        Scanner leitor = new Scanner(System.in);
        System.out.println("1. Imprimir lista");
        System.out.println("2. Sair");
        int opcao = leitor.nextInt();
        if (opcao == 1) {
            System.out.println("Escolha seu modo de ordenação:");
            System.out.println("--------------------------------------------------");
            System.out.println("0. Z-A");
            System.out.println("1. A-Z");
            System.out.println("2. Menor peso");
            System.out.println("3. Maior peso");
            System.out.println("4. Gênero");
            System.out.println("5. Maior Idade");
            System.out.println("6. Menor idade Idade");
            System.out.println("7. Maior altura");
            System.out.println("8. Menor altura");
            System.out.println("9. Maior IMC");
            System.out.println("10.Menor IMC");
            System.out.println("--------------------------------------------------");
            opcao = leitor.nextInt();
            inserir(opcao);
        }
        if (opcao == 2) {
            System.out.println("Saindo...");
            return;     
            
        }


    }

}
