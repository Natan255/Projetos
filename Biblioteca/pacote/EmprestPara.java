package pacote;
import java.time.LocalDate;
import java.util.Hashtable;
import java.io.Serializable;

public class EmprestPara implements Serializable {

    private LocalDate dataEmp;
    private LocalDate dataDev;
    private String cpf;

    public EmprestPara(LocalDate dataEmp, LocalDate dataDev, String cpf) {
        this.dataEmp = dataEmp;
        this.dataDev = dataDev;
        this.cpf = cpf;
    }

    public LocalDate getDataEmp() {
        return dataEmp;
    }

    public LocalDate getDataDev() {
        return dataDev;
    }

    public String getCpf() {
        return cpf;
    }

    @Override

    public String toString() {
        return "\nDataEmp: " + dataEmp + " | " + "DataDev: " + dataDev + " | " +"CPF: " + cpf + "||";
    }


}