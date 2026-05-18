import "./UsuariosLista.css";
import { Link } from "react-router-dom";


function UsuariosLista({ id, nome, foto, acaoAceitar}) {
    return (
        <div className="usuariolist-container">
            <div className="usuariolist-foto">
                <img src={foto || "https://via.placeholder.com/150"} alt={nome} />
            </div>
            
            <div className="usuariolist-info">
                <Link to={`/paginas/perfil/${id}`} className="usuariolist-nome">
                    {nome}
                </Link>
            </div>

            {acaoAceitar && (
                <button className="btn-aceitar-squad" onClick={acaoAceitar}>
                    ✅ Aceitar
                </button>
            )}
        </div>
    );
}

export default UsuariosLista;