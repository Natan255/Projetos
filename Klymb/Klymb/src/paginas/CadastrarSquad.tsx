import { useState, useEffect } from "react";
import { db, auth, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useAlerta } from "../componentes/AlertaProvider";
import "./CadastrarSquad.css";

function CadastrarSquad() {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoria, setCategoria] = useState("Estudos");
    const [metrica, setMetrica] = useState("Pontos");
    const [outraMetrica, setOutraMetrica] = useState("");
    
    const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
    const [fotoCapaFile, setFotoCapaFile] = useState(null);
    
    const [subCategoria, setSubCategoria] = useState("");
    const [conteudoVotacao, setConteudoVotacao] = useState("");
    const [botaoVotacaoP, setbotaoVotacaoP] = useState("");
    const [botaoVotacaoN, setbotaoVotacaoN] = useState("");
    
    const [enviando, setEnviando] = useState(false);
    const [estilo, setEstilo] = useState("Pontos");
    const navigate = useNavigate();
    const { exibirAlerta } = useAlerta();

    const [exigirFoto, setExigirFoto] = useState(false);
    const [exigirResumo, setExigirResumo] = useState(false);
    const [exigirGithub, setExigirGithub] = useState(false);
    const [exigirForest, setExigirForest] = useState(false);
    const [exigirContajg, setExigirContajg] = useState("");
    const [restritoAoSquad, setRestritoAoSquad] = useState(true);
    const [dataEncerramento, setDataEncerramento] = useState("");
    const [disputarRanking, setDisputarRanking] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/paginas/Entrar");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Função auxiliar para fazer o upload do arquivo para o Firebase Storage
    const uploadArquivo = async (file, pasta, fallbackUrl) => {
        if (!file) return fallbackUrl;
        
        // Cria um nome único usando timestamp para evitar sobreposição de arquivos
        const nomeArquivo = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `squads/${pasta}/${nomeArquivo}`);
        
        await uploadBytesResumable(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;

        if (!auth.currentUser) return alert("Você precisa estar logado!");

        setEnviando(true);

        const metricaFinal = metrica === "Outros" ? outraMetrica : metrica;
        
        // Imagens de fallback caso o usuário não envie alguma delas
        const avatarPadrao = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=ff4d00&color=fff&size=512`;
        const bannerPadrao = `https://picsum.photos/id/15/1200/400`;

        const exigeConfigVotacao = estilo === "Votacao" || (estilo === "Colecao" && disputarRanking);

        try {
            // 1. Faz o upload das fotos selecionadas no input de arquivos
            const fotoPerfilFinal = await uploadArquivo(fotoPerfilFile, "perfis", avatarPadrao);
            const fotoCapaFinal = await uploadArquivo(fotoCapaFile, "capas", avatarPadrao);

            // 2. Salva o documento com as URLs finais resolvidas
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
                fotoCapa: fotoCapaFinal,
                solicitarEntrada: "sim",
                solicitarPost: "sim",
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
            
            const userRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userRef, {
                squads_admin: arrayUnion(novoSquadId),
                squads_seguindo: arrayUnion(novoSquadId)
            });

            exibirAlerta("Sucesso", "Squad criado com sucesso!");
            navigate("/");
            
        } catch (error) {
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
                            <option value="Votacao">Votação</option>
                            <option value="Colecao">Coleção/Entusiasta</option>
                        </select>
                    </div>

                    {/* Lógica de Estilos preservada... (Colecao, Votacao, Pontos) */}
                    {estilo === "Colecao" && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🏆 Estilo Coleção / Vitrine</h4>
                                <p>Ideal para os membros exibirem seu acervo...</p>
                            </div>

                            <div className="input-group">
                                <p>Esse grupo terá Ranking competitivo?</p>
                                <select value={disputarRanking ? "sim" : "nao"} onChange={(e) => setDisputarRanking(e.target.value === "sim")}>
                                    <option value="sim">Sim, queremos um ranking</option>
                                    <option value="nao">Não, apenas um espaço para compartilhar</option>
                                </select>
                            </div>

                            {disputarRanking && (
                                <>
                                    <div className="input-group">
                                        <p>O que tem que ser votado/Regras para pontuar no Rank</p>
                                        <input type="text" value={conteudoVotacao} placeholder="Ex: Votar se o item é original..." onChange={(e) => setConteudoVotacao(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <p>Quando a votação de um item deve encerrar?</p>
                                        <input type="number" value={dataEncerramento} placeholder="Ex: 5 (dias)" onChange={(e) => setDataEncerramento(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <p>Personalizar botões de voto</p>
                                        <div className="votos-custom-inputs" style={{ display: 'flex', gap: '10px' }}>
                                            <input type="text" value={botaoVotacaoN} placeholder="Padrão: Recusar" onChange={(e) => setbotaoVotacaoN(e.target.value)} />
                                            <input type="text" value={botaoVotacaoP} placeholder="Padrão: Aprovar" onChange={(e) => setbotaoVotacaoP(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
    
                    {estilo === "Votacao" && (
                        <>  
                            <div className="estilo-descricao-card">
                                <h4>🗳️ Estilo Votação Tradicional</h4>
                                <p>Focado em tomada de decisões com votações gerais do grupo...</p>
                            </div>
                            <div className="input-group">
                                <p>O que tem que ser votado/Regras</p>
                                <input type="text" value={conteudoVotacao} placeholder="Ex: Votar na melhor foto..." onChange={(e) => setConteudoVotacao(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <p>Quando a votação deve encerrar?</p>
                                <input type="number" value={dataEncerramento} required onChange={(e) => setDataEncerramento(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <p>Quem tem direito ao voto?</p>
                                <select value={restritoAoSquad ? "squad" : "publico"} onChange={(e) => setRestritoAoSquad(e.target.value === "squad")}>
                                    <option value="squad">Apenas membros do meu Squad</option>
                                    <option value="publico">Qualquer usuário da plataforma</option>
                                </select>
                            </div>
                        </>
                    )}

                    {estilo === "Pontos" && (
                        <>
                            <div className="estilo-descricao-card">
                                <h4>📈 Estilo Pontos</h4>
                                <p>O modelo competitivo puro do Rank Over...</p>
                            </div>
                            <div className="input-group">
                                <p>Métrica de Rank</p>
                                <div className="metrica-options">
                                    {["Kills", "Metros", "Segundos", "Horas", "Linhas", "Vitorias", "Repetição", "Pontos", "Outros"].map((m) => (
                                        <button key={m} type="button" className={metrica === m ? "active" : ""} onClick={() => setMetrica(m)}>{m}</button>
                                    ))}
                                </div>
                                {metrica === "Outros" && (
                                    <div className="input-outro">
                                        <input type="text" placeholder="Ex: Páginas lidas..." value={outraMetrica} onChange={(e) => setOutraMetrica(e.target.value)} required />
                                    </div>
                                )}
                            </div>

                            <div className="input-prova-container">
                                <h3 className="titulo-sessao-pequeno">Regras de Verificação</h3>
                                {categoria === "Estudos" && (
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
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* --- SEÇÃO DE FOTOS AJUSTADA --- */}
                    <div className="fotos-grid">
                        <div className="input-group-file">
                            <p>Foto de Perfil</p>
                            <label className="custom-file-upload">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setFotoPerfilFile(e.target.files[0])} 
                                />
                                {fotoPerfilFile ? `Selecionado: ${fotoPerfilFile.name}` : "Selecionar Foto de Perfil"}
                            </label>
                        </div>
                        
                        <div className="input-group-file">
                            <p>Foto de Capa</p>
                            <label className="custom-file-upload">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setFotoCapaFile(e.target.files[0])} 
                                />
                                {fotoCapaFile ? `Selecionado: ${fotoCapaFile.name}` : "Selecionar Foto da Capa"}
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-criar" disabled={enviando}>
                        {enviando ? "Fazendo Upload e Criando..." : "Criar Rank Squad"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CadastrarSquad;