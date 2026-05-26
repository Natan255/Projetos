import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./MeusSquadsSide.css";

function MeusSquadsSide({ squads, idsSeguidos }) {
  
    const meusSquads = squads.filter(squad => idsSeguidos?.includes(squad.id));
    const navigate = useNavigate();
    return (
        <div className="meus-squads-side">
            {meusSquads.map(squad => (
                <Link key={squad.id} to={`/paginas/PerfilSquad/${squad.id}`} title={squad.nome}>
                    <div className="squad-mini-icon">
                        <img src={squad.fotoPerfil} alt={squad.nome} />
                    </div>
                </Link>
            ))}
            
            <Link to="/paginas/CadastrarSquad" className="btn-add-squad">+</Link>

            <div>
                <button className="btn-mensagens" onClick={() => navigate("../paginas/Mensagens")}>
                    💬
                </button>
            </div>
        </div>
    );
}

export default MeusSquadsSide;