import "./AlertaMsg.css"

interface AlertaProps {
    MsgTitulo: string;
    Msg: string;
    textoBotao?: string; 
    aoClicar?: () => void; 
}

function AlertaMsg({ MsgTitulo, Msg, textoBotao, aoClicar }: AlertaProps) {
    return (
        <div className="alertamsg-container">
            <div className="alerta-card">
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

export default AlertaMsg;