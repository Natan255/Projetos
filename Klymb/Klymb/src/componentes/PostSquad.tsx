import { useState, useEffect } from "react";
import "./CardItem.css";
import "./PostSquad.css";
import { useNavigate } from "react-router-dom";
import { doc, collection, getDoc, getDocs, deleteDoc, updateDoc, arrayRemove, arrayUnion, increment } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { createPortal } from "react-dom"; // Importado corretamente para isolar o modal

interface PostSquadProps {
    id: string;
    idAutor: string;
    titulo: string;
    texto: string;
    imagemPost?: string;
    likes: number;
    comentarios?: number;
    autor: string;
    fotoAutor: string;
    conquista: boolean;
    squadId?: string | null;
    usuarioId?: string | null;
    quemDeuLike?: string[];
}

function PostSquad({
    id, 
    idAutor, 
    titulo, 
    texto, 
    imagemPost = "", 
    likes, 
    comentarios, 
    autor, 
    fotoAutor, 
    conquista, 
    squadId = null, 
    usuarioId = null,
    quemDeuLike = [] 
}: PostSquadProps) {
    
    const navigate = useNavigate();
    const [dadosSquad, setDadosSquad] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    const [menuAberto, setMenuAberto] = useState(false);
    const [zoomAberto, setZoomAberto] = useState(false);

    useEffect(() => {
        if (!squadId) return;

        const buscarDadosDoSquad = async () => {
            try {
                const squadRef = doc(db, "squads", squadId);
                const squadSnap = await getDoc(squadRef);
                
                if (squadSnap.exists()) {
                    setDadosSquad(squadSnap.data());
                }

                const rankRef = collection(db, "squads", squadId, "ranking");
                const querySnapshot = await getDocs(rankRef);
                const listaRank = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRanking(listaRank);

            } catch (error) {
                console.error("Erro ao buscar dados do Squad/Ranking:", error);
            }
        };

        buscarDadosDoSquad();
    }, [squadId]);

    if (!titulo && !texto) return null;

    const verPerfil = () => {
        navigate(`/paginas/Perfil/${idAutor}`); 
    };

    const deletarPost = async () => {
        try {
            const postref = doc(db, "posts", id);
            await deleteDoc(postref);
            alert("Post deletado com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar post:", error);
        }
    };

    const fixarPost = async () => {
        try {
            const postref = doc(db, "posts", id);
            const postSnap = await getDoc(postref);
            if (postSnap.exists()) {
                const postData = postSnap.data();
                await updateDoc(postref, { fixado: !postData?.fixado });
            }
        } catch (error) {
            console.error("Erro ao fixar/desfixar post:", error);
        }
    };

    const gerenciarLike = async () => {
        if (!usuarioId) return alert("Logue para curtir!");   
        
        const jaDeuLike = quemDeuLike?.includes(usuarioId); 
        const postRef = doc(db, "posts", id); 
        
        try {
            if (jaDeuLike) {
                await updateDoc(postRef, {
                    quemDeuLike: arrayRemove(usuarioId),
                    likes: increment(-1)
                });
            } else {
                await updateDoc(postRef, {
                    quemDeuLike: arrayUnion(usuarioId),
                    likes: increment(1)
                });
            }
        } catch (error) {
            console.error("Erro ao processar like:", error);
        }
    };

    const usuarioJaCurtiu = usuarioId ? quemDeuLike.includes(usuarioId) : false;

    return (
        <div className={`Estrutura_post ${conquista ? 'post-conquista' : ''}`}>

            {squadId !== null && dadosSquad && (
                <div className="Header_squad_info">
                    <div className="Foto_squad" onClick={() => navigate(`/paginas/PerfilSquad/${squadId}`)} style={{ cursor: 'pointer' }}>
                        <img src={dadosSquad.fotoPerfil || "https://via.placeholder.com/40"} alt="foto squad" />
                        <p>{dadosSquad.nome || "Squad"}</p>
                    </div>

                    <div className="ranking-squad">
                        {ranking.slice(0, 3).map((membro, index) => (
                            <span key={membro.id} className="mini-badge-rank" onClick={() => navigate(`/paginas/Perfil/${membro.id}`)} style={{ cursor: 'pointer' }}>
                                #{index + 1} {membro.nome}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="Foto_perfil" onClick={verPerfil} style={{cursor: "pointer"}}>
                <img src={fotoAutor || "https://via.placeholder.com/40"} alt="foto perfil" />
                <p>{autor || "Membro"}</p>
            </div>

            {/* Conteúdo do Post com clique para expandir */}
            <div className="Conteudo_Post" onClick={() => navigate(`/post/${id}`)}>
                <h1>{conquista ? `🏆 ${titulo}` : titulo}</h1>
                <p>{texto}</p>
                
                {imagemPost && (
                    <div 
                        className="Imagem_Post_Container" 
                        onClick={(e) => e.stopPropagation()}
                        /* Injeta a imagem na variável do CSS para o blur do feed */
                        style={{ "--feed-blur-img": `url(${imagemPost})` } as React.CSSProperties}
                    >
                        <img 
                            src={imagemPost} 
                            className="imagem-anexo-post post-imagem-midia" 
                            onClick={() => setZoomAberto(true)}
                            alt="Imagem da publicação" 
                            title="Clique para ampliar"
                            loading="lazy"
                        />
                    </div>
                )}
            </div>

            <div className="Botoes_interacoes">
                <button 
                    className={`btn_interacao btn_like ${usuarioJaCurtiu ? 'ativo' : ''}`} 
                    onClick={gerenciarLike}
                >
                    <span className="icon">{usuarioJaCurtiu ? "❤️" : "🤍"}</span>
                    <span className="count">{likes}</span>
                </button>

                <button className="btn_interacao btn_comment" onClick={() => navigate(`/post/${id}`)} >
                    <span className="icon">💬</span>
                    <span className="count">{comentarios || 0}</span>
                </button>

                <div className="container-opcoes-wrapper">
                    <button className="btn_interacao btn_opcoes" onClick={() => setMenuAberto(!menuAberto)}>
                        <div className="tres-pontos-container">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>

                    {menuAberto && (
                        <div className="menu-dropdown-opcoes">
                            {dadosSquad?.idCriador === usuarioId && (
                                <>
                                    <button onClick={() => { deletarPost(); setMenuAberto(false); }}>
                                        Deletar Post (Admin)
                                    </button>

                                    <button onClick={() => { fixarPost(); setMenuAberto(false); }}>
                                        Fixar Post
                                    </button>
                                </>
                            )}

                            {idAutor === usuarioId && (
                                <button onClick={() => { /* sua lógica de edição */ setMenuAberto(false); }}>
                                    Editar Post
                                </button>
                            )}
                            
                            <button onClick={() => { setMenuAberto(false); }}>
                                Reportar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL AJUSTADO: Utiliza Portal para renderizar na raiz da página e passa o background por propriedade customizada */}
            {zoomAberto && createPortal(
                <div 
                    className="zoom-overlay" 
                    onClick={() => setZoomAberto(false)}
                    style={{ "--bg-blur-img": `url(${imagemPost})` } as React.CSSProperties}
                >
                    <span className="zoom-fechar">&times;</span>
                    <img 
                        src={imagemPost} 
                        alt="Imagem ampliada" 
                        className="zoom-imagem-expandida" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>,
                document.body
            )}
        </div>
    );
}

export default PostSquad;