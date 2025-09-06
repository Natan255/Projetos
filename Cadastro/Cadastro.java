import java.util.Scanner;

public class Cadastro {

    static int contador = -1;

    public static void main(String[] args) {

        String quantidade;
        int dia, ano;

        float peso, altura;
        if (args[0].equals("--help")) {
            System.out.println("java Cadastro <nome> <sobre> <dia> <mes> <ano> <CPF> <peso> <altura> <genero>");
            System.exit(0);
        }

        for (int i = 0; i < 9; i++) {
            if (args.length < 9) {
                System.out.println("Erro: Faltam argumentos.\n<exiba o seu help>.");
                System.exit(0);
            }
            if (args[i] == null || args[i].trim().isEmpty()) {
                System.out.println("Erro: Faltam argumentos.\n<exiba o seu help>.");
                System.exit(0);
            }
        }

        dia = Integer.parseInt(args[2]);
        ano = Integer.parseInt(args[4]);
        peso = Float.parseFloat(args[6]);
        altura = Float.parseFloat(args[7]);
        HomemMulher(args[0], args[1], dia, args[3], ano, args[5], peso, altura, args[8]);
        Quantidade(args[0], args[1], dia, args[3], ano, args[5], peso, altura, args[8]);

    }

    public static Pessoa HomemMulher(String nome, String sobreNome, int dia, String mes, int ano,
            String numCPF, float peso, float altura, String genero) {

        if (genero.equals("f")) {
            try {

                Pessoa p1 = new Mulher(nome, sobreNome, dia, mes, ano, numCPF, peso, altura);
                contador++;

                return p1;
            } catch (IllegalArgumentException e) {
                System.out.println("Erro: " + e.getMessage());
                return null;
            }

        } else if (genero.equals("m")) {
            try {

                Pessoa p1 = new Homem(nome, sobreNome, dia, mes, ano, numCPF, peso, altura);

                contador++;

                return p1;

            } catch (IllegalArgumentException e) {
                System.out.println("Erro: " + e.getMessage());
                return null;
            }

        } else {
            System.out.println("Genero inválido. Insira 'f' para feminino ou 'm' para masculino.");
            return null; 
        }
    }

    
    public static void PessoaQuantidade(int quant, Pessoa[] pessoas) {
        Scanner leitor = new Scanner(System.in);
        String nome, sobreNome, numCPF, mes, genero;
        ValidaData data = new ValidaData();
        int dia, ano;
        
            
       
        Pessoa testPessoa = new Pessoa("teste", "testes", 30, "8", 2005, "19704902760", 68, 1.84f);
        float peso, altura;
        if (quant == 0) {

        }
        for (int i = 0; i < quant; i++) {
            while (true) {
                try {
                    System.out.print("Informe o nome: ");
                    nome = leitor.nextLine();
                    testPessoa.setnome(nome);

                    System.out.print("Informe o sobrenome: ");
                    sobreNome = leitor.nextLine();
                    testPessoa.setsobreNome(sobreNome);

                    System.out.print("Informe o dia: ");
                    if (leitor.hasNextInt() == false) {
                        leitor.nextLine(); // Limpa
                        throw new IllegalArgumentException("Entre com o dia em inteiro.");
                    }
                    dia = leitor.nextInt();
                    if (data.isDia(dia) == false) {
                        leitor.nextLine(); // Limpa
                        throw new IllegalArgumentException("Dia inválido.");
                    }
                    
                    System.out.print("Informe o mes: ");
                    leitor.nextLine(); // Limpa
                    mes = leitor.nextLine();
                    if (data.isMes(mes) == false) {
                        throw new IllegalArgumentException("Mes inválido.");    
                        
                    }
                    
                    System.out.print("Informe o ano: ");
                    if (leitor.hasNextInt() == false) {
                        leitor.nextLine(); // Limpa
                        throw new IllegalArgumentException("Entre com o ano em inteiro.");
                    }
                     
                    ano = leitor.nextInt();
                    if (data.isAno(ano) == false) {
                        leitor.nextLine();
			throw new IllegalArgumentException("Ano inválido.");
                        
                    }

                    System.out.print("Informe o CPF: ");
                    leitor.nextLine(); // Limpa
                    numCPF = leitor.nextLine();
                    testPessoa.setnumCPF(numCPF);

                    System.out.print("Informe o peso: ");
                    peso = leitor.nextFloat();
                    testPessoa.setpeso(peso);

                    System.out.print("Informe a altura: ");
                    leitor.nextLine(); // Limpa
                    altura = Float.parseFloat(leitor.nextLine());
                    testPessoa.setaltura(altura);    
		
                    System.out.print("Esta pessoa é do gênero feminino ou masculino (f ou m)? ");
                    genero = leitor.nextLine();
		    if(!genero.equals("m") && !genero.equals("f")){
			
	            	throw new IllegalArgumentException("Genero invalido, entre com 'm' ou 'f'");
		    }
	
                    Pessoa novaPessoa = HomemMulher(nome, sobreNome, dia, mes, ano, numCPF, peso, altura, genero);
                    pessoas[contador - 1] = novaPessoa;
                    break;

                } catch (IllegalArgumentException e) {
                    System.out.println("Erro: " + e.getMessage());
                    System.out.println("Tente novamente.\n");
                }
            }
        }
    }

    
    public static void Quantidade(String nome, String sobreNome, int dia, String mes, int ano,
            String numCPF, float peso, float altura, String genero) {
        Pessoa[] pessoas;
        Scanner leitor = new Scanner(System.in);
        String quantidade;
        System.out.print("Quantas pessoas a mais deseja inserir? ");
        quantidade = leitor.nextLine();
        

        if (quantidade.equals("")) {
            pessoas = new Pessoa[1];
            pessoas[0] = HomemMulher(nome, sobreNome, dia, mes, ano, numCPF, peso, altura, genero);
            Printar(pessoas);
            System.exit(0);

        }
        pessoas = new Pessoa[Integer.parseInt(quantidade) + 1];
        pessoas[0] = HomemMulher(nome, sobreNome, dia, mes, ano, numCPF, peso, altura, genero);

        while (true) {
            try {

                int quant = Integer.parseInt(quantidade);

                if (quant < 0) {
                    throw new IllegalArgumentException("Quantidade deve ser maior que zero ou nula.");
                }
                PessoaQuantidade(quant, pessoas);
                break;
            } catch (NumberFormatException e) {
                System.out.println("Quantidade inválida. Tente novamente.");
                quantidade = leitor.nextLine();
                continue;
            }
        }
        Printar(pessoas);
        System.out.println("Programa encerrado.");
    }

    public static void numPessoa(boolean mostrar) {

        if (mostrar == true) {
            System.out.println("Total de pessoas cadastradas: " + contador);
        }
    }

    public static void Printar(Pessoa[] pessoas) {
        int f = 0;
        int m = 0;
        for (int i = 0; i < contador; i++) {
            System.out.println(pessoas[i].toString());
            if (pessoas[i] instanceof Homem) {
                m += 1;
            }else{
                f += 1;
            }
        }
        System.out.println("Masculino: " + m);  
        System.out.println("Feminino: " + f);
        System.out.println("Total de pessoas cadastradas: " + contador);
    }
}
