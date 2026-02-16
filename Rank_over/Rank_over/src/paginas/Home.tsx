import CardSquad from "../componentes/CardSquad"

function Home({ squads, pesquisaQuery }) {


    return (
        <div className="home">
            {pesquisaQuery === "" ? (
                <>
                    <div className="Banner">
                        <img src="kali-ascii.png" alt="Banner" />
                    </div>
                    <div>
                        <h2>Bem-vindo ao Rank Over!</h2>
                        <p>Descubra os melhores squads e jogadores do cenário competitivo de Free Fire.</p>
                    </div>
                </>

            ) : (
                <div className="squad_grid">
                    {squads.map((cards) => cards.nome.toLowerCase().startsWith(pesquisaQuery) && (
                        <CardSquad card={cards} key={cards.id} />
                    ))}
                </div>
            )}

        </div>
    )

}

export default Home