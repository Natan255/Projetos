import { useNavigate } from "react-router-dom";
import "./SquadBusca.css";

function SquadBusca({ squadId, squadNome, squadImagem, apagarPesquisa }) {
    const navigate = useNavigate();
    
    const handleCardClick = () => {
        if (apagarPesquisa) apagarPesquisa();
        navigate(`/paginas/PerfilSquad/${squadId}`);
    };

    return (
        <div className="squad-busca-card" onClick={handleCardClick}>
            <div className="squad-busca-esquerda">
                <img 
                    src={squadImagem || "/default-squad.png"} 
                    alt={`${squadNome} Logo`} 
                    className="squad-busca-avatar"
                />
                 
                <div className="squad-busca-info">
                    <h4>{squadNome}</h4>                 
                </div>
            </div>
        </div>
    );
}

export default SquadBusca;