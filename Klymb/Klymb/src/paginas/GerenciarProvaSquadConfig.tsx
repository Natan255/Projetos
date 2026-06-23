import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// CORREÇÃO: Importado setDoc para lidar com novos usuários pontuando
import { collection, getDocs, doc, updateDoc, setDoc, increment, deleteDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAlerta } from "../componentes/AlertaProvider";
import "./GerenciarProvaSquadConfig.css";

function GerenciarProvaSquadConfig() {
    const { id } = useParams(); 
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [squadAtual, setSquadAtual] = useState(null); 
    const [carregando, setCarregando] = useState(true);
    const { exibirAlerta } = useAlerta();

    const buscarDadosESolicitacoes = async () => {
        try {
            const squadRef = doc(db, "squads", id);
            const squadSnap = await getDoc(squadRef);
            if (squadSnap.exists()) {
                setSquadAtual(squadSnap.data());
            }

            const provaRef = collection(db, "squads", id, "solicitacao_prova");
            const snapshot = await getDocs(provaRef);
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSolicitacoes(lista);
        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        buscarDadosESolicitacoes();
    }, [id]);

    const aprovarProva = async (solicitacao) => {
        try {
            const postsRef = collection(db, "posts");
            
            let estiloAlvo = squadAtual?.estilo || "Pontos";
            let metricaAlvo = squadAtual?.metrica || "Pontos";
            const isRankExtra = solicitacao.rankId && solicitacao.rankId !== "principal";

            // Se a prova veio de um Rank Extra, busca as regras dele
            if (isRankExtra) {
                const rankDocRef = doc(db, "squads", id, "ranks_extra", solicitacao.rankId);
                const rankSnap = await getDoc(rankDocRef);
                if (rankSnap.exists()) {
                    const dadosRank = rankSnap.data();
                    if (dadosRank.estilo) estiloAlvo = dadosRank.estilo;
                    if (dadosRank.metrica) metricaAlvo = dadosRank.metrica;
                }
            }

            const disputarRanking = squadAtual?.disputarRanking !== false; 

            // CASO A: Ranks que geram Enquetes/Votação no Feed
            if (estiloAlvo === "Votacao" || (estiloAlvo === "Colecao" && disputarRanking)) {
                const diasDuracao = Number(squadAtual?.configVotacao?.dataEncerramento) || 3;
                const dataEncerramento = new Date();
                dataEncerramento.setDate(dataEncerramento.getDate() + diasDuracao);

                await addDoc(postsRef, {
                    titulo: estiloAlvo === "Colecao" ? `Avalie o item de ${solicitacao.nome}!` : `Avalie o desempenho de seu parceiro!`,
                    texto: estiloAlvo === "Colecao" 
                        ? `📦 Item: ${solicitacao.provas?.resumo || "Sem descrição."}`
                        : `💬 Comentário: ${solicitacao.comentario || "Sem descrição."}`,
                    idSquad: id,
                    idAutor: solicitacao.uid,
                    rankExtraId: solicitacao.rankId || "principal", 
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
                    imagemPost: solicitacao.provas?.foto || "",
                    tipo: "conquistaVoto",
                    statusVotacao: "aberta",
                    valorAcao: Number(solicitacao.valorAcao) || 0,
                    encerraEm: dataEncerramento,
                    botaoVotacaoN: squadAtual?.configVotacao?.botaoVotacaoN || "Recusar",
                    botaoVotacaoP: squadAtual?.configVotacao?.botaoVotacaoP || "Aprovar",
                    votosPositivos: [],
                    votosNegativos: [],
                    likes: [],
                    comentarios: 0,
                    compartilhamento: 0,
                    criadoEm: serverTimestamp()
                });

            } else {
                // CASO B: Publicações Diretas no Feed (Estilo Pontos OU Coleção Vitrine)
                if (estiloAlvo === "Pontos") {
                    let rankingRef;
                    
                    if (isRankExtra) {
                        rankingRef = doc(db, "squads", id, "ranks_extra", solicitacao.rankId, "ranking", solicitacao.uid);
                    } else {
                        rankingRef = doc(db, "squads", id, "ranking", solicitacao.uid);
                    }

                    await setDoc(rankingRef, {
                        pontos: increment(Number(solicitacao.valorAcao)),
                        nome: solicitacao.nome || "Membro",
                        fotoPerfil: solicitacao.fotoPerfil || ""
                    }, { merge: true });
                }

                let linhasTexto = estiloAlvo === "Colecao" 
                    ? [`Adicionou um novo item à vitrine!`]
                    : [`Concluiu: ${solicitacao.valorAcao} ${metricaAlvo}.`];
                    
                if (solicitacao.provas?.resumo) {
                    linhasTexto.push(`${estiloAlvo === "Colecao" ? "📝 Descrição:" : "📝 Resumo:"} ${solicitacao.provas.resumo}`);
                }
                if (solicitacao.provas?.github) linhasTexto.push(`💻 GitHub: ${solicitacao.provas.github}`);
                if (solicitacao.rankNome) linhasTexto.push(`🎯 Rank: ${solicitacao.rankNome}`);
                
                // 🔴 AQUI: A linha "linhasTexto.push(` Foto: ...`)" FOI REMOVIDA DAQUI!

                await addDoc(postsRef, {
                    titulo: estiloAlvo === "Colecao" ? `${solicitacao.nome} atualizou sua Vitrine!` : `Nova conquista de ${solicitacao.nome}!`,
                    texto: linhasTexto.join("\n"),
                    idSquad: id,
                    idAutor: solicitacao.uid,
                    rankExtraId: solicitacao.rankId || "principal",
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
                    imagemPost: solicitacao.provas?.foto || "", // 🟢 AQUI: Passando o link direto para a propriedade correta!
                    tipo: estiloAlvo === "Colecao" ? "vitrineItem" : "conquista",
                    likes: [],
                    comentarios: 0,
                    compartilhamento: 0,
                    criadoEm: serverTimestamp()
                });
            }

            // Exclusão física do documento de solicitação pendente
            const provaDocRef = doc(db, "squads", id, "solicitacao_prova", solicitacao.id);
            await deleteDoc(provaDocRef);
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacao.id));
            
            exibirAlerta(
                "Aprovado!", 
                estiloAlvo === "Votacao" || (estiloAlvo === "Colecao" && disputarRanking)
                    ? "O item foi enviado para a votação da comunidade."
                    : "Post publicado com sucesso no feed."
            );

        } catch (error) {
            console.error("Erro ao aprovar:", error);
            alert("Erro ao processar aprovação.");
        }
    };

    const recusarProva = async (solicitacaoId) => {
        try {
            await deleteDoc(doc(db, "squads", id, "solicitacao_prova", solicitacaoId));
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacaoId));
            exibirAlerta("Rejeitado", "A postagem foi recusada com sucesso.");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="admin-provas-container">
            <h1>Gerenciar Provas</h1>

            {carregando ? (
                <p>Carregando solicitações...</p>
            ) : solicitacoes.length === 0 ? (
                <p>Nenhuma pendência encontrada.</p>
            ) : (
                <div className="lista-provas">
                    {solicitacoes.map((s) => (
                        <div key={s.id} className="card-prova">
                            <div className="info">
                                <div className="header-card-prova">
                                    <h3>{s.nome}</h3>
                                    <span className="badge-rank-origem">{s.rankNome || "Rank Principal"}</span>
                                </div>
                                
                                {s.valorAcao > 0 && (
                                    <p>
                                        <span className="label-legenda">Quantidade enviada:</span>{" "}
                                        <strong>{s.valorAcao}</strong>
                                    </p>
                                )}

                                {s.comentario && (
                                    <p className="resumo">
                                        <span className="label-legenda">Motivo / Comentário:</span> {s.comentario}
                                    </p>
                                )}

                                {s.provas?.resumo && (
                                    <p className="resumo">
                                        <span className="label-legenda">Resumo/Descrição:</span> {s.provas.resumo}
                                    </p>
                                )}
                                
                                {s.provas?.github && (
                                    <p>
                                        <span className="label-legenda">Link GitHub:</span>
                                        <a href={s.provas.github} target="_blank" rel="noreferrer"> Abrir Link</a>
                                    </p>
                                )}
                                
                                {s.provas?.foto && (
                                    <p>
                                        <span className="label-legenda">Evidência anexada:</span>
                                        <a href={s.provas.foto} target="_blank" rel="noreferrer" className="link-foto-azul"> Ver Imagem </a>
                                    </p>
                                )}
                            </div>

                            <div className="acoes">
                                <button onClick={() => aprovarProva(s)} className="btn-aprovar">
                                    Aceitar / Processar
                                </button>
                                <button onClick={() => recusarProva(s.id)} className="btn-recusar">
                                    Recusar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GerenciarProvaSquadConfig;