import java.util.Scanner;

import pacote.*;

public class Livraria {
    public static void main(String[] args) {
        Scanner leitor = new Scanner(System.in);
        Regra regra = regras();
        System.out.println(("--------  BIBLIOTECA  ---------"));
        System.out.println("1 - Iniciar com cadastro zerado");
        System.out.println("2 - Carregar dados de arquivos existentes");
        int escolha = leitor.nextInt();
        leitor.nextLine();
        Biblioteca biblioteca;
        

        if (escolha == 1) {
            System.out.println("Cadastro zerado.");
            biblioteca = new Biblioteca();

        } else if (escolha == 2) {
            System.out.print("Digite o nome do arquivo de usuários: ");
            String arquivoUsuarios = leitor.nextLine();
            System.out.print("Digite o nome do arquivo de livros: ");
            String arquivoLivros = leitor.nextLine();
            biblioteca = new Biblioteca(arquivoUsuarios, arquivoLivros);
            biblioteca.mudaRegra(regra);
            System.out.println("Dados carregados com sucesso.");
        } else {
            System.out.println("Opção inválida. Encerrando o programa.");
            return;
        }

        menu(biblioteca, regra);
    }

    public static Regra regras() {
        Scanner leitor = new Scanner(System.in);
        System.out.println("\nRegras da biblioteca:");
        System.out.print("Máximo de livros que um usuário pode pegar emprestado: ");
        int maxLivros = leitor.nextInt();
        System.out.print("Dias que um usuário pode ficar com o livro sem pagar multa: ");
        int diasSemMulta = leitor.nextInt();
        System.err.println("\n");
        return new Regra(maxLivros, diasSemMulta);
    }

    public static void menu(Biblioteca biblioteca, Regra regra) {
        Scanner leitor = new Scanner(System.in);
        int opcao = -1;

        while (opcao != 0) {
            System.out.println("\n------ MENU PRINCIPAL ------");
            System.out.println("1 - Manutenção");
            System.out.println("2 - Cadastro");
            System.out.println("3 - Empréstimo");
            System.out.println("4 - Relatórios");
            System.out.println("0 - Sair");
            System.out.print("Escolha uma opção: ");
            opcao = leitor.nextInt();
            leitor.nextLine();

            switch (opcao) {
                case 1:
                    System.out.println("\n--- MANUTENÇÃO ---");
                    System.out.println("1 - Criar arquivos (usuários e livros)");
                    System.out.println("2 - Abrir outros arquivos");
                    System.out.print("Escolha: ");
                    int manutencaoOp = leitor.nextInt();
                    leitor.nextLine();
                    switch (manutencaoOp) {
                        case 1:
                            System.out.print("Digite o nome do arquivo para salvar livros: ");
                            String nomeArquivoLivros = leitor.nextLine();
                            biblioteca.salvarArquivo(biblioteca.getHashLivro(), nomeArquivoLivros);
                            System.out.print("Digite o nome do arquivo para salvar usuarios: ");
                            String nomeArquivoUsuarios = leitor.nextLine();
                            biblioteca.salvarArquivo(biblioteca.getHashUser(), nomeArquivoUsuarios);
                            System.out.println("Dados salvos com sucesso.");
                            break;
                        case 2:
                            System.out.print("Digite o nome do arquivo de usuários: ");
                            String arquivoUsuarios = leitor.nextLine();
                            System.out.print("Digite o nome do arquivo de livros: ");
                            String arquivoLivros = leitor.nextLine();
                            biblioteca = new Biblioteca(arquivoUsuarios, arquivoLivros);
                            biblioteca.mudaRegra(regra);
                            System.out.println("Dados carregados com sucesso.");
                            break;
                        default:
                            System.out.println("Opção inválida.");
                    }
                    break;
                case 2:
                    System.out.println("\n--- CADASTRO ---");
                    System.out.println("1 - Cadastrar usuário");
                    System.out.println("2 - Cadastrar livro");
                    System.out.println("3 - Salvar arquivos");
                    int cadastroOp = leitor.nextInt();
                    leitor.nextLine();

                    switch (cadastroOp) {
                        case 1:
                            biblioteca.intanUsuario(regra);
                            break;
                        case 2:
                            biblioteca.intanLivro();
                            break;
                        case 3:
                            System.out.println("Escolha o que deseja salvar:");
                            System.out.println("1 - Salvar usuários");
                            System.out.println("2 - Salvar livros");
                            int salvarOp = leitor.nextInt();
                            leitor.nextLine();

                            switch (salvarOp) {
                                case 1:
                                    System.out.print("Digite o nome do arquivo para salvar usuários: ");
                                    String nomeArquivoUsuarios = leitor.nextLine();
                                    biblioteca.salvarArquivo(biblioteca.getHashUser(), nomeArquivoUsuarios);
                                    break;
                                case 2:
                                    System.out.print("Digite o nome do arquivo para salvar livros: ");
                                    String nomeArquivoLivros = leitor.nextLine();
                                    biblioteca.salvarArquivo(biblioteca.getHashLivro(), nomeArquivoLivros);
                                    break;
                                default:
                                    System.out.println("Opção inválida.");
                            }
                            break;
                        default:
                            System.out.println("Opção inválida.");
                    }
                    break;

                case 3:
                    System.out.println("\n--- EMPRÉSTIMO ---");
                    System.out.println("1 - Ver acervo de livros");
                    System.out.println("2 - Fazer empréstimo");
                    System.out.println("3 - Devolver livro");
                    int emprestimoOp = leitor.nextInt();
                    leitor.nextLine();

                    switch (emprestimoOp) {
                        case 1:
                            System.out.print("Digite o código do livro: ");
                            int codeAcer = leitor.nextInt();

                            try{
                                Livro livroAcer = biblioteca.getLivro(codeAcer);
                                System.out.println(livroAcer);
                            } catch (LivroNaoCadastradoEx e) {
                                System.out.println("Erro ao buscar livro: " + e.getMessage());
                            }
                            break;
                        case 2:
                            System.out.print("Digite o CPF do usuário: ");
                            String cpfEmp = leitor.nextLine();
                            System.out.print("Digite o código do livro: ");
                            int codeEmp = leitor.nextInt();
                            leitor.nextLine();
                            Usuario usuarioEmp;
                            Livro livroEmp;
                            try {
                                usuarioEmp = biblioteca.getUsuario(cpfEmp);
                                livroEmp = biblioteca.getLivro(codeEmp);
                                biblioteca.emprestaLivro(usuarioEmp, livroEmp, regra);
                            } catch (LivroNaoCadastradoEx | UsuarioNaoCadastradoEx | NumeroMaxEmpreEx  e) {
                                System.out.println("Erro ao emprestar livro: " + e.getMessage());
                                break;
                            }

                            
                            System.out.println(usuarioEmp);
                            System.out.println(livroEmp);
                            break;
                        case 3:
                            System.out.print("Digite o CPF do usuário: ");
                            String cpfDev = leitor.nextLine();
                            System.out.print("Digite o código do livro: ");
                            int codeDev = leitor.nextInt();
                            leitor.nextLine();
                            Livro livroDev;
                            Usuario usuarioDev;
                            try {
                                livroDev = biblioteca.getLivro(codeDev);
                                usuarioDev = biblioteca.getUsuario(cpfDev);
                                System.out.println("Livro devolvido\n");
                            } catch (LivroNaoCadastradoEx | UsuarioNaoCadastradoEx e) {
                                System.out.println("Erro ao emprestar livro: " + e.getMessage());
                                break;
                            }
                            biblioteca.devolveLivro(usuarioDev, livroDev, regra);
                            System.out.println(usuarioDev);
                            System.out.println(livroDev);
                            break;
                        default:
                            System.out.println("Opção inválida.");
                    }
                    break;

                case 4:
                    System.out.println("\n--- RELATÓRIOS ---");
                    System.out.println("1 - Listar livros");
                    System.out.println("2 - Listar usuários");
                    System.out.println("3 - Detalhes de um livro");
                    System.out.println("4 - Detalhes de um usuário");
                    int relatorioOp = leitor.nextInt();
                    leitor.nextLine();

                    switch (relatorioOp) {
                        case 1:
                            System.out.println(biblioteca.imprimeLivros());
                            break;
                        case 2:
                            System.out.println(biblioteca.imprimeUsuarios());
                            break;
                        case 3:
                            System.out.print("Digite o código do livro: ");
                            int codeLivro = leitor.nextInt();
                            leitor.nextLine();
                            Livro livro;
                            try {
                                livro = biblioteca.getLivro(codeLivro);
                            } catch (LivroNaoCadastradoEx e) {
                                System.out.println("Erro ao buscar livro: " + e.getMessage());
                                break;
                            }
                            System.out.println(livro);
                            break;
                        case 4:
                            System.out.print("Digite o CPF do usuário: ");
                            String cpf = leitor.nextLine();
                            Usuario usuario;
                            try {
                                usuario = biblioteca.getUsuario(cpf);
                            } catch (UsuarioNaoCadastradoEx e) {
                                System.out.println("Erro ao buscar usuário: " + e.getMessage());
                                break;
                            }
                            System.out.println(usuario);
                            break;
                        default:
                            System.out.println("Opção inválida.");
                    }
                    break;

                case 0:
                    System.out.println("Saindo do sistema. Até logo!");
                    break;

                default:
                    System.out.println("Opção inválida. Tente novamente.");
            }
        }
    }
}
