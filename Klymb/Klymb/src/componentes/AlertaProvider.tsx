import { createContext, useContext, useState, ReactNode } from "react";
import "./AlertaMsg.css";

//puramente ia aqui. eu nao fiz nada
// ==========================================================================
// 1. O COMPONENTE VISUAL DO ALERTA (O HTML QUE ESTAVA SUMIDO)
// ==========================================================================
interface AlertaProps {
    MsgTitulo: string;
    Msg: string;
    textoBotao?: string; 
    aoClicar?: () => void; 
    fechar?: () => void;
}

function AlertaMsg({ MsgTitulo, Msg, textoBotao, aoClicar, fechar }: AlertaProps) {
    return (
        <div className="alertamsg-container">
            <div className="alerta-card">
                {fechar && (
                    <button className="btn-fechar-x" onClick={fechar}>
                        &times;
                    </button>
                )}

                <h1>{MsgTitulo}</h1>
                <p>{Msg}</p>
                
                {aoClicar && (
                    <button onClick={aoClicar} className="btn-alerta">
                        {textoBotao || "Entendi"} 
                    </button>
                )}
            </div>
        </div>
    );
}

// ==========================================================================
// 2. A ESTRUTURA DO CONTEXTO GLOBAL
// ==========================================================================
interface AlertaContextData {
    exibirAlerta: (titulo: string, mensagem: string, textoBtn?: string, acao?: () => void) => void;
    fecharAlerta: () => void;
}

const AlertaContext = createContext<AlertaContextData>({} as AlertaContextData);

export function AlertaProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<{
        visivel: boolean;
        titulo: string;
        mensagem: string;
        textoBtn?: string;
        aoClicar?: () => void;
    }>({
        visivel: false,
        titulo: "",
        mensagem: "",
    });

    const exibirAlerta = (titulo: string, mensagem: string, textoBtn?: string, acao?: () => void) => {
        setConfig({
            visivel: true,
            titulo,
            mensagem,
            textoBtn,
            aoClicar: acao,
        });
    };

    const fecharAlerta = () => {
        setConfig((prev) => ({ ...prev, visivel: false }));
    };

    const handleAcaoBotao = () => {
        if (config.aoClicar) config.aoClicar();
        fecharAlerta();
    };

    return (
        <AlertaContext.Provider value={{ exibirAlerta, fecharAlerta }}>
            {children}
            
            {/* Aqui ele renderiza a função AlertaMsg criada ali no topo do arquivo */}
            {config.visivel && (
                <AlertaMsg
                    MsgTitulo={config.titulo}
                    Msg={config.mensagem}
                    textoBotao={config.textoBtn}
                    aoClicar={handleAcaoBotao}
                    fechar={fecharAlerta}
                />
            )}
        </AlertaContext.Provider>
    );
}

// Hook para usar nas páginas (ex: const { exibirAlerta } = useAlerta())
export function useAlerta() {
    return useContext(AlertaContext);
}

export default AlertaProvider;