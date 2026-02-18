import { Link, useNavigate } from "react-router-dom"
import "./Cardsquad.css"

function CardSquad({ card }) {
    const navigate = useNavigate(); // Hook para navegar via função

    // Opção 1: Se você quer que o botão execute uma lógica e DEPOIS mude de página
    function entrar() {
        console.log("Usuário solicitou entrada no squad:", card.nome);
        // Aqui você navega programaticamente
        navigate(`/paginas/PerfilSquad/${card.id}`);
    }

    return(
        <div className="card_squad">
            <p>{card.nome}</p>
            
            <div className="card_bg">
                <img src={card.url} alt={card.name} />
            </div>
            
            <div className="card_enter">
                <button onClick={entrar}>
                    Entrar
                </button>
            </div>

            <div className="card_info">
                <p>{card.info}</p>
            </div>
            
        </div>
    )
}

export default CardSquad