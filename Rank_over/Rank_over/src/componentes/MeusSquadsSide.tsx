import { Link } from "react-router-dom";
import "./MeusSquadsSide.css"; // Estilize com border-radius 50% para ficar redondo

function MeusSquadsSide({ squads, idsSeguidos }) {
    // Filtramos apenas os squads que o usuário segue
    const meusSquads = squads.filter(squad => idsSeguidos?.includes(squad.id));

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
        </div>
    );
}

export default MeusSquadsSide;