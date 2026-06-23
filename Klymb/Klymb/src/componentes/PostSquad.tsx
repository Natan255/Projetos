import { useState, useEffect } from "react";
import { storage } from "../firebaseConfig"; 
import { ref, deleteObject } from "firebase/storage";
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
    autor: string;     // Fica como fallback caso o usuário não seja encontrado
    fotoAutor: string; // Fica como fallback
    tipo?: "conquista" | "colecaoCompartilhada" | string | null; // Adaptado para receber os múltiplos tipos dinâmicos
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
    tipo = null, 
    squadId = null, 
    usuarioId = null,
    quemDeuLike = [] 
}: PostSquadProps) {
    
    const navigate = useNavigate();
    const [dadosSquad, setDadosSquad] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    const [menuAberto, setMenuAberto] = useState(false);
    const [zoomAberto, setZoomAberto] = useState(false);
    
    // --- NOVO ESTADO PARA O AUTOR ATUALIZADO ---
    const [dadosAutor, setDadosAutor] = useState<{ nome?: string; fotoUrl?: string } | null>(null);

    useEffect(() => {
        // 1. Buscar dados do Squad e Ranking se houver squadId
        if (squadId) {
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
        }

        // --- NOVA BUSCA: DADOS DO AUTOR EM TEMPO REAL ---
        if (idAutor) {
            const buscarDadosDoAutor = async () => {
                try {
                    const userRef = doc(db, "usuarios", idAutor); // Ajuste "usuarios" para o nome exato da sua coleção
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setDadosAutor(userSnap.data());
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados atualizados do autor:", error);
                }
            };
            buscarDadosDoAutor();
        }

    }, [squadId, idAutor]);

    if (!titulo && !texto) return null;

    const verPerfil = () => {
        navigate(`/paginas/Perfil/${idAutor}`); 
    };

    const deletarPost = async () => {
        const confirmar = window.confirm("Tem certeza que deseja deletar este post?");
        if (!confirmar) return;

        try {
            if (imagemPost) {
                try {
                    const imagemRef = ref(storage, imagemPost);
                    await deleteObject(imagemRef);
                    console.log("Imagem deletada do Storage com sucesso.");
                } catch (storageError) {
                    console.error("Erro ao deletar imagem do Storage (ou ela não existe mais):", storageError);
                }
            }

            const postref = doc(db, "posts", id);
            await deleteDoc(postref);
            window.location.reload(); 

        } catch (error) {
            console.error("Erro ao deletar post:", error);
            alert("Erro ao tentar deletar o post.");
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

    // --- VARIÁVEIS COM FALLBACK ---
    const fotoExibicao = dadosAutor?.fotoUrl || fotoAutor || "https://via.placeholder.com/40";
    const nomeExibicao = dadosAutor?.nome || autor || "Membro";

    // Retorna a classe CSS específica baseada no tipo do Post
    const obterClassePorTipo = () => {
        if (tipo === "conquista") return "post-conquista";
        if (tipo === "colecaoCompartilhada") return "post-colecao-compartilhada";
        return "";
    };

    // Altera dinamicamente o prefixo visual do título do post
    const renderizarTituloComIcone = () => {
        if (tipo === "conquista") return `🏆 ${titulo}`;
        if (tipo === "colecaoCompartilhada") return `📦 ${titulo}`; // Ícone sugestivo para coleções/itens
        return titulo;
    };

    return (
        <div className={`Estrutura_post ${obterClassePorTipo()}`}>

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
            
            {/* Renderização com os dados dinâmicos do autor */}
            <div className="Foto_perfil" onClick={verPerfil} style={{cursor: "pointer"}}>
                <img src={fotoExibicao} alt="foto perfil" />
                <p>{nomeExibicao}</p>
            </div>

            {/* Conteúdo do Post com clique para expandir */}
            <div className="Conteudo_Post" onClick={() => navigate(`/post/${id}`)}>
                <h1>{renderizarTituloComIcone()}</h1>
                <p>{texto}</p>
                
                {imagemPost && (
                    <div 
                        className="Imagem_Post_Container" 
                        onClick={(e) => e.stopPropagation()}
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