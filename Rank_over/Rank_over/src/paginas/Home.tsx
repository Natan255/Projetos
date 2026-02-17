import CardSquad from "../componentes/CardSquad"
import "./Home.css"
function Home({ squads, pesquisaQuery }) {


    return (
        <div className="home">
            {pesquisaQuery === "" ? (
                <>
                    <div className="Banner">
                        <img src="https://picsum.photos/id/15/1200/400" alt="Banner" />
                    </div>
                    <div className="Descricao">
                        <h2>Bem-vindo ao Rank Over!</h2>
                        <p>Descubra os melhores squads e jogadores do cenário competitivo de Free Fire.</p>
                    </div>
                </>

            ) : (
                <div className="squad_grid">
                    {squads.map((cards) => cards.nome.toLowerCase().includes(pesquisaQuery) && (
                        <CardSquad card={cards} key={cards.id} />
                    ))}
                </div>
            )}

        </div>
    )

}

export default Home