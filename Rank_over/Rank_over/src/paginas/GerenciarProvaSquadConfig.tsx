import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, increment, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./GerenciarProvaSquadConfig.css";

function GerenciarProvaSquadConfig() {
    const { id } = useParams(); // ID do Squad
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const buscarSolicitacoes = async () => {
        try {
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
        buscarSolicitacoes();
    }, [id]);

    const aprovarProva = async (solicitacao) => {
        try {
            // 1. Somar os pontos no ranking do usuário
            const rankingRef = doc(db, "squads", id, "ranking", solicitacao.id);
            console.log(solicitacao.id)
            await updateDoc(rankingRef, {
                pontos: increment(Number(solicitacao.valorAcao))
            });

            const postsRef = collection(db, "posts");

            let linhasTexto = [`Concluiu: ${solicitacao.valorAcao} unidades.`];

            if (solicitacao.provas?.resumo) {
                linhasTexto.push(`📝 Resumo: ${solicitacao.provas.resumo}`);
            }

            if (solicitacao.provas?.github) {
                linhasTexto.push(`💻 GitHub: ${solicitacao.provas.github}`);
            }

            if (solicitacao.provas?.foto) {
                linhasTexto.push(`📸 Foto: ${solicitacao.provas.foto}`);
            }

            const textoFinal = linhasTexto.join("\n");

            await addDoc(postsRef, {
                titulo: `🏆 Nova conquista de ${solicitacao.nome}!`,
                texto: textoFinal,
                idSquad: id,
                idAutor: solicitacao.id,
                nomeAutor: solicitacao.nome,
                fotoAutor: solicitacao.fotoPerfil || "",
                likes: [],
                comentarios: 0,
                compartilhamento: 0,
                criadoEm: serverTimestamp()
            });

            // 3. Deletar a solicitação de prova
            const provaDocRef = doc(db, "squads", id, "solicitacao_prova", solicitacao.id);
            await deleteDoc(provaDocRef);

            // 4. Atualizar interface
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacao.id));

            alert("Prova aprovada e conquista postada no feed!");

        } catch (error) {
            console.error("Erro ao aprovar:", error);
            alert("Erro ao processar aprovação.");
        }
    };

    const recusarProva = async (solicitacaoId) => {
        try {
            await deleteDoc(doc(db, "squads", id, "solicitacao_prova", solicitacaoId));
            setSolicitacoes(prev => prev.filter(item => item.id !== solicitacaoId));
            alert("Prova recusada.");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="admin-provas-container">
            <h1>Gerenciar Provas</h1>

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

                                <p><span className="label-legenda">Quantidade:</span> <strong>{s.valorAcao}</strong></p>

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
                            </div>

                            <div className="acoes">
                                <button onClick={() => aprovarProva(s)} className="btn-aprovar">Aceitar</button>
                                <button onClick={() => recusarProva(s.id)} className="btn-recusar">Recusar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GerenciarProvaSquadConfig;