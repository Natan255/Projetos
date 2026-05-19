import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, setDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Cardsquad.css";
import "./VotoSquad.css"; 

function PostVotacaoSquad({
    id,
    idAutor,
    titulo,
    texto,
    likes,             // Quantidade ou array recebido pelo feed
    comentarios,       // Quantidade ou array recebido pelo feed
    autor,
    fotoAutor,
    squadId,
    votosPositivos = [],
    votosNegativos = [],
    statusVotacao = "aberta",
    jaDeuLike,         // Prop herdada do gerenciamento de likes do feed
    aoDarLike,         // Função herdada do feed para tratar o clique do like
    usuario,
    encerraEm,
    rankingComputado
}) {
    const navigate = useNavigate();
    const [dadosSquad, setDadosSquad] = useState(null);
    const [votosPos, setVotosPos] = useState(votosPositivos);
    const [votosNeg, setVotosNeg] = useState(votosNegativos);

    useEffect(() => {
        const liquidarVotacaoERanking = async () => {

            if (!encerraEm || statusVotacao !== "aberta" || rankingComputado) return;
            const dataEncerramento = encerraEm.seconds ? encerraEm.seconds * 1000 : new Date(encerraEm).getTime();
            const agora = Date.now();

            if (agora >= dataEncerramento) {
                try {
                    const postRef = doc(db, "posts", id);
                    const quantidadeDeVotos = votosPos.length;
                    await updateDoc(postRef, { 
                        statusVotacao: "encerrada",
                        rankingComputado: true 
                    });

                    if (quantidadeDeVotos > 0) {
                        const membroRankRef = doc(db, "squads", squadId, "ranking", idAutor);
                        
                        await setDoc(membroRankRef, {
                            pontos: increment(quantidadeDeVotos) 
                        }, { merge: true });

                        console.log(`Sucesso! Votação de ${autor} encerrada. +${quantidadeDeVotos} pontos adicionados ao ranking.`);
                    }
                } catch (error) {
                    console.error("Erro ao encerrar votação e atualizar ranking:", error);
                }
            }
        };

        liquidarVotacaoERanking();
    
    }, [encerraEm, statusVotacao, rankingComputado, id, votosPos.length, squadId, idAutor, autor]);

    useEffect(() => {
        const buscarConfigsSquad = async () => {
            try {
                const squadSnap = await getDoc(doc(db, "squads", squadId));
                if (squadSnap.exists()) {
                    setDadosSquad(squadSnap.data());
                }
            } catch (error) {
                console.error("Erro ao buscar configs do Squad:", error);
            }
        };
        if (squadId) buscarConfigsSquad();
    }, [squadId]);

    useEffect(() => {
        setVotosPos(votosPositivos);
        setVotosNeg(votosNegativos);
    }, [votosPositivos, votosNegativos]);

    const handleVotar = async (tipoVoto) => {
        if (!usuario) return alert("Você precisa estar logado para votar.");
        if (statusVotacao === "encerrada") return alert("Esta votação já acabou.");

        const uid = usuario.uid;
        const postRef = doc(db, "posts", id);

        try {
            if (tipoVoto === "positivo") {
                if (votosPos.includes(uid)) {
                    setVotosPos(prev => prev.filter(id => id !== uid));
                    await updateDoc(postRef, { votosPositivos: arrayRemove(uid) });
                } else {
                    setVotosPos(prev => [...prev, uid]);
                    setVotosNeg(prev => prev.filter(id => id !== uid));
                    await updateDoc(postRef, {
                        votosPositivos: arrayUnion(uid),
                        votosNegativos: arrayRemove(uid)
                    });
                }
            } else {
                // Corrigido para "negativo" para bater com a chamada da função
                if (votosNeg.includes(uid)) {
                    setVotosNeg(prev => prev.filter(id => id !== uid));
                    await updateDoc(postRef, { votosNegativos: arrayRemove(uid) });
                } else {
                    setVotosNeg(prev => [...prev, uid]);
                    setVotosPos(prev => prev.filter(id => id !== uid));
                    await updateDoc(postRef, {
                        votosNegativos: arrayUnion(uid),
                        votosPositivos: arrayRemove(uid)
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao computar voto:", error);
        }
    };

    const txtBotaoP = dadosSquad?.configVotacao?.botaoVotacaoP || "Aprovar";
    const txtBotaoN = dadosSquad?.configVotacao?.botaoVotacaoN || "Recusar";

    const jaVotouPos = usuario && votosPos.includes(usuario.uid);
    const jaVotouNeg = usuario && votosNeg.includes(usuario.uid);

    return (
        <div className={`Estrutura_post post-conquista votacao-squad-card ${statusVotacao === "encerrada" ? "encerrado" : ""}`}>
            
            {/* Header do Squad */}
            {dadosSquad && (
                <div className="Header_squad_info">
                    <div className="Foto_squad" onClick={() => navigate(`/paginas/PerfilSquad/${squadId}`)}>
                        <img src={dadosSquad.fotoPerfil || "https://via.placeholder.com/40"} alt="Squad" />
                        <p>{dadosSquad.nome}</p>
                    </div>
                </div>
            )}

            {/* Autor do Pedido */}
            <div className="Foto_perfil" onClick={() => navigate(`/paginas/Perfil/${idAutor}`)}>
                <img src={fotoAutor || "https://via.placeholder.com/40"} alt={autor} />
                <p>{autor}</p>
            </div>

            {/* Conteúdo */}
            <div className="Conteudo_Post" onClick={() => navigate(`/post/${id}`)}>
                <h1>📊 {titulo}</h1>
                <p style={{ whiteSpace: "pre-line" }}>{texto}</p>
            </div>

            {/* Área Exclusiva de Votação */}
            <div className="container-enquete-post">
                <div className="botoes-enquete">
                    <button 
                        className={`btn-enquete btn-enquete-sim ${jaVotouPos ? "votado-sim" : ""}`}
                        onClick={() => handleVotar("positivo")}
                        disabled={statusVotacao === "encerrada"}
                    >
                        {txtBotaoP} <span className="badge-votos">{votosPos.length}</span>
                    </button>

                    <button 
                        className={`btn-enquete btn-enquete-nao ${jaVotouNeg ? "votado-nao" : ""}`}
                        onClick={() => handleVotar("negativo")} 
                        disabled={statusVotacao === "encerrada"}
                    >
                        {txtBotaoN} <span className="badge-votos">{votosNeg.length}</span>
                    </button>
                </div>
                {statusVotacao === "encerrada" && (
                    <span className="aviso-encerrado">Votação Encerrada</span>
                )}
            </div>

            {/* BARRA DE INTERAÇÕES SOCIAIS RECUPERADA */}
            <div className="Botoes_interacoes">
                <button className={`btn_interacao btn_like ${jaDeuLike ? 'ativo' : ''}`} onClick={aoDarLike}>
                    <span className="icon">{jaDeuLike ? "❤️" : "🤍"}</span>
                    <span className="count">{likes}</span>
                </button>

                <button className="btn_interacao btn_comment" onClick={() => navigate(`/post/${id}`)}>
                    <span className="icon">💬</span>
                    <span className="count">{comentarios || 0}</span>
                </button>
            </div>

        </div>
    );
}

export default PostVotacaoSquad;