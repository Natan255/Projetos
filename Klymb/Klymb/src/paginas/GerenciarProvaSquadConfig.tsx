import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, increment, deleteDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./GerenciarProvaSquadConfig.css";

function GerenciarProvaSquadConfig() {
    const { id } = useParams(); // ID do Squad
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [squadAtual, setSquadAtual] = useState(null); // Estado para guardar a configuração do Squad pai
    const [carregando, setCarregando] = useState(true);

    const buscarDadosESolicitacoes = async () => {
        try {
            // 1. Busca os dados do Squad pai para saber as configurações de estilo e tempo
            const squadRef = doc(db, "squads", id);
            const squadSnap = await getDoc(squadRef);
            if (squadSnap.exists()) {
                setSquadAtual(squadSnap.data());
            }

            // 2. Busca as solicitações pendentes
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

            if (estilo === "Pontos") {
                // 1. Soma os pontos no ranking do usuário imediatamente
                const rankingRef = doc(db, "squads", id, "ranking", solicitacao.id);
                await updateDoc(rankingRef, {
                    pontos: increment(Number(solicitacao.valorAcao))
                });

                // 2. Monta o texto de conquistas padrão
                let linhasTexto = [`Concluiu: ${solicitacao.valorAcao} unidades.`];
                if (solicitacao.provas?.resumo) linhasTexto.push(`📝 Resumo: ${solicitacao.provas.resumo}`);
                if (solicitacao.provas?.github) linhasTexto.push(`💻 GitHub: ${solicitacao.provas.github}`);
                if (solicitacao.provas?.foto) linhasTexto.push(`📸 Foto: ${solicitacao.provas.foto}`);

                await addDoc(postsRef, {
                    titulo: `Nova conquista de ${solicitacao.nome}!`,
                    texto: linhasTexto.join("\n"),
                    idSquad: id,
                    idAutor: solicitacao.id,
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
                    tipo: "conquista",
                    likes: [],
                    comentarios: 0,
                    compartilhamento: 0,
                    criadoEm: serverTimestamp()
                });

            } else if (estilo === "Votacao") {
                // 1. Calcula o prazo de encerramento baseado nas opções do Squad
                const diasDuracao = squadAtual?.configVotacao?.diasDeDuracao || 3;
                const dataEncerramento = new Date();
                dataEncerramento.setDate(dataEncerramento.getDate() + diasDuracao);

                // 2. Publica o post estruturado como enquete/votação no Feed
                await addDoc(postsRef, {
                    titulo: `Avalie o desempenho de seu parceiro!`,
                    texto: `💬 Comentário: ${solicitacao.comentario || "Sem descrição."}`,
                    idSquad: id,
                    idAutor: solicitacao.id,
                    nomeAutor: solicitacao.nome,
                    fotoAutor: solicitacao.fotoPerfil || "",
                    tipo: "conquistaVoto",
                    statusVotacao: "aberta",
                    valorAcao: Number(solicitacao.valorAcao),
                    encerraEm: dataEncerramento,
                    votosPositivos: [],
                    votosNegativos: [],
                    likes: [],
                    comentarios: 0,
                    compartilhamento: 0,
                    criadoEm: serverTimestamp()
                });
            }

            // 3. Deleta a solicitação de prova concluída
            const provaDocRef = doc(db, "squads", id, "solicitacao_prova", solicitacao.id);
            await deleteDoc(provaDocRef);

            // 4. Atualiza a interface removendo o card
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacao.id));

            alert(estilo === "Votacao" ? "Votação aberta e postada no feed!" : "Prova aprovada e conquista postada no feed!");

        } catch (error) {
            console.error("Erro ao aprovar:", error);
            alert("Erro ao processar aprovação.");
        }
    };

    const recusarProva = async (solicitacaoId) => {
        try {
            await deleteDoc(doc(db, "squads", id, "solicitacao_prova", solicitacaoId));
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacaoId));
            alert("Solicitação recusada.");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="admin-provas-container">
            <h1>Gerenciar Provas {squadAtual?.estilo ? `(${squadAtual.estilo})` : ""}</h1>

            {carregando ? (
                <p>Carregando provas...</p>
            ) : solicitacoes.length === 0 ? (
                <p>Nenhuma prova pendente.</p>
            ) : (
                <div className="lista-provas">
                    {solicitacoes.map((s) => (
                        <div key={s.id} className="card-prova">
                            <div className="info">
                                <h3>{s.nome}</h3>
                                <p>
                                    <span className="label-legenda">Quantidade:</span>{" "}
                                    <strong>{s.valorAcao} ({squadAtual?.metrica || "Pontos"})</strong>
                                </p>

                                {/* Checa o estilo direto pelas configurações salvas do Squad pai */}
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
                                                <span className="label-legenda">Resumo:</span> {s.provas.resumo}
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
                                                <span className="label-legenda">Evidência:</span>
                                                <a href={s.provas.foto} target="_blank" rel="noreferrer"> Ver Foto</a>
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="acoes">
                                <button onClick={() => aprovarProva(s)} className="btn-aprovar">
                                    {squadAtual?.estilo === "Votacao" ? "Liberar p/ Votação" : "Aceitar"}
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