import "./ExpansaoPost.css";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from "firebase/firestore"; // ADICIONADO setDoc AQUI
import { db } from "../firebaseConfig";
import { arrayUnion, arrayRemove } from "firebase/firestore";

function ExpansaoPost({ usuario }) {
    const { idPost } = useParams(); 
    const [dadosPost, setDadosPost] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [comentarios, setComentarios] = useState([]); 
    const [dadosSquad, setDadosSquad] = useState(null);
    const [idSquad, setIdSquad] = useState("");

    const [texto, setTexto] = useState("");
    const [textoResposta, setTextoResposta] = useState("");

    const [respondendoId, setRespondendoId] = useState(null);
    const [placeholderNome, setPlaceholderNome] = useState("");

    const txtBotaoP = dadosSquad?.configVotacao?.botaoVotacaoP || "Aprovar";
    const txtBotaoN = dadosSquad?.configVotacao?.botaoVotacaoN || "Recusar";

    const jaVotouPos = usuario && dadosPost?.votosPositivos?.includes(usuario.uid);
    const jaVotouNeg = usuario && dadosPost?.votosNegativos?.includes(usuario.uid);

    const comentariosPrincipais = comentarios.filter(c => !c.respondendoA);
    const listaRespostas = comentarios.filter(c => c.respondendoA);
    const navigate = useNavigate();

    const like = async (idComentario, jaCurtiu) => {
        if (!usuario?.uid) return;

        try {
            const comentarioRef = doc(db, "posts", idPost, "comentarios", idComentario);
            await updateDoc(comentarioRef, {
                likes: increment(jaCurtiu ? -1 : 1),
                usuariosQueCurtiram: jaCurtiu ? arrayRemove(usuario.uid) : arrayUnion(usuario.uid)
            });
        } catch (error) {
            console.error("Erro ao atualizar like no comentário/resposta:", error);
        }
    };

    const adicionarComentario = async (idDoPai = null) => {
        let textoFinal = "";
        let nomeRespondendoA = "";
        if (idDoPai) {
            textoFinal = textoResposta
            const nomeRef = comentarios.find(c => c.id === idDoPai)?.nomeAutor || placeholderNome || "Membro";
            nomeRespondendoA = `@${nomeRef} `;
        }else{
            textoFinal = texto;
        }
        console.log("Texto do comentário:", nomeRespondendoA);
            
        if (!textoFinal.trim()) return;

        try {
            const comentRef = collection(db, "posts", idPost, "comentarios");
            await addDoc(comentRef, {
                autorId: usuario.uid,
                nomeAutor: usuario.displayName || "Membro",
                fotoAutor: usuario.photoURL || "",
                texto: textoFinal,
                criadoEm: serverTimestamp(),
                likes: 0,
                respondendoA: idDoPai,
                nomeRespondendoA: nomeRespondendoA
            });

            if (idDoPai) {
                setTextoResposta("");
                setRespondendoId(null);
                setPlaceholderNome("");
            } else {
                setTexto("");
            }

            const postRef = doc(db, "posts", idPost);
            await updateDoc(postRef, {
                comentarios: increment(1) 
            });

            if (!dadosSquad) return;

            if (dadosSquad.estilo === "Colecao" && dadosSquad.disputarRanking === true) {

                const squadIdReal = dadosSquad.id || idSquad; 

                if (squadIdReal) {
                    const rankingMembroRef = doc(db, "squads", squadIdReal, "ranking", usuario.uid);
                    await setDoc(rankingMembroRef, {
                        pontos: increment(5),
                        ultimaAtividade: serverTimestamp()
                    }, { merge: true });
                    
                    console.log("Pontuação atribuída com sucesso!");
                }
            }

        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
        }
    };

    const handleVotar = async (tipoVoto) => {
        if (!usuario) return alert("Você precisa estar logado para votar.");
        if (dadosPost.statusVotacao === "encerrada") return alert("Esta votação já acabou.");

        const uid = usuario.uid;
        const postRef = doc(db, "posts", idPost);

        try {
            if (tipoVoto === "positivo") {
                if (dadosPost?.votosPositivos?.includes(uid)) {
                    await updateDoc(postRef, { votosPositivos: arrayRemove(uid) });
                } else {
                    await updateDoc(postRef, {
                        votosPositivos: arrayUnion(uid),
                        votosNegativos: arrayRemove(uid)
                    });
                }
            } else {
                if (dadosPost?.votosNegativos?.includes(uid)) {
                    await updateDoc(postRef, { votosNegativos: arrayRemove(uid) });
                } else {
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

    // 1. Escuta os dados do Post em tempo real
    useEffect(() => {
        if (!idPost) return;
        const unsubscribe = onSnapshot(doc(db, "posts", idPost), (docSnap) => {
            if (docSnap.exists()) {
                const dados = docSnap.data();
                setDadosPost({ id: docSnap.id, ...dados });
                
                if (!dados.idSquad) {
                    setCarregando(false);
                }
            } else {
                setCarregando(false);
            }
        });
        return () => unsubscribe();
    }, [idPost]);
    
    // 2. Escuta os dados da Squad
    useEffect(() => {
        const squadIdAtual = dadosPost?.idSquad;
        setIdSquad(squadIdAtual || "");
        if (!squadIdAtual || typeof squadIdAtual !== "string") return;

        try {
            const squadRef = doc(db, "squads", squadIdAtual);
            const unsubscribe = onSnapshot(squadRef, (docSnap) => {
                if (docSnap.exists()) {
                    setDadosSquad({ id: docSnap.id, ...docSnap.data() });
                }
                setCarregando(false);
            }, (error) => {
                console.error("Erro no snapshot da Squad:", error);
                setCarregando(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Erro ao construir referência do doc da Squad:", err);
            setCarregando(false);
        }
    }, [dadosPost?.idSquad]); 

    // 3. Escuta os comentários
    useEffect(() => {
        if (!idPost) return;
        
        const q = collection(db, "posts", idPost, "comentarios");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComentarios(lista);
        });

        return () => unsubscribe();
    }, [idPost]);

    if (carregando) return <div className="loading">Carregando post...</div>;
    if (!dadosPost) return <div className="error">Post não encontrado ou removido.</div>;

    return (
        <div className="expansao-container">
            {/* O restante do seu JSX permanece exatamente igual */}
            <div className="expansao-squadmembro">
                <img 
                    src={dadosPost.fotoAutor || "https://via.placeholder.com/40"} 
                    alt="foto perfil" 
                    className="avatar-membro"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/paginas/Perfil/${dadosPost.idAutor}`)}
                />
                <div className="meta-info-post">
                    <span className="nome-membro">{dadosPost.nomeAutor || "Membro"}</span>
                    {dadosSquad?.nome && <span className="tag-squad">{dadosSquad.nome}</span>}
                    <span className="data-post">
                        • {dadosPost.criadoEm?.seconds 
                            ? new Date(dadosPost.criadoEm.seconds * 1000).toLocaleDateString() 
                            : "Data desconhecida"}
                    </span>
                </div>
            </div>

            <div className="expansao-conteudo">
                <h1 className="expansao-titulo">📊 {dadosPost.titulo}</h1>

                
                
                {dadosPost?.tipo === "conquistaVoto" && (
                    <div className="container-enquete-post">
                        <div className="botoes-enquete">
                            <button 
                                className={`btn-enquete btn-enquete-sim ${jaVotouPos ? "votado-sim" : ""}`}
                                onClick={() => handleVotar("positivo")}
                                disabled={dadosPost.statusVotacao === "encerrada"}
                            >
                                {txtBotaoP} <span className="badge-votos">{dadosPost?.votosPositivos?.length || 0}</span>
                            </button>

                            <button 
                                className={`btn-enquete btn-enquete-nao ${jaVotouNeg ? "votado-nao" : ""}`}
                                onClick={() => handleVotar("negative")} 
                                disabled={dadosPost.statusVotacao === "encerrada"}
                            >
                                {txtBotaoN} <span className="badge-votos">{dadosPost?.votosNegativos?.length || 0}</span>
                            </button>
                        </div>
                        {dadosPost.statusVotacao === "encerrada" && (
                            <span className="aviso-encerrado">Votação Encerrada</span>
                        )}
                    </div>
                )}
                
                <p className="expansao-texto-corpo" style={{ whiteSpace: "pre-line" }}>{dadosPost.texto}</p>

                {dadosPost.imagemPost && (
                    <div className="container-imagem-post">
                        <img 
                            src={dadosPost.imagemPost} 
                            alt="Mídia do post" 
                            className="expansao-imagem-post" 
                        />
                    </div>
                )}
            </div>

            <div className="expansao-comentarios">
                <h3>Comentários ({dadosPost.comentarios || 0})</h3>
                
                <div className="lista-comentarios">
                    {comentariosPrincipais.length > 0 ? (
                        comentariosPrincipais.map((coment) => (
                            <React.Fragment key={coment.id}>
                                <div className="item-comentario">
                                    <img src={coment.fotoAutor || "https://via.placeholder.com/40"} alt="autor" style={{ cursor: 'pointer' }} onClick={() => navigate(`/paginas/Perfil/${coment.autorId}`)}/>
                                    <div className="texto-comentario">
                                        <strong>{coment.nomeAutor}</strong>
                                        <p>{coment.texto}</p>
                                    </div>

                                    <div className="comentario-actions">   
                                        <button className="btn_like_comentario" onClick={() => {const jaCurtiu = coment.usuariosQueCurtiram?.includes(usuario?.uid) || false; like(coment.id, jaCurtiu);}}>
                                            <span className="icon">
                                                {coment.usuariosQueCurtiram?.includes(usuario?.uid) ? "❤️" : "🤍"}
                                            </span>
                                            <span className="count">{coment.likes || 0}</span>
                                        </button>

                                        <button 
                                            className="btn_reply_comentario"
                                            onClick={() => {
                                                setRespondendoId(respondendoId === coment.id ? null : coment.id);
                                                setPlaceholderNome(coment.nomeAutor);
                                            }}
                                        >
                                            <span className="count">Responder</span>
                                        </button>
                                    </div>
                                </div>

                                {listaRespostas
                                    .filter(resp => resp.respondendoA === coment.id)
                                    .map(resp => (
                                        <div key={resp.id} className="item-comentario item-resposta" style={{ marginLeft: "45px" }}>
                                            <img src={resp.fotoAutor || "https://via.placeholder.com/40"} alt="autor" style={{ cursor: 'pointer' }} onClick={() => navigate(`/paginas/Perfil/${resp.autorId}`)} />
                                            <div className="texto-comentario">
                                                <strong>{resp.nomeAutor} <span>↳ respondeu</span> {resp.nomeRespondendoA}</strong>
                                                <p>{resp.texto}</p>
                                            </div>

                                            <div className="comentario-actions">
                                                <button className="btn_like_comentario" onClick={() => {const jacurtiu = resp.usuariosQueCurtiram?.includes(usuario?.uid) || false; like(resp.id, jacurtiu);}}>
                                                    <span className="icon">
                                                        {coment.usuariosQueCurtiram?.includes(usuario?.uid) ? "❤️" : "🤍"}
                                                    </span>
                                                    <span className="count">{resp.likes || 0}</span>
                                                </button>
                                                <button 
                                                    className="btn_reply_comentario"
                                                    onClick={() => {
                                                        setRespondendoId(coment.id); 
                                                        setPlaceholderNome(resp.nomeAutor);
                                                    }}
                                                >
                                                    <span className="count">Responder</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }

                                {respondendoId === coment.id && (
                                    <div className="resposta-container">
                                        <img src={usuario?.photoURL || "https://via.placeholder.com/150"} alt="sua foto" />
                                        <input 
                                            type="text" 
                                            value={textoResposta}
                                            placeholder={`Responder a ${placeholderNome}...`} 
                                            onChange={(e) => setTextoResposta(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={() => adicionarComentario(coment.id)}>Enviar</button>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <p className="sem-comentarios">Ainda não há comentários. Seja o primeiro!</p>
                    )}
                </div>

                <div className="novo-comentario">
                    <img src={usuario?.photoURL || "https://via.placeholder.com/150"} alt="sua foto" />
                    <input 
                        type="text" 
                        value={texto}
                        placeholder="Escreva um comentário..." 
                        onChange={(e) => setTexto(e.target.value)}
                        onClick={() => { setRespondendoId(null); setPlaceholderNome(""); }}
                    />
                    <button onClick={() => adicionarComentario(null)}>Enviar</button>
                </div>
            </div>
        </div>
    );
}

export default ExpansaoPost;