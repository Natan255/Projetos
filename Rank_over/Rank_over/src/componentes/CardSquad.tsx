import "./Cardsquad.css"

function CardSquad({card}){

    function entrar(){
        alert("FOiii")
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