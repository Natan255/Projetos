package pacote;
import java.time.LocalDate;
import java.util.ArrayList;

import pacote.CopiaNaoDisponivelEx;
import pacote.Emprest;
import pacote.EmprestPara;
import pacote.NenhumaCopiaEmprestadaEx;
import pacote.Regra;

import java.io.Serializable;

public class Livro implements Serializable {
    private static final long serialVersionUID = 1L;
    private int code;
    private String titulo;
    private String categoria;
    private int quantAcervo;
    private int Emprestados;
    private LocalDate dataDev;
    private LocalDate dataEmp;  
    private ArrayList<EmprestPara> hist = new ArrayList<>();

    public Livro(int code, String titulo, String categoria, int quantAcervo, int Emprestados) {
        this.code = code;
        this.titulo = titulo;
        this.categoria = categoria;
        this.quantAcervo = quantAcervo;
        this.Emprestados = 0;

    }
    public Livro() {
        
    }

    public void empresta() throws CopiaNaoDisponivelEx {
        if (quantAcervo > 0) {
            Emprest novoEmprestimo = new Emprest(LocalDate.now(), null, code);
            Emprestados++;
            quantAcervo--;
            
        } else {
            throw new CopiaNaoDisponivelEx("Não há cópias disponíveis para o livro");
        }
    }

    public void devolve() throws NenhumaCopiaEmprestadaEx { 
        if (Emprestados > 0) {
            Emprestados--;
            quantAcervo++;
        } else {
            throw new NenhumaCopiaEmprestadaEx("Nenhuma cópia do livro foi emprestada.");
        }
        

    }

    public void addUsuarioHist(LocalDate dataEmp, LocalDate dataDev, String cpf, Regra regra) {
        EmprestPara emprestado = new EmprestPara(dataEmp, dataDev, cpf);
        this.dataEmp = dataEmp;
        hist.add(emprestado);
        if (dataDev == null) {
            this.dataDev = null;

        } else if (dataDev.isAfter(this.dataEmp.plusDays(regra.getDiasSemMulta()))) { 

            this.dataDev = dataDev;
            System.out.println("O usuario deve ser multado pelo atraso a devolução.");

        }else {
            this.dataDev = dataDev;
        }

    }

    public LocalDate getEmp() {
        
        return dataEmp;
    }

    public LocalDate getDev() {

        if (dataDev == null) {
            System.out.println("O livro ainda não foi devolvido.");
            return null;
        }else {
            return dataDev;
        }

    }
    public int getCode() {
        return code;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getCategoria() {
        return categoria;
    }   

    public int getQuantAcervo() {
        return quantAcervo;
    }

    public int getEmprestados() {
        return Emprestados;
    }

    public String toString() {

        return  "-------------------------------\n" +
                "Livro" + "\n" +
                "Code: " + code + "\n" +
                "Titulo: " + titulo + "\n" + 
                "Categoria: " + categoria + "\n" +
                "QuantAcervo: " + quantAcervo + "\n" +
                "Emprestados: "+ Emprestados + "\n" +
                "Histórico de Empréstimos: " + hist + "\n" +
                "-------------------------------\n";
        
    }

}
