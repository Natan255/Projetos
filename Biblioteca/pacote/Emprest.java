package pacote;

import java.time.LocalDate;
import java.io.Serializable;
public class Emprest implements Serializable {
    private LocalDate dataEmp;
    private LocalDate dataDev;
    private int code;

    public Emprest(LocalDate dataEmp, LocalDate dataDev, int code) {
        this.dataEmp = dataEmp;
        this.dataDev = dataDev;
        this.code = code;
    }

    public void setDataDev(LocalDate dataDev) {
        this.dataDev = dataDev;
    }

    public void setDataEmp(LocalDate dataEmp) {
        this.dataEmp = dataEmp;
        
    }

    public String toString() {

        return "\nDataEmp: " + dataEmp + " | " + "DataDev: " + dataDev + " | " +"Codigo: " + code + "||";
    }

}
