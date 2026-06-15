import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from "react-router-dom";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Home.css";
import PostSquad from "../componentes/PostSquad";
import PostVotacaoSquad from "../componentes/VotoSquad";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home({ squads, usuario }) { // Removida a prop pesquisaQuery que não é mais usada aqui
    const [postsGlobais, setPostsGlobais] = useState([]);
    const [filtroAtivo, setFiltroAtivo] = useState("novos"); 

    const squadsPopulares = squads.slice(0, 5);
    const banners = [
        "kk.png",
        "ofc2.png",
        "kll.png"
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
                                const euCurti = post.quemDeuLike?.includes(usuario?.uid);
                                
                                if (post.tipo === "conquistaVoto") {
                                    return (
                                        <PostVotacaoSquad 
                                            key={post.id}
                                            id={post.id}
                                            idAutor={post.idAutor || post.idUsuario}
                                            titulo={post.titulo}
                                            texto={post.texto}
                                            autor={post.nomeAutor}
                                            fotoAutor={post.fotoAutor}
                                            squadId={post.idSquad}
                                            votosPositivos={post.votosPositivos || []}
                                            votosNegativos={post.votosNegativos || []}
                                            statusVotacao={post.statusVotacao || "aberta"}
                                            usuario={usuario == null ? null : usuario}
                                            likes={post.likes}
                                            comentarios={post.comentarios}
                                            jaDeuLike={euCurti}
                                            aoDarLike={() => gerenciarLike(post.id, euCurti)}
                                            encerraEm={post.encerraEm}
                                            rankingComputado={post.rankingComputado || false}
                                        />
                                    );
                                }
                                
                                const conq = post.tipo?.includes("conquista");
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
                                        imagemPost={post.imagemPost}
                                        fotoAutor={post.fotoAutor}
                                        conquista={conq}
                                        squadId={post.idSquad}
                                        usuarioId={usuario?.uid}
                                        quemDeuLike={post.quemDeuLike || []}
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
                                    <Link to={`/paginas/PerfilSquad/${squad.id}`} className="squad-item-link">
                                        {squad.nome}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <footer className="sidebar-footer">
                        <p>&copy; 2026 KLYMB Produtividade.</p>
                    </footer>
                </aside>
            </div>
        </div>
    );
}

export default Home;