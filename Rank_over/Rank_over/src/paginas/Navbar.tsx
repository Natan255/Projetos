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
        <nav className="navbar-container">
            <button className="btn-menu" onClick={toggleSidebar}>
                {sidebarAberta ? "✕" : "☰"}
            </button>

            <div className={`navside ${sidebarAberta ? "ativa" : ""}`}>
                {usuario && <MeusSquadsSide squads={squads} idsSeguidos={idsSeguidos} />}
            </div>
            
            <div className="logo">
                <Link to="/">
                    <img src="/kk.png" alt="Rank Over Logo"/>
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