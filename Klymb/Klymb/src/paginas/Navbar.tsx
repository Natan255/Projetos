import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import MeusSquadsSide from "../componentes/MeusSquadsSide";
import SquadBusca from "../componentes/SquadBusca";

function Navbar({ pesquisaQuery, setPesquisa, squads, usuario }) {
    const [idsSeguidos, setIdsSeguidos] = useState([]);
    const [sidebarAberta, setSidebarAberta] = useState(false);
    
    const toggleSidebar = () => setSidebarAberta(!sidebarAberta);
    const fecharSidebar = () => setSidebarAberta(false);

    useEffect(() => {
        // Se não houver usuário, limpa o estado e garante que não há listener ativo
        if (!usuario) {
            setIdsSeguidos([]);
            return;
        }

        // Criamos o listener apenas se o usuário existir
        const unsubscribe = onSnapshot(doc(db, "usuarios", usuario.uid), (docSnap) => {
            if (docSnap.exists()) {
                setIdsSeguidos(docSnap.data().squads_seguindo || []);
            }
        });

        // Esta função de retorno SEMPRE limpa o listener anterior quando o usuário muda ou desloga
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
                        {/* Limpa a pesquisa ao clicar na logo para voltar ao início */}
                        <Link to="/" onClick={() => { setPesquisa(""); fecharSidebar(); }}>
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
                    <li>
                        <Link to="/" onClick={() => { setPesquisa(""); fecharSidebar(); }}>Home</Link>
                    </li>

                    {usuario ? (
                        <li>
                            <Link to="/paginas/Perfil" className="link-destaque" onClick={fecharSidebar}>
                                Meu Perfil
                            </Link>
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link to="/paginas/Cadastrar" onClick={fecharSidebar}>Cadastrar</Link>
                            </li>
                            <li>
                                <Link to="/paginas/Entrar" className="link-entrar-destaque" onClick={fecharSidebar}>
                                    Entrar
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Sidebar Lateral */}
            <div className={`navside ${sidebarAberta ? "ativa" : ""}`}>
                {usuario && <MeusSquadsSide squads={squads} idsSeguidos={idsSeguidos} />}
            </div>
            
            {/* 🎯 CONDICIONAL: Só renderiza a área abaixo se houver texto digitado (removendo espaços em branco) */}
            {pesquisaQuery.trim() !== "" && (
                <div className="secao_pesquisa">
                    <h3 className="titulo_secao">Resultados para: "{pesquisaQuery}"</h3>
                        
                    <div className="squad_lista_busca">
                        {squads
                            .filter((squad) => {
                                const nomeSquad = squad.nome ? squad.nome.toLowerCase() : "";
                                const busca = pesquisaQuery.toLowerCase();
                                return nomeSquad.includes(busca);
                            })
                            .map((squad) => (
                                <SquadBusca 
                                    key={squad.id}
                                    squadId={squad.id} 
                                    squadNome={squad.nome} 
                                    squadImagem={squad.fotoPerfil || squad.imagem}
                                    apagarPesquisa={() => setPesquisa("")}
                                />
                            ))
                        }
                            
                        {squads.filter(s => s.nome?.toLowerCase().includes(pesquisaQuery.toLowerCase())).length === 0 && (
                            <p className="sem-resultados">Nenhum squad encontrado com esse nome.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Overlay para escurecer o fundo */}
            {sidebarAberta && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Navbar;