import CardSquad from "../componentes/CardSquad"

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