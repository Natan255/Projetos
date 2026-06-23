import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, doc, getDoc, getCountFromServer, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useAlerta } from "../componentes/AlertaProvider";
import "./AdicionarRankSquad.css";

function AdicionarRankSquad() {
    const { id: squadId } = useParams();
    const navigate = useNavigate();
    const { exibirAlerta } = useAlerta();

    const [enviando, setEnviando] = useState(false);
    const [estilo, setEstilo] = useState("Pontos");

    const [metrica, setMetrica] = useState("Pontos");
    const [outraMetrica, setOutraMetrica] = useState("");
    const metricaFinal = metrica === "Outros" ? outraMetrica : metrica;

    const [exigirFoto, setExigirFoto] = useState(false);
    const [exigirResumo, setExigirResumo] = useState(false);
    const [exigirGithub, setExigirGithub] = useState(false);
    const [exigirForest, setExigirForest] = useState(false);
    const [exigirContajg, setExigirContajg] = useState("Outro");
    const [subCategoria, setSubCategoria] = useState("");

    const [disputarRanking, setDisputarRanking] = useState(true);
    const [conteudoVotacao, setConteudoVotacao] = useState("");
    const [dataEncerramento, setDataEncerramento] = useState("");
    const [restritoAoSquad, setRestritoAoSquad] = useState(true);
    const [botaoVotacaoP, setbotaoVotacaoP] = useState("");
    const [botaoVotacaoN, setbotaoVotacaoN] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/paginas/Entrar");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;
        if (!auth.currentUser) return alert("Você precisa estar logado!");
        
        console.log("Squad ID para adicionar rank:", squadId);
        if (!squadId) return alert("Squad não identificado!");

        setEnviando(true);
        const exigeConfigVotacao = estilo === "Votacao" || (estilo === "Colecao" && disputarRanking);

        try {
            const squadRef = doc(db, "squads", squadId);
            
            // 1. Busca os dados do Squad atual para obter a lista de membros cadastrados
            const squadSnap = await getDoc(squadRef);
            if (!squadSnap.exists()) {
                exibirAlerta("Erro", "Squad original não foi encontrado.");
                setEnviando(false);
                return;
            }
            
            const dadosSquad = squadSnap.data();
            const listaMembros = dadosSquad?.membros || [];

            // 2. Validação do limite de Ranks Extras
            const ranksMetaRef = collection(squadRef, "ranks_extra");
            const snapshotContagem = await getCountFromServer(query(ranksMetaRef));
            const totalRanksAtuais = snapshotContagem.data().count;

            if (totalRanksAtuais >= 3) {
                exibirAlerta("Ops!", "Este Squad já atingiu o limite máximo de 3 rankings extras.");
                setEnviando(false);
                return;
            }

            const idUnicoRank = `rank_${Date.now()}`;
            console.log(`Iniciando criação do ranking dedicado em lote: ${idUnicoRank}`);

            // 3. Inicialização do lote de gravação (Batch Execution)
            const batch = writeBatch(db);
            const metaDocRef = doc(ranksMetaRef, idUnicoRank);
            
            // Define o objeto de metadados do rank extra no lote
            batch.set(metaDocRef, {
                idRank: idUnicoRank,
                estilo,
                subCategoria, 
                disputarRanking: estilo === "Colecao" ? disputarRanking : true,
                regras: { 
                    exigirFoto, 
                    exigirResumo, 
                    exigirGithub, 
                    exigirForest, 
                    exigirContajg: exigirContajg === "Outro" ? "" : exigirContajg 
                },
                ...(exigeConfigVotacao && {
                    configVotacao: {
                        conteudoVotacao,
                        dataEncerramento,
                        restritoAoSquad,
                        botaoVotacaoN: botaoVotacaoN || "Recusar",
                        botaoVotacaoP: botaoVotacaoP || "Aprovar"
                    }
                }),
                metrica: estilo === "Votacao" ? "Votação" : (estilo === "Colecao" && !disputarRanking) ? "Exibição" : metricaFinal,
                idCriador: auth.currentUser.uid,
                criadoEm: serverTimestamp(),
                nomeRank: `Rank ${totalRanksAtuais + 2}`,
            });

            // 4. Mapeia e popula recursivamente cada usuário na subcoleção interna do ranking com pontos zerados
            if (listaMembros.length > 0) {
                // Instancia uma referência paralela para os dados dos perfis (opcional, para pegar metadados básicos)
                for (const membroId of listaMembros) {
                    const rankingUsuarioRef = doc(db, "squads", squadId, "ranks_extra", idUnicoRank, "ranking", membroId);
                    
                    // Buscando o nome e foto do usuário correspondente para popular a listagem inicial sem campos nulos
                    const userSnap = await getDoc(doc(db, "usuarios", membroId));
                    const userDados = userSnap.data();

                    batch.set(rankingUsuarioRef, {
                        uid: membroId,
                        nome: userDados?.nome || "Membro do Squad",
                        fotoUrl: userDados?.foto || userDados?.fotoUrl || "https://via.placeholder.com/150",
                        pontos: 0,
                        cargo: userDados?.cargo || "Recruta",
                        ultimaAtividade: serverTimestamp()
                    });
                }
            }

            // 5. Executa todas as inserções atômicas de uma única vez
            await batch.commit();
            console.log(`Criação e população inicial do rank extra concluídas com sucesso.`);

            exibirAlerta("Sucesso", "Novo Rank com tabela de membros zerada adicionado ao Squad!");
            navigate(`/squadconfig/rank/${squadId}`);
            
        } catch (error: any) {
            console.error("Erro ao adicionar rank:", error);
            alert("Erro ao adicionar rank: " + error.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="criars-container">
            <div className="criars">
                <h2 className="titulo-sessao">Adicionar Novo Rank</h2>
                
                <form onSubmit={handleSubmit} className="criar-form">
                    
                    <div className="input-group">
                        <p>Selecione o estilo do rank</p>
                        <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
                            <option value="Pontos">📈 Pontos</option>
                            <option value="Votacao">🗳️ Votação</option>
                            <option value="Colecao">🏆 Coleção / Vitrine</option>
                        </select>
                    </div>

                    {/* --- ESTILO COLEÇÃO --- */}
                    {estilo === "Colecao" && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🏆 Estilo Coleção / Vitrine</h4>
                                <p>Ideal para os membros exibirem seu acervo. Os itens postados podem ir direto para o feed e para a vitrine do perfil do usuário.</p>
                            </div>

                            <div className="input-group">
                                <p>Esse grupo terá Ranking competitivo?</p>
                                <select onChange={(e) => setDisputarRanking(e.target.value === "sim")}>
                                    <option value="sim">Sim, queremos um ranking para ver quem é mais ativo</option>
                                    <option value="nao">Não, apenas um espaço para compartilhar coleções</option>
                                </select>
                            </div>

                            {disputarRanking && (
                                <div className="input-prova-container">
                                    <h3 className="titulo-sessao-pequeno">Parâmetros da Vitrine</h3>
                                    <div className="input-group">
                                        <p>O que deve ser avaliado/regras de pontuação</p>
                                        <input type="text" placeholder="Ex: Avaliar se o item é original..." onChange={(e) => setConteudoVotacao(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <p>Tempo limite para encerrar avaliação (dias)</p>
                                        <input type="number" placeholder="Ex: 5" onChange={(e) => setDataEncerramento(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <p>Customizar botões de feedback</p>
                                        <div className="fotos-grid">
                                            <input type="text" placeholder="Padrão: Recusar" onChange={(e) => setbotaoVotacaoN(e.target.value)} />
                                            <input type="text" placeholder="Padrão: Aprovar" onChange={(e) => setbotaoVotacaoP(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
            
                    {/* --- ESTILO VOTAÇÃO --- */}
                    {estilo === "Votacao" && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🗳️ Estilo Votação Tradicional</h4>
                                <p>Focado em tomada de decisões com votações gerais do grupo. Qualquer membro pode abrir uma votação baseada nas regras definidas.</p>
                            </div>

                            <div className="input-prova-container">
                                <h3 className="titulo-sessao-pequeno">Configurações da Votação</h3>
                                <div className="input-group">
                                    <p>O que será votado/Diretrizes básicas</p>
                                    <input type="text" placeholder="Ex: Votar na melhor arte enviada..." onChange={(e) => setConteudoVotacao(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <p>Duração padrão da enquete (dias)</p>
                                    <input type="number" required={estilo === "Votacao"} placeholder="Ex: 3" onChange={(e) => setDataEncerramento(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <p>Quem tem direito ao voto?</p>
                                    <select onChange={(e) => setRestritoAoSquad(e.target.value === "squad")}>
                                        <option value="squad">Apenas membros do meu Squad</option>
                                        <option value="publico">Qualquer usuário da plataforma</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <p>Rótulos dos botões de voto (Opcional)</p>
                                    <div className="fotos-grid">
                                        <input type="text" placeholder="Padrão: Recusar" onChange={(e) => setbotaoVotacaoN(e.target.value)} />
                                        <input type="text" placeholder="Padrão: Aprovar" onChange={(e) => setbotaoVotacaoP(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- ESTILO PONTOS --- */}
                    {estilo === "Pontos" && (
                        <>
                            <div className="estilo-descricao-card">
                                <h4>📈 Estilo Pontos</h4>
                                <p>O modelo competitivo clássico. Escolha a unidade de medida padrão e configure os critérios de validação.</p>
                            </div>

                            <div className="input-group">
                                <p>Métrica do Rank</p>
                                <div className="metrica-options">
                                    {["Kills", "Metros", "Segundos", "Horas", "Linhas", "Vitorias", "Repetição", "Pontos", "Outros"].map((m) => (
                                        <button 
                                            key={m} 
                                            type="button" 
                                            className={metrica === m ? "active" : ""} 
                                            onClick={() => setMetrica(m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                {metrica === "Outros" && (
                                    <div className="input-outro">
                                        <input
                                            type="text"
                                            placeholder="Ex: Páginas lidas, Livros..."
                                            value={outraMetrica}
                                            onChange={(e) => setOutraMetrica(e.target.value)}
                                            required={metrica === "Outros"}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* --- PAINEL GERAL DE REGRAS --- */}
                    <div className="input-prova-container">
                        <h3 className="titulo-sessao-pequeno">Especificações & Regras Globais</h3>
                        
                        <div className="input-group">
                            <p>Assunto Específico / Subcategoria / Nome do Jogo ou Modalidade</p>
                            <input 
                                type="text" 
                                placeholder="Ex: Corrida, CS2, League of Legends, Matemática..." 
                                value={subCategoria} 
                                onChange={(e) => setSubCategoria(e.target.value)} 
                            />
                        </div>

                        <div className="input-group">
                            <p>Solicitar Imagem / Captura de Tela de Comprovação?</p>
                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                <option value="Nao">Não</option>
                                <option value="Sim">Sim (Obrigatório)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <p>Exigir Resumo escrito do Conteúdo?</p>
                            <select value={exigirResumo ? "Sim" : "Nao"} onChange={(e) => setExigirResumo(e.target.value === "Sim")}>
                                <option value="Nao">Não</option>
                                <option value="Sim">Sim</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <p>Verificação automática via API do GitHub?</p>
                            <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                <option value="Nao">Não</option>
                                <option value="Sim">Sim (Validar Commits)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <p>Integração com App Forest (Foco)?</p>
                            <select value={exigirForest ? "Sim" : "Nao"} onChange={(e) => setExigirForest(e.target.value === "Sim")}>
                                <option value="Nao">Não</option>
                                <option value="Sim">Sim</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <p>Vincular Estatísticas de APIs de Jogos</p>
                            <select value={exigirContajg} onChange={(e) => setExigirContajg(e.target.value)}>
                                <option value="Outro">Nenhuma / Envio Manual</option>
                                <option value="Valorant">Valorant API</option>
                                <option value="League of Legends">Riot API (LoL)</option>
                                <option value="Fortnite">Fortnite Tracker</option>
                                <option value="The Finals">The Finals API</option>
                                <option value="Call of Duty">Activision API</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-criar" disabled={enviando}>
                        {enviando ? "Processando e Gravando..." : "Salvar e Adicionar Rank"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdicionarRankSquad;