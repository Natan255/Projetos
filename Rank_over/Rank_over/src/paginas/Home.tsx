import { useEffect, useState } from "react";
import CardSquad from "../componentes/CardSquad";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from "react-router-dom";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Home.css";
import PostSquad from "../componentes/PostSquad";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home({ squads, pesquisaQuery, usuario }) {
    const [postsGlobais, setPostsGlobais] = useState([]);
    const [filtroAtivo, setFiltroAtivo] = useState("novos"); 

    const squadsPopulares = squads.slice(0, 5);
    const banners = [
        "https://picsum.photos/id/15/1200/400",
        "https://picsum.photos/id/20/1200/400",
        "https://picsum.photos/id/30/1200/400"
    ];

    useEffect(() => {
        const postsRef = collection(db, "posts");
        const campoOrdenacao = filtroAtivo === "populares" ? "likes" : "criadoEm";
        
        const q = query(postsRef, orderBy(campoOrdenacao, "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPostsGlobais(lista);
        });

        return () => unsubscribe();
    }, [filtroAtivo]);

    return (
        <div className="home-container">
            {pesquisaQuery === "" ? (
                <div className="layout">
                    <main className="feed">
                        <div className="feed-filters">
                            <button 
                                className={filtroAtivo === "novos" ? "active" : ""} 
                                onClick={() => setFiltroAtivo("novos")}
                            >
                                ✨ Novos
                            </button>
                            <button 
                                className={filtroAtivo === "populares" ? "active" : ""} 
                                onClick={() => setFiltroAtivo("populares")}
                            >
                                🔥 Populares
                            </button>
                        </div>

                        <div className="posts-lista">
                            {postsGlobais.length > 0 ? (
                                postsGlobais.map((post) => {

                                    const squadDoPost = squads.find(s => s.id === post.idSquad);
                                    
                                    return (
                                        <PostSquad
                                            key={post.id}
                                            id={post.id}
                                            idAutor={post.idAutor || post.idUsuario}
                                            titulo={post.titulo}
                                            texto={post.texto}
                                            likes={post.likes || 0}
                                            comentarios={post.comentários || post.comentarios || 0}
                                            autor={post.nomeAutor}
                                            fotoAutor={post.fotoAutor}
                                            conquista={post.isConquista || post.conquista}
                                            jaDeuLike={post.jaDeuLike}
                                            aoDarLike={() => {
                                                console.log("Dar like no post:", post.id);
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <p className="feed-vazio">Nenhum post ativo na comunidade ainda.</p>
                            )}
                        </div>
                    </main>

                    <aside className="sidebar">
                        <div className="sidebar-banner">
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 4000 }}
                                loop={true}
                                style={{ width: '100%', height: '150px', borderRadius: '4px' }}
                            >
                                {banners.map((img, index) => (
                                    <SwiperSlide key={index}>
                                        <img src={img} alt={`Destaque ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <div className="sidebar-widget create-squad-widget">
                            <h3>Home do Rank Over</h3>
                            <p>Sua comunidade ativa de foco e produtividade. Veja o progresso global.</p>
                            <Link to="/paginas/CadastrarSquad">
                                <button className="btn-sidebar-action">Criar Meu Squad</button>
                            </Link>
                        </div>

                        <div className="sidebar-widget">
                            <h3 className="widget-title">Squads Populares</h3>
                            <div className="sidebar-squads-list">
                                {squadsPopulares.map((squad, index) => (
                                    <div key={squad.id} className="sidebar-squad-item">
                                        <span className="squad-index">{index + 1}</span>
                                        <Link to={`/squad/${squad.id}`} className="squad-item-link">
                                            {squad.nome}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <footer className="sidebar-footer">
                            <p>&copy; 2026 Rank Over. KLYMB Produtividade.</p>
                        </footer>
                    </aside>

                </div>
            ) : (

                <div className="secao_pesquisa">
                    <h3 className="titulo_secao">Resultados para: "{pesquisaQuery}"</h3>
                    <div className="squad_grid">
                        {squads
                            .filter((squad) => {
                                const nomeSquad = squad.nome ? squad.nome.toLowerCase() : "";
                                const busca = pesquisaQuery.toLowerCase();
                                return nomeSquad.includes(busca);
                            })
                            .map((squad) => (
                                <CardSquad card={squad} key={squad.id} />
                            ))
                        }
                        {squads.filter(s => s.nome?.toLowerCase().includes(pesquisaQuery.toLowerCase())).length === 0 && (
                            <p className="sem-resultados">Nenhum squad encontrado com esse nome.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;