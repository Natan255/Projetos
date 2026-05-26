import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, increment, deleteDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
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
            const estilo = squadAtual?.estilo || "Pontos";
            const disputarRanking = squadAtual?.disputarRanking !== false; 

            // CASO A: Grupos que geram Enquetes/Votação no Feed (Estilo Votação OU Coleção Competitiva)
            if (estilo === "Votacao" || (estilo === "Colecao" && disputarRanking)) {
                const diasDuracao = Number(squadAtual?.configVotacao?.dataEncerramento) || 3;
                const dataEncerramento = new Date();
                dataEncerramento.setDate(dataEncerramento.getDate() + diasDuracao);

                await addDoc(postsRef, {
                    titulo: estilo === "Colecao" ? `Avalie o item de ${solicitacao.nome}!` : `Avalie o desempenho de seu parceiro!`,
                    texto: estilo === "Colecao" 
                        ? `📦 Item: ${solicitacao.provas?.resumo || "Sem descrição."}`
                        : `💬 Comentário: ${solicitacao.comentario || "Sem descrição."}`,
                    idSquad: id,
                    idAutor: solicitacao.uid,
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
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
                if (estilo === "Pontos") {
                    // MUDE AQUI: usa solicitacao.uid para dar os pontos para o usuário correto
                    const rankingRef = doc(db, "squads", id, "ranking", solicitacao.uid); 
                    await updateDoc(rankingRef, {
                        pontos: increment(Number(solicitacao.valorAcao))
                    });
                }

                let linhasTexto = estilo === "Colecao" 
                    ? [`Adicionou um novo item à vitrine!`]
                    : [`Concluiu: ${solicitacao.valorAcao} unidades.`];
                    
                if (solicitacao.provas?.resumo) {
                    linhasTexto.push(`${estilo === "Colecao" ? "📝 Descrição:" : "📝 Resumo:"} ${solicitacao.provas.resumo}`);
                }
                if (solicitacao.provas?.github) linhasTexto.push(`💻 GitHub: ${solicitacao.provas.github}`);
                if (solicitacao.provas?.foto) linhasTexto.push(`📸 Foto: ${solicitacao.provas.foto}`);

                await addDoc(postsRef, {
                    titulo: estilo === "Colecao" ? `${solicitacao.nome} atualizou sua Vitrine!` : `Nova conquista de ${solicitacao.nome}!`,
                    texto: linhasTexto.join("\n"),
                    idSquad: id,
                    idAutor: solicitacao.id,
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
                    tipo: estilo === "Colecao" ? "vitrineItem" : "conquista",
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
                squadAtual?.estilo === "Votacao" || (squadAtual?.estilo === "Colecao" && squadAtual?.disputarRanking)
                    ? "O item foi enviado para a votação da comunidade."
                    : "Post publicado com sucesso no feed.", 
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
            <h1>Gerenciar Provas {squadAtual?.estilo ? `(${squadAtual.estilo})` : ""}</h1>

            {carregando ? (
                <p>Carregando solicitações...</p>
            ) : solicitacoes.length === 0 ? (
                <p>Nenhuma pendência encontrada.</p>
            ) : (
                <div className="lista-provas">
                    {solicitacoes.map((s) => (
                        <div key={s.id} className="card-prova">
                            <div className="info">
                                <h3>{s.nome}</h3>
                                
                                {squadAtual?.estilo !== "Colecao" && (
                                    <p>
                                        <span className="label-legenda">Quantidade:</span>{" "}
                                        <strong>{s.valorAcao} ({squadAtual?.metrica || "Pontos"})</strong>
                                    </p>
                                )}

                                {squadAtual?.estilo === "Votacao" ? (
                                    s.comentario && (
                                        <p className="resumo">
                                            <span className="label-legenda">Comentário:</span> {s.comentario}
                                        </p>
                                    )
                                ) : (
                                    <>
                                        {s.provas?.resumo && (
                                            <p className="resumo">
                                                <span className="label-legenda">
                                                    {squadAtual?.estilo === "Colecao" ? "Item / Descrição:" : "Resumo:"}
                                                </span> {s.provas.resumo}
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
                                                <span className="label-legenda">
                                                    {squadAtual?.estilo === "Colecao" ? "Imagem do Item:" : "Evidência:"}
                                                </span>
                                                <a href={s.provas.foto} target="_blank" rel="noreferrer"> Ver Foto</a>
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="acoes">
                                <button onClick={() => aprovarProva(s)} className="btn-aprovar">
                                    {squadAtual?.estilo === "Votacao" || (squadAtual?.estilo === "Colecao" && squadAtual?.disputarRanking) 
                                        ? "Liberar p/ Votação" 
                                        : "Aceitar / Postar"}
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