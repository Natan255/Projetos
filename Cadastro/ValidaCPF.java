class ValidaCPF {

    boolean isCPF(String cpf) {

        int i, alg, digito, tamanho;
        char dig10, dig11;
        int peso = 10;
        int sm = 0;

        tamanho = cpf.length();

        

        if (tamanho != 11 && tamanho != 14) {
            return (false);
        }

        if (tamanho == 14) {
            if (cpf.charAt(3) == '.' && cpf.charAt(7) == '.' && (cpf.charAt(11) == '/' || cpf.charAt(11) == '-')) {
                cpf = cpf.replaceAll("[^\\d]", "");
            }else{
                return (false);
            }
            
        }

        for (i = 0; i < 9; i++) {
            alg = (int) (cpf.charAt(i)) - 48; // transforma o numero referente a tabela ascii
            sm = sm + (alg * peso);
            peso--;
        }
        digito = 11 - (sm % 11);

        if ((digito == 10) || (digito == 11)){
            dig10 = '0';
        }
        else {
            dig10 = (char) (digito + 48);
        }

        peso = 11;
        sm = 0;

        for (i = 0; i < 10; i++) {
            alg = (int) (cpf.charAt(i)) - 48;
            sm = sm + (alg * peso);
            peso--;
        }
        digito = 11 - (sm % 11);

        if ((digito == 10) || (digito == 11)){
            dig11 = '0';
        }
        else {
            dig11 = (char) (digito + 48); // pega na tabela ASCII o codigo dele
        }

        if ((dig10 == cpf.charAt(9)) && (dig11 == cpf.charAt(10))){
            //array com cpfs validos?
            return (true);
        }
        else {
            return (false);
        }

    }

    float toLong(String cpf){

        float numero = Long.parseLong(cpf);
        return numero;
    }
}