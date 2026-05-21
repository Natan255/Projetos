import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import MeusSquadsSide from "../componentes/MeusSquadsSide";

function Navbar({ pesquisaQuery, setPesquisa, squads, usuario }) {
    const [idsSeguidos, setIdsSeguidos] = useState([]);
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const toggleSidebar = () => setSidebarAberta(!sidebarAberta);

    useEffect(() => {
        if (!usuario) {
            setIdsSeguidos([]);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, "usuarios", usuario.uid), (doc) => {
            if (doc.exists()) {
                setIdsSeguidos(doc.data().squads_seguindo || []);
            }
        });

        return () => unsubscribe();
    }, [usuario]);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Pesquisando por:", pesquisaQuery);
    };

    return (
        <>
            <nav className="navbar-container">
                <div className="nav-lado-esquerdo">
                    <button className="btn-menu" onClick={toggleSidebar}>
                        {sidebarAberta ? "✕" : "☰"}
                    </button>

                    <div className="logo">
                        <Link to="/">
                            <img src="/ofc2.png" alt="Rank Over Logo"/>
                        </Link>
                    </div>
                </div>

                <form className="nav-search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="nav-search-input"
                        placeholder="Pesquisar por squads..."
                        value={pesquisaQuery}
                        onChange={(e) => setPesquisa(e.target.value)}
                    />
                    <button type="submit" className="nav-btn-search">🔎</button>
                </form>

                <ul className="links">
                    <li><Link to="/">Home</Link></li>

                    {usuario ? (
                        <li><Link to="/paginas/Perfil" className="link-destaque">Meu Perfil</Link></li>
                    ) : (
                        <>
                            <li><Link to="/paginas/Cadastrar">Cadastrar</Link></li>
                            <li><Link to="/paginas/Entrar" className="link-entrar-destaque">Entrar</Link></li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Sidebar Lateral */}
            <div className={`navside ${sidebarAberta ? "ativa" : ""}`}>
                {usuario && <MeusSquadsSide squads={squads} idsSeguidos={idsSeguidos} />}
            </div>

            {/* Overlay para escurecer o fundo quando a sidebar abrir */}
            {sidebarAberta && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Navbar;