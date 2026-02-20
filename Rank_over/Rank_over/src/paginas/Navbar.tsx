import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar({ pesquisaQuery, setPesquisa, squads, usuario }) {

  
    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Pesquisando por:", pesquisaQuery);
    };

    return (
        <nav className="navbar-container">
            <div className="logo">
                <Link to="/">
                    <img src="../rank-lar.png" alt="Rank Over Logo" />
                </Link>
            </div>

            <form className="nav-search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="nav-search-input"
                    placeholder="Pesquisa por squads..."
                    value={pesquisaQuery}
                    onChange={(e) => setPesquisa(e.target.value)}
                />
                <button type="submit" className="nav-btn-search">🔎</button>
            </form>

            <ul className="links">
                <li><Link to="/">Home</Link></li>

                {usuario ? (

                    <>
                        <li><Link to="/paginas/Perfil">Meu Perfil</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/paginas/Cadastrar">Cadastrar</Link></li>
                        <li><Link to="/paginas/Entrar">Entrar</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;