import "./SeguidoresMensagem.css";
function SeguidoresMensagem({ usuario, onSelect, ativo }) {
    return (
        <div 
            className={`seguidores-lista ${ativo ? "ativo" : ""}`} 
            onClick={() => onSelect(usuario)}
            style={{ cursor: "pointer" }}
        >
            <div className="seguidor-foto">
                <img 
                    src={usuario?.fotoPerfil || "https://via.placeholder.com/150"} 
                    alt={usuario?.nome} 
                />
            </div>

            <div className="seguidor-nome">
                <p>{usuario?.nome || "Usuário"}</p>
            </div>
        </div>
    );
} 

export default SeguidoresMensagem;