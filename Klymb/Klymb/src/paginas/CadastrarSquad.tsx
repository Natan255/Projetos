import { useState, useEffect, use } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, setDoc} from "firebase/firestore"; //pra poder editar sem apagar
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useAlerta } from "../componentes/AlertaProvider";
import "./CadastrarSquad.css";


function CadastrarSquad() {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoria, setCategoria] = useState("Estudos");
    const [metrica, setMetrica] = useState("Horas");
    const [outraMetrica, setOutraMetrica] = useState("");
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [fotoBanner, setFotoBanner] = useState("");
    const { exibirAlerta } = useAlerta();
    const [fotoCapa, setFotoCapa] = useState("");
    const [subCategoria, setSubCategoria] = useState("")
    const [conteudoVotacao, setConteudoVotacao] = useState("")
    const [botaoVotacaoP, setbotaoVotacaoP] = useState("")
    const [botaoVotacaoN, setbotaoVotacaoN] = useState("")

    
    const [enviando, setEnviando] = useState(false);
    const [estilo, setEstilo] = useState("Pontos")
    const navigate = useNavigate();


    const [exigirFoto, setExigirFoto] = useState(false);
    const [exigirResumo, setExigirResumo] = useState(false);
    const [exigirGithub, setExigirGithub] = useState(false);
    const [exigirForest, setExigirForest] = useState(false)
    const [exigirContajg, setExigirContajg] = useState("")
    const [restritoAoSquad, setRestritoAoSquad] = useState(true)
    const [dataEncerramento, setDataEncerramento] = useState("")
    const [disputarRanking, setDisputarRanking] = useState("sim")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/paginas/Entrar");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (enviando) return;

        if (!auth.currentUser) return alert("Você precisa estar logado!");

        setEnviando(true);

        const metricaFinal = metrica === "Outros" ? outraMetrica : metrica;
        const avatarPadrao = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ff4d00&color=fff&size=512`;
        const bannerPadrao = `https://picsum.photos/id/15/1200/400`;

        const fotoPerfilFinal = fotoPerfil.trim() === "" ? avatarPadrao : fotoPerfil;
        const fotoBannerFinal = fotoBanner.trim() === "" ? bannerPadrao : fotoBanner;
        const fotoCapaFinal = fotoCapa.trim() === "" ? avatarPadrao : fotoCapa;

        const exigeConfigVotacao = estilo === "Votacao" || (estilo === "Colecao" && disputarRanking);

        try {
            const docRef = await addDoc(collection(db, "squads"), {
                nome,
                descricao,
                categoria,
                subCategoria, 
                estilo,
                disputarRanking: estilo === "Colecao" ? disputarRanking : true, 
                regras: {
                    exigirFoto,
                    exigirResumo,
                    exigirGithub,
                    exigirForest,
                    exigirContajg
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
                metrica: estilo === "Votacao" 
                    ? "Votação" 
                    : (estilo === "Colecao" && !disputarRanking) 
                        ? "Exibição" 
                        : metricaFinal,
                fotoPerfil: fotoPerfilFinal,
                fotoBanner: fotoBannerFinal,
                fotoCapa: fotoCapaFinal,
                idCriador: auth.currentUser.uid,
                nomeCriador: auth.currentUser.displayName || "Criador",
                membros: [auth.currentUser.uid],
                membrosCount: 1,
                postsCount: 0,
                visualizacoes: 0,
                status: "ativo",
                criadoEm: serverTimestamp(),
            });
            
            const novoSquadId = docRef.id;
            const deveCriarRanking = estilo !== "Colecao" || (estilo === "Colecao" && disputarRanking);

            if (deveCriarRanking) {
                const rankingMembroRef = doc(db, "squads", novoSquadId, "ranking", auth.currentUser.uid);
                await setDoc(rankingMembroRef, {
                    uid: auth.currentUser.uid,
                    nome: auth.currentUser.displayName || "Membro",
                    fotoUrl: auth.currentUser.photoURL || "",
                    pontos: 0,
                    cargo: "adm", 
                    ultimaAtividade: serverTimestamp()
                });
            }
            
            // 3. Atualiza o perfil do usuário criador vinculando o novo Squad
            const userRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userRef, {
                squads_admin: arrayUnion(novoSquadId),
                squads_seguindo: arrayUnion(novoSquadId)
            });

            // Abre o modal/notificação de sucesso
            exibirAlerta("Successo", "Squad criado com sucesso!");
            
        } catch (error: any) {
            console.error("Erro ao criar squad:", error);
            alert("Erro ao criar: " + error.message);
        } finally {
            setEnviando(false);
        }
    };
    return (
        
        <div className="criars-container">

            <div className="criars">
                <h1 className="titulo-sessao">Fundar Novo Squad</h1>
                <form className="criar-form" onSubmit={handleSubmit}>
                    
                    <div className="input-group">
                        <p>Nome do Squad</p>
                        <input 
                            type="text" 
                            placeholder="Ex: Mestres do Java"
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <p>Descrição (O que vocês fazem?)</p>
                        <textarea 
                            value={descricao} 
                            onChange={(e) => setDescricao(e.target.value)} 
                            placeholder="Descreva os objetivos do grupo..."
                        />
                    </div>

                    <div className="input-group">
                        <p>Categoria</p>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                            <option value="Estudos">📚 Estudos</option>
                            <option value="Esportes">⚽ Esportes</option>
                            <option value="Gaming">🎮 Gaming</option>
                            <option value="Trabalho">💼 Trabalho</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <p>Selecione o estilo do squad</p>
                        <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>

                            <option value="Pontos">Pontos</option>
                            <option value="Votacao">Votacao</option>
                            <option value="Colecao">Colecao/Intusiasta</option>
                        </select>

                    </div>

                    {(estilo === "Colecao") && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🏆 Estilo Coleção / Vitrine</h4>
                                <p>Ideal para os membros exibirem seu acervo. Os itens postados podem ir direto para o feed e para a vitrine do perfil do usuário.</p>
                            </div>

                            {/* NOVA OPÇÃO: PERMITIR UM GRUPO SÓ DE EXIBIÇÃO */}
                            <div className="input-group">
                                <p>Esse grupo terá Ranking competitivo?</p>
                                <select onChange={(e) => setDisputarRanking(e.target.value === "sim")}>
                                    <option value="sim">Sim, queremos competir para ver quem tem os melhores itens</option>
                                    <option value="nao">Não, apenas um espaço para compartilhar e mostrar as coleções</option>
                                </select>
                            </div>

                            {/* SÓ MOSTRA AS CONFIGURAÇÕES DE VOTO SE O RANKING ESTIVER ATIVADO */}
                            {disputarRanking && (
                                <>
                                    <div className="input-group">
                                        <p>O que tem que ser votado/Regras para pontuar no Rank</p>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Votar se o item é original e brabo..."
                                            onChange={(e) => setConteudoVotacao(e.target.value)} 
                                        />
                                    </div>

                                    <div className="input-group">
                                        <p>Quando a votação de um item deve encerrar?</p>
                                        <input 
                                            type="number" 
                                            placeholder="Ex: 5 (dias)"
                                            onChange={(e) => setDataEncerramento(e.target.value)} 
                                        />
                                    </div>

                                    <div className="input-group">
                                        <p>Personalizar botões de voto</p>
                                        <div className="votos-custom-inputs" style={{ display: 'flex', gap: '10px' }}>
                                            <input type="text" placeholder="Padrão: Recusar" onChange={(e) => setbotaoVotacaoN(e.target.value || "Recusar")} />
                                            <input type="text" placeholder="Padrão: Aprovar" onChange={(e) => setbotaoVotacaoP(e.target.value || "Aprovar")} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
    
                    {(estilo === "Votacao" ) && (
                        <>  
                        <div className="estilo-descricao-card">
                            <h4>🗳️ Estilo Votação Tradicional</h4>
                            <p>Focado em tomada de decisões com votações gerais do grupo. Qualquer membro pode abrir uma votação baseada nas regras que você definir aqui, e o resultado final soma os pontos para o ranking geral do Squad.</p>
                        </div>
                            <div className="input-group">
                                <p>O que tem que ser votado/Regras (aparecerá isso para o membro)</p>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Votar na melhor foto..."
                                    onChange={(e) => setConteudoVotacao(e.target.value)} 
                                />
                            </div>

                            <div className="input-group">
                                <p>Quando a votação deve encerrar?</p>
                                <input 
                                    type="number" 
                                    required
                                    onChange={(e) => setDataEncerramento(e.target.value)} 
                                />
                            </div>


                            <div className="input-group">
                                <p>Quem tem direito ao voto?</p>
                                <select onChange={(e) => setRestritoAoSquad(e.target.value === "squad")}>
                                    <option value="squad">Apenas membros do meu Squad</option>
                                    <option value="publico">Qualquer usuário da plataforma</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <p>Personalizar botões de voto (Opcional)</p>
                                <div className="votos-custom-inputs" style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Padrão: Recusar (Botão Vermelho/Negativo)" 
                                        onChange={(e) => setbotaoVotacaoN(e.target.value || "Recusar")} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Padrão: Aprovar (Botão Verde/Positivo)" 
                                        onChange={(e) => setbotaoVotacaoP(e.target.value || "Aprovar")} 
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {(estilo === "Pontos") &&(
                        <>
                            <div className="estilo-descricao-card">
                                <h4>📈 Estilo Pontos</h4>
                                <p>O modelo competitivo puro do Rank Over. Escolha uma métrica específica (como Horas, Kills ou Páginas lidas) e defina as regras de validação. Os membros sobem no ranking provando suas atividades através de fotos, commits do GitHub ou integrações.</p>
                            </div>
                            <div className="input-group">
                                <p>Métrica de Rank (O que define quem está no topo?)</p>
                                <div className="metrica-options">
                                    {["Kills", "Metros", "Segundos", "Horas", "Linhas", "Vitorias", "Repetição", "Outros"].map((m) => (
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
                                            placeholder="Ex: Páginas lidas, Flexões..."
                                            value={outraMetrica}
                                            onChange={(e) => setOutraMetrica(e.target.value)}
                                            required
                                        />
                                    </div>

                                    
                                )}
                            </div>

                            <div className="input-prova-container">
                                <h3 className="titulo-sessao-pequeno">Regras de Verificação</h3>
                                
                                
                                {(categoria === "Estudos" ) && (
                                    <>
                                        
                                        
                                        <div className="input-group">
                                            <p>Resumo de conteúdo?</p>
                                            <select value={exigirResumo ? "Sim" : "Nao"} onChange={(e) => setExigirResumo(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de GitHub?</p>
                                            <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Commits)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de app Forest?</p>
                                            <select value={exigirForest ? "Sim" : "Nao"} onChange={(e) => setExigirForest(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {categoria === "Esportes" && (
                                    <div className="input-prova-container">
                                        <div className="input-group">
                                            <p>Modalidade Esportiva</p>
                                            <input type="text" placeholder="Ex: Corrida, Ciclismo, Academia..." value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>
                        
                                        <div className="input-group">
                                            <p>Solicitar Localização (Check-in)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar GPS)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Sincronizar com Strava?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Atividade)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificar com Google Fit / Apple Health?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Tempo de Treino)</option>
                                            </select>
                                        </div>


                                        <div className="input-group">
                                            <p>Validar Dieta (MyFitnessPal)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Importar Macros)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {categoria === "Outros" && (
                                    <>
                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Localização (Check-in)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar GPS)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Sincronizar com Strava?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Atividade)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificar com Google Fit / Apple Health?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Tempo de Treino)</option>
                                            </select>
                                        </div>


                                        <div className="input-group">
                                            <p>Validar Dieta (MyFitnessPal)?</p>
                                            <select>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Importar Macros)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de GitHub?</p>
                                            <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Validar Commits)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Verificação de app Forest?</p>
                                            <select value={exigirForest ? "Sim" : "Nao"} onChange={(e) => setExigirForest(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <p>Caso seu jogo esteja nessa lista ele possui suporte para uma gestao dos membros mais facilitado</p>
                                            <select>
                                                <option value="Valorant">Valorant</option>
                                                <option value="League of Legends">League of Legends</option>
                                                <option value="Fortinite">Fortinite</option>
                                                <option value="The Finals">The Finals</option>
                                                <option value="Call of Duty">Call of Duty</option>
                                            </select>
                                        </div>
                                    
                                    </>
                                    
                                )}

                                

                                {categoria === "Gaming" && (
                                    <>
                                        <div className="input-group">
                                            <p>Jogo Principal do Squad</p>
                                            <input type="text" placeholder="CS2, Valorant, Fortinet..." value={subCategoria} onChange={(e) => setSubCategoria(e.target.value) } />
                                            
                                        </div>

                                        <div className="input-group">
                                            <p>Solicitar Foto/Print/Video?</p>
                                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                                <option value="Nao">Não</option>
                                                <option value="Sim">Sim (Obrigatório)</option>
                                            </select>
                                        </div>
                                        
                                        <div className="input-group">
                                            <p>Caso seu jogo esteja nessa lista ele possui suporte para uma gestao dos membros mais facilitado</p>
                                            <select value={exigirContajg}  onChange={(e) => setExigirContajg(e.target.value)}>
                                                <option value="Outro">Outro</option>
                                                <option value="Valorant">Valorant</option>
                                                <option value="League of Legends">League of Legends</option>
                                                <option value="Fortinite">Fortinite</option>
                                                <option value="The Finals">The Finals</option>
                                                <option value="Call of Duty">Call of Duty</option>
                                            </select>
                                        </div>

                                    </>
                                )}
                            </div>
                        </>




                    )}
                    

                    <div className="fotos-grid">
                        <div className="input-group">
                            <p>Foto de Perfil (URL)</p>
                            <input type="text" value={fotoPerfil} onChange={(e) => setFotoPerfil(e.target.value)} placeholder="Link da imagem 1:1" />
                        </div>
                        <div className="input-group">
                            <p>Banner do Squad (URL)</p>
                            <input type="text" value={fotoBanner} onChange={(e) => setFotoBanner(e.target.value)} placeholder="Link da imagem horizontal" />
                        </div>
                    </div>

                    <div className="input-group">
                        <p>Imagem de Capa do Card (URL)</p>
                        <input type="text" value={fotoCapa} onChange={(e) => setFotoCapa(e.target.value)} placeholder="Link da imagem que aparece na Home" />
                    </div>

                    <button type="submit" className="btn-criar" disabled={enviando}>
                        {enviando ? "Fundando..." : "Criar Rank Squad"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CadastrarSquad;