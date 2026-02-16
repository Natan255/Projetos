import CardSquad from "../componentes/CardSquad";
import Home from "./Home";
import "./Navbar.css";

function Navbar({pesquisaQuery, setPesquisa, squads}) {

    const pesquisar = () => {
        <Home squads={squads} pesquisaQuery={pesquisaQuery} />
    };

    return (
        <nav>
            <div className="logo">
                <h1>Rank Over</h1>
            </div>
            
            <form onSubmit={pesquisar}>
                <input type="text" placeholder="Pesquisa por squads..." value={pesquisaQuery} onChange={(e) => setPesquisa(e.target.value)} />
                <button type="submit">🔎</button>
            </form>

            <ul className="links">
                <li><a href="/">Home</a></li>
                <li><a href="/Squad">Squad</a></li>
                <li><a href="/Perfil">Perfil</a></li>
            </ul>

        </nav>

    )
}

export default Navbar


