package pacote;
import java.time.LocalDate;

import pacote.EnumData;

import java.io.Serializable;
//falta o loop pra quando der erro
// ver se coloca ano dentro do isDatavalida ou deixa ali

class ValidaData implements Serializable {
    int dia = 0;
    int mes = 0;
    int ano = Integer.MIN_VALUE;

    boolean isDia(int dia) {
        if (dia >= 1 && dia <= 31) {
            this.dia = dia;
            return true;
        } else {
            System.out.println("Dia invalido insira outro: ");
            return false;
        }
    }

    boolean isMes(String mes) {
        EnumData mensal;
        int teste;
        int numero = 0;

        try {
            numero = Integer.parseInt(mes); // tenta converter para int, caso de certo da true
            teste = 0;

        } catch (NumberFormatException e) {
            teste = 1;
        }
        if (teste == 1) { // caso de ser por exten

            try {
                mensal = EnumData.valueOf(mes); // passa o mes por extenso, caso seja valido nao da erro, pra converte o
                                                // string em seu int
                this.mes = mensal.numero();
                if (this.mes == 0 || this.mes == 1 || this.mes == 3 || this.mes == 5 || this.mes == 7 || this.mes == 8
                        || this.mes == 10 || this.mes == 12) {

                    if (dia >= 1 && dia <= 31) {
                        return (true);
                    } else {
                        System.out.println("Dia incompativel com o mes");
                        return (false);
                    }
                } else if (this.mes == 4 || this.mes == 6 || this.mes == 9 || this.mes == 11) {
                    if (dia >= 1 && dia <= 30) {
                        return (true);
                    } else {
                        return (false);
                    }
                } else if (this.mes == 2) {
                    if (dia >= 1 && dia <= 28) {
                        return (true);
                    } else {
                        System.out.println("Dia incompativel com o mes");
                        return (false);
                    }
                } else {
                    this.mes = 0;
                    System.out.println("Mes invalido insira outro: ");
                    return (false);
                }

            } catch (Exception e) {

                System.out.println("Mes invalido insira outro: ");
                return false;

            }
        } else {
            if (numero < 1 || numero > 12) {
                System.out.println("Mes invalido insira outro: ");
                return false;
            }
            this.mes = numero;

            if (this.mes == 0 || this.mes == 1 || this.mes == 3 || this.mes == 5 || this.mes == 7 || this.mes == 8
                    || this.mes == 10 || this.mes == 12) {

                if (dia >= 1 && dia <= 31) {
                    return (true);
                } else {
                    System.out.println("Dia incompativel com o mes");
                    return (false);
                }
            } else if (this.mes == 4 || this.mes == 6 || this.mes == 9 || this.mes == 11) {
                if (dia >= 1 && dia <= 30) {
                    return (true);
                } else {
                    return (false);
                }
            } else if (this.mes == 2) {
                if (dia >= 1 && dia <= 28) {
                    return (true);
                } else {
                    System.out.println("Dia incompativel com o mes");
                    return (false);
                }
            } else {
                this.mes = 0;
                System.out.println("Mes invalido insira outro: ");
                return (false);
            }

        }

    }

    boolean isAno(int ano) {
        if (LocalDate.now().getYear() - 120 <= ano || ano == Integer.MIN_VALUE) {

            this.ano = ano;
            return true;

        } else {
            System.out.println("Ano invalido insira outro: ");
            return false;

        }

    }

    boolean isDataValida(int dia, String mes, int ano) {
        int teste = 0;
        EnumData mensal;

        if (LocalDate.now().getYear() - 120 <= ano || ano == Integer.MIN_VALUE) {

            this.ano = ano;

        } else {
            System.out.println("Ano invalido insira outro: ");
            return false;

        }

        // converte o mes para int, caso seja por extenso ou inteiro
        try {
            int numero = Integer.parseInt(mes.toUpperCase()); // tenta converter para int, caso de certo da true
            this.mes = numero;
        } catch (NumberFormatException e) {
            teste = 1;
        }
        if (teste == 1) { // caso de ser por exten

            try {
                mensal = EnumData.valueOf(mes.toUpperCase()); // passa o mes por extenso, caso seja valido nao da erro,
                                                              // pra converte o
                // string em seu int
                this.mes = mensal.numero();

            } catch (Exception e) {

                System.out.println("Mes invalido insira outro: ");
                return false;

            }
        }

        // verifica se o mes e o dia estao dentro do intervalo
        if (this.mes == 0 || this.mes == 1 || this.mes == 3 || this.mes == 5 || this.mes == 7 || this.mes == 8
                || this.mes == 10 || this.mes == 12) {

            if (dia >= 1 && dia <= 31) {
                return (true);
            } else {
                System.out.println("Dia incompativel com o mes");
                return (false);
            }
        } else if (this.mes == 4 || this.mes == 6 || this.mes == 9 || this.mes == 11) {
            if (dia >= 1 && dia <= 30) {
                return (true);
            } else {
                return (false);
            }
        } else if (this.mes == 2) {
            if (dia >= 1 && dia <= 28) {
                return (true);
            } else {
                System.out.println("Dia incompativel com o mes");
                return (false);
            }
        } else {
            this.mes = 0;
            System.out.println("Mes invalido insira outro: ");
            return (false);
        }
    }

    public int getMes() {
        return this.mes;
    }

}