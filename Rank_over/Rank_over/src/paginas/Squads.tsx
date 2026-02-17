import CardSquad from "../componentes/CardSquad"

// O erro estava aqui: você esqueceu as chaves { } no parâmetro
function Squads({ squads }) { 
    return (
        <div className="squad_grid">
            {squads && squads.map((cards) => (
                <CardSquad card={cards} key={cards.id}/>
            ))}
        </div>
    )
}

export default Squads