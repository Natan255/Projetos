import { useState, useEffect } from "react";
import "./Cardsquad.css";
import "./PostSquad.css";
import { useNavigate } from "react-router-dom";
import { doc, collection, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";


function PostSquad({id, idAutor, titulo, texto, likes, comentarios, autor, fotoAutor, conquista, jaDeuLike, aoDarLike, squadId = null}) {
    const navigate = useNavigate();
    const [dadosSquad, setDadosSquad] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    useEffect(() => {
        // Só busca os dados se o squadId for passado
        if (!squadId) return;

        const buscarDadosDoSquad = async () => {
            try {
                // 1. Pegando os dados do Squad (Nome e Foto)
                const squadRef = doc(db, "squads", squadId);
                const squadSnap = await getDoc(squadRef);
                
                if (squadSnap.exists()) {
                    setDadosSquad(squadSnap.data());
                }

                // 2. Pegando a subcoleção de Ranking desse Squad
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
    }, [squadId]); // Executa sempre que o squadId mudar


    if (!titulo && !texto) return null;

    const verPerfil = () => {
        navigate(`/paginas/Perfil/${idAutor}`); 
    };

    return (
        <div className={`Estrutura_post ${conquista ? 'post-conquista' : ''}`}>

            {squadId !== null && dadosSquad && (
                <div className="Header_squad_info">
                    <div className="Foto_squad" onClick={() => navigate(`/paginas/PerfilSquad/${squadId}`)} style={{ cursor: 'pointer' }}>
                        <img src={dadosSquad.fotoPerfil || "https://via.placeholder.com/40"} alt="foto squad" />
                        <p>{dadosSquad.nome || "Squad"}</p>
                    </div>

                    <div className="ranking-squad">
                        {/* Exemplo simples de como renderizar o ranking que veio do banco */}
                        {ranking.slice(0, 3).map((membro, index) => (
                            <span key={membro.id} className="mini-badge-rank">
                                #{index + 1} {membro.nome || membro.username}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="Foto_perfil" onClick={verPerfil} style={{cursor: "pointer"}}>
                <img src={fotoAutor || "https://via.placeholder.com/40"} alt="foto perfil" />
                <p>{autor || "Membro"}</p>
            </div>

            <div className="Conteudo_Post" onClick={() => navigate(`/post/${id}`)}>
                <h1>{conquista ? `🏆 ${titulo}` : titulo}</h1>
                <p>{texto}</p>
            </div>

            <div className="Botoes_interacoes">
                <button className={`btn_interacao btn_like ${jaDeuLike ? 'ativo' : ''}`} onClick={aoDarLike}>
                    <span className="icon">{jaDeuLike ? "❤️" : "🤍"}</span>
                    <span className="count">{likes}</span>
                </button>

                <button className="btn_interacao btn_comment" onClick={() => navigate(`/post/${id}`)} >
                    <span className="icon">💬</span>
                    <span className="count">{comentarios || 0}</span>
                </button>
            </div>
        </div>
    );
}
export default PostSquad;