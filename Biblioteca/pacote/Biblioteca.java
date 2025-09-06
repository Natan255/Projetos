package pacote;

import java.io.*;
import java.time.LocalDate;
import java.util.Hashtable;
import java.util.Scanner;

import pacote.CopiaNaoDisponivelEx;
import pacote.Emprest;
import pacote.Livro;
import pacote.LivroNaoCadastradoEx;
import pacote.NenhumaCopiaEmprestadaEx;
import pacote.NumeroMaxEmpreEx;
import pacote.Regra;
import pacote.Usuario;
import pacote.UsuarioNaoCadastradoEx;

import java.util.ArrayList;
import java.util.Collections;

public class Biblioteca {

    private Hashtable<String, Usuario> usuarios;
    private Hashtable<Integer, Livro> livros;

    public Biblioteca() {
        usuarios = new Hashtable<>();
        livros = new Hashtable<>();
    }

    public Biblioteca(String arquivoUsuarios, String arquivoLivros) {
        try {
            ObjectInputStream inUsuarios = new ObjectInputStream(new FileInputStream(arquivoUsuarios));
            usuarios = (Hashtable<String, Usuario>) inUsuarios.readObject();
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Erro ao carregar usuários: " + e.getMessage());
            usuarios = new Hashtable<>();
        }

        try {
            ObjectInputStream inLivros = new ObjectInputStream(new FileInputStream(arquivoLivros));
            livros = (Hashtable<Integer, Livro>) inLivros.readObject();
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Erro ao carregar livros: " + e.getMessage());
            livros = new Hashtable<>();
        }
    }

    public void intanUsuario(Regra regra) {
        Scanner leitor = new Scanner(System.in);
        System.out.println("Digite o nome do usuário: ");
        String nome = leitor.nextLine();
        System.out.println("Digite o sobrenome do usuário: ");
        String sobrenome = leitor.nextLine();
        System.out.println("Digite o dia de nascimento do usuário: ");
        int dia = leitor.nextInt();
        System.out.println("Digite o mês de nascimento do usuário: ");
        String mes = leitor.next();
        System.out.println("Digite o ano de nascimento do usuário: ");
        int ano = leitor.nextInt();
        System.out.println("Digite o CPF do usuário:");
        leitor.nextLine();
        String cpf = leitor.nextLine();
        System.out.println("Digite o endereço do usuário: ");
        String endereco = leitor.nextLine();

        try {
            Usuario usuario = new Usuario(nome, sobrenome, dia, mes, ano, cpf, endereco, regra);
            cadastraUsuário(usuario);
        } catch (IllegalArgumentException e) {
            System.out.println("Erro ao cadastrar usuário: " + e.getMessage());
            System.out.println("Verifique os dados inseridos e tente novamente.");
            intanUsuario(regra);
            return; // Retorna se houver erro
        }

    }

    public void intanLivro() {
        Scanner leitor = new Scanner(System.in);
        System.out.println("Digite o código do livro: ");
        int code = leitor.nextInt();
        leitor.nextLine(); // Consumir a quebra de linha
        System.out.println("Digite o título do livro: ");
        String titulo = leitor.nextLine();
        System.out.println("Digite a categoria do livro: ");
        String categoria = leitor.nextLine();
        System.out.println("Digite a quantidade de cópias no acervo:  \n");
        int quantAcervo = leitor.nextInt();

        Livro livro = new Livro(code, titulo, categoria, quantAcervo, 0);
        cadastraLivro(livro);
    }

    public void cadastraUsuário(Usuario usuario) {
        if (usuarios.containsKey(usuario.getnumCPF())) {
            System.out.println("Usuário já cadastrado.");
        } else {
            usuarios.put(usuario.getnumCPF(), usuario);
            System.out.println("Usuário cadastrado.");
        }
    }

    public void cadastraLivro(Livro livro) {
        if (livros.containsKey(livro.getCode())) {
            System.out.println("Livro já cadastrado.");
        } else {
            livros.put(livro.getCode(), livro);
            System.out.println("Livro cadastrado.");
        }
    }

    public void salvarArquivo(Hashtable<?, ?> tabela, String nomeArquivo) {
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(nomeArquivo))) {
            out.writeObject(tabela);
            out.close();
            System.out.println("Dados salvos com sucesso em " + nomeArquivo);
        } catch (IOException e) {
            System.out.println("Erro ao salvar dados: " + e.getMessage());
        }
    }

    public void leArquivo(String nomeArquivo) {
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(nomeArquivo))) {
            Object obj = in.readObject();

            if (obj instanceof Hashtable) {
                Hashtable<?, ?> tabela = (Hashtable<?, ?>) obj;

                if (tabela.isEmpty()) {
                    System.out.println("Tabela lida de " + nomeArquivo + " está vazia.");
                    return;
                }

                Object umElemento = tabela.values().iterator().next();

                if (umElemento instanceof Usuario) {
                    usuarios = (Hashtable<String, Usuario>) tabela;
                    System.out.println("Cadastro de usuários carregado de " + nomeArquivo);
                } else if (umElemento instanceof Livro) {
                    livros = (Hashtable<Integer, Livro>) tabela;
                    System.out.println("Acervo de livros carregado de " + nomeArquivo);
                } else {
                    System.out.println("Tipo de elemento desconhecido na tabela.");
                }
            } else {
                System.out.println("Arquivo não contém uma Hashtable.");
            }

        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Erro ao ler arquivo: " + e.getMessage());
        }
    }

    public Livro getLivro(int code) throws LivroNaoCadastradoEx {
        Livro livro = livros.get(code);
        if (livro != null) {
            System.out.println("\n ");
            return livro;
        } else {
            throw new LivroNaoCadastradoEx("Livro com código " + code + " não cadastrado.");
        }
    }

    public Usuario getUsuario(String cpf) throws UsuarioNaoCadastradoEx {
        Usuario usuario = usuarios.get(cpf);
        if (usuario != null) {
            System.out.println("\n");
            return usuario;
        } else {
            throw new UsuarioNaoCadastradoEx("Usuário com CPF " + cpf + " não cadastrado.");
        }
    }

    public void emprestaLivro(Usuario user, Livro livro, Regra regras) throws NumeroMaxEmpreEx {
        try {
            livro.empresta();
            user.addLivroHist(LocalDate.now(), livro.getCode());
            livro.addUsuarioHist(LocalDate.now(), null, user.getnumCPF(), regras);
        } catch (CopiaNaoDisponivelEx e) {
            System.out.println("Erro ao emprestar livro, CPF ou Codigo invalido: " + e.getMessage());
        }
    }

    public void devolveLivro(Usuario user, Livro livro, Regra regras) {
        try {
            livro.devolve();
            Emprest hist = user.getHist();
            hist.setDataDev(LocalDate.now());
            user.dev();
            livro.addUsuarioHist(livro.getEmp(), LocalDate.now(), user.getnumCPF(), regras);

        } catch (NenhumaCopiaEmprestadaEx e) {
            System.out.println("Erro ao devolver livro: " + e.getMessage());
        }
    }

    public String imprimeLivros() {
        ArrayList<Integer> chaves = new ArrayList<>(livros.keySet());
        Collections.sort(chaves);
        StringBuilder s = new StringBuilder();
        for (int chave : chaves) {
            Livro livro = livros.get(chave);
            s.append(livro.getTitulo() + " - " + livro.getCode() + "\n");
        }
        return s.toString();

    }

    public String imprimeUsuarios() {
        ArrayList<String> chaves = new ArrayList<>(usuarios.keySet());
        Collections.sort(chaves);
        StringBuilder s = new StringBuilder();
        for (String chave : chaves) {
            Usuario usuario = usuarios.get(chave);
            s.append(usuario.getnome() + " " + usuario.getsobreNome() + " - " + usuario.getnumCPF() + "\n");
        }
        return s.toString();
    }

    public void mudaRegra(Regra regra) {
        for (Usuario usuario : usuarios.values()) {
            usuario.setRegra(regra);
        }
        ;
    }

    public Hashtable<String, Usuario> getHashUser() {
        return usuarios;
    }

    public Hashtable<Integer, Livro> getHashLivro() {
        return livros;
    }

}
