import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar({ pesquisaQuery, setPesquisa, squads }) {

    return (
        <nav>
            <div className="logo">
                <Link to="/">
                    <img src="rank-lar.png" alt="Rank Over Logo" />
                </Link>
            </div>

            <form>
                <input type="text" placeholder="Pesquisa por squads..." value={pesquisaQuery} onChange={(e) => setPesquisa(e.target.value)} />
                <button type="submit">🔎</button>
            </form>

            <ul className="links">
                <li><Link to="">Home</Link></li>
                <li><Link to="/squads">Squads</Link></li>
                <li><Link to="/perfil">Cadastrar</Link></li>
                <li><Link to="/perfil">Entrar</Link></li>

            </ul>

        </nav>

    )
}

export default Navbar


