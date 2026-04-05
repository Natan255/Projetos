import "./UsuariosLista.css";
import { Link } from "react-router-dom";


function UsuariosLista({ id, nome, foto}) {
    return (
        <div className="usuariolist-container">
            <div className="usuariolist-foto">
                <img src={foto || "https://via.placeholder.com/150"} alt={nome} />
            </div>
            
            <div className="usuariolist-info">
                <Link to={`/perfil/${id}`} className="usuariolist-nome">
                    {nome}
                </Link>
            </div>

            {/* Aqui você pode passar "children" no futuro para botões de 'Remover' ou 'Seguir' */}
        </div>
    );
}

export default UsuariosLista;