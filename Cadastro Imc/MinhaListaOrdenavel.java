import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

public class MinhaListaOrdenavel {

    ArrayList<PessoaIMC> pessoas = new ArrayList<>();

    public void add(PessoaIMC pessoa) {
        pessoas.add(pessoa);
    }

    public PessoaIMC get(int index) {
        return pessoas.get(index);
    }

    public ArrayList ordena(int constante) {
        switch (constante) {
            case 0: // Z-A
                Collections.sort(pessoas, nomeC);
                Collections.reverse(pessoas);
                return pessoas;
            case 1: // A-Z
                Collections.sort(pessoas, nomeC);
                return pessoas;
            case 2: // Peso invrerso
                Collections.sort(pessoas, pesoC);
                Collections.reverse(pessoas);
                return pessoas;
            case 3: // Peso
                Collections.sort(pessoas, pesoC);
                return pessoas;
            case 4: // Gênero
                Collections.sort(pessoas, generoC);
                return pessoas;
            case 5: // Idade
                Collections.sort(pessoas, idadeC);
                return pessoas;
            case 6: // Idade inverso
                Collections.sort(pessoas, idadeC);
                Collections.reverse(pessoas);
                return pessoas;
            case 7: // Altura inverso
                Collections.sort(pessoas, alturaC);
                Collections.reverse(pessoas);
                return pessoas;
            case 8: // Altura
                Collections.sort(pessoas, alturaC);
                return pessoas;
            case 9: // IMC
                Collections.sort(pessoas, imcC);
                return pessoas;
            case 10: // IMC inverso
                Collections.sort(pessoas, imcC);
                Collections.reverse(pessoas);
                return pessoas;
            default:
                System.out.println("Opção inválida.");
                return null;
        }

    }

    public Comparator<PessoaIMC> nomeC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            String pf1, pf2;
            pf2 = p2.getnome();
            pf1 = p1.getnome();
            return pf1.compareTo(pf2);

        }
    };

    public Comparator<PessoaIMC> pesoC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            double pf1, pf2;
            pf2 = p2.getPeso();
            pf1 = p1.getPeso();
            return (int) Math.round(pf2 - pf1);

        }
    };

    public Comparator<PessoaIMC> alturaC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            // da maneira que eu estava comparando(que nem nas outras comparações) estava dando erro de comparação
            // mas ainda nao sei o motivo
            return Float.compare(p1.getAltura(), p2.getAltura());

        }
    };

    public Comparator<PessoaIMC> imcC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            double pf1, pf2;
            pf2 = p2.calcularIMC();
            pf1 = p1.calcularIMC();
            return (int) Math.round(pf2 - pf1);
        }
    };

    public Comparator generoC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            if (p1 instanceof Mulher && p2 instanceof Mulher) {
                return 0;

            } else if (p1 instanceof Homem && p2 instanceof Homem) {
                return 0;
            } else if (p1 instanceof Mulher && p2 instanceof Homem) {
                return -1; 
            } else if (p1 instanceof Homem && p2 instanceof Mulher) {
                return 1; 
            } else {
                return 0;
            }
        }
    };

    public Comparator<PessoaIMC> idadeC = new Comparator<PessoaIMC>() {
        public int compare(PessoaIMC p1, PessoaIMC p2) {
            int pf1, pf2;
            pf2 = p2.getIdade();
            pf1 = p1.getIdade();
            return (pf2 - pf1);

        }
    };

}
