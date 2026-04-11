import { useState, useEffect, use } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion} from "firebase/firestore"; //pra poder editar sem apagar
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import AlertaMsg from "../componentes/AlertaMsg";

import "./CadastrarSquad.css";

function CadastrarSquad() {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoria, setCategoria] = useState("Estudos");
    const [metrica, setMetrica] = useState("Horas");
    const [outraMetrica, setOutraMetrica] = useState("");
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [fotoBanner, setFotoBanner] = useState("");
    const [fotoCapa, setFotoCapa] = useState("");
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [subCategoria, setSubCategoria] = useState("")

    
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();


    const [exigirFoto, setExigirFoto] = useState(false);
    const [exigirResumo, setExigirResumo] = useState(false);
    const [exigirCronometro, setExigirCronometro] = useState(false);
    const [exigirGithub, setExigirGithub] = useState(false);

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
    
        const fotoPerfilFinal = fotoPerfil.trim() === "" ? avatarPadrao : fotoPerfil;
        const fotoBannerFinal = fotoBanner.trim() === "" ? avatarPadrao : fotoBanner;
        const fotoCapaFinal = fotoCapa.trim() === "" ? fotoCapa : fotoCapa;

        try {

            const docRef = await addDoc(collection(db, "squads"), {
                nome,
                descricao,
                categoria,
                metrica: metricaFinal,
                fotoPerfil: fotoPerfilFinal,
                fotoBanner: fotoBannerFinal,
                fotoCapa: fotoCapaFinal,
                idCriador: auth.currentUser.uid,
                nomeCriador: auth.currentUser.displayName,
                membros: [auth.currentUser.uid],
                membrosCount: 1,
                postsCount: 0,
                visualizacoes: 0,
                status: "ativo",
                criadoEm: serverTimestamp(),
            });
            const novoSquadId = docRef.id

            const docRefDois = await addDoc(collection(db, "squads", novoSquadId, "ranking"),{
                uid: auth.currentUser.uid,
                nome: auth.currentUser.displayName || "Membro",
                fotoUrl: auth.currentUser.photoURL || "",
                pontos: 0 ,
                cargo: "adm",
                ultimaAtividade: serverTimestamp()


            })
            
            const userRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userRef, {
                squads_admin: arrayUnion(novoSquadId)
            });
            setMostrarAlerta(true)
            
        } catch (error: any) {
            console.error("Erro ao criar squad:", error);
            alert("Erro ao criar: " + error.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        
        <div className="criars-container">
            {mostrarAlerta && (
                <AlertaMsg 
                    MsgTitulo="Concluido!" 
                    Msg={`Squad criado com sucesso`} 
                    textoBotao="Voltar ao Perfil"
                    aoClicar={() => navigate("/")} // Ou navigate(-1)
                />
            )}
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
                        
                        <div className="input-group">
                            <p>Solicitar Foto/Print?</p>
                            <select value={exigirFoto ? "Sim" : "Nao"} onChange={(e) => setExigirFoto(e.target.value === "Sim")}>
                                <option value="Nao">Não</option>
                                <option value="Sim">Sim (Obrigatório)</option>
                            </select>
                        </div>
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
                                    <p>Verificação de GitHub?</p>
                                    <select value={exigirGithub ? "Sim" : "Nao"} onChange={(e) => setExigirGithub(e.target.value === "Sim")}>
                                        <option value="Nao">Não</option>
                                        <option value="Sim">Sim (Validar Commits)</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <p>Verificação de app Forest?</p>
                                    <select value={exigirResumo ? "Sim" : "Nao"} onChange={(e) => setExigirResumo(e.target.value === "Sim")}>
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
                                    <select value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)}>
                                        <option value="Corrida">🏃 Corrida / Caminhada</option>
                                        <option value="Ciclismo">🚴 Ciclismo</option>
                                        <option value="Academia">🏋️ Musculação / Crossfit</option>
                                        <option value="Futebol">⚽ Futebol</option>
                                    </select>
                                </div>

                                {(subCategoria === "Corrida" || subCategoria === "Ciclismo") && (
                                    <>
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
                                    </>
                                )}

                                {subCategoria === "Academia" && (
                                    <div className="input-group">
                                        <p>Verificar com Google Fit / Apple Health?</p>
                                        <select>
                                            <option value="Nao">Não</option>
                                            <option value="Sim">Sim (Validar Tempo de Treino)</option>
                                        </select>
                                    </div>
                                )}

                                <div className="input-group">
                                    <p>Validar Dieta (MyFitnessPal)?</p>
                                    <select>
                                        <option value="Nao">Não</option>
                                        <option value="Sim">Sim (Importar Macros)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        

                        {categoria === "Gaming" && (
                            <>
                                <div className="input-group">
                                    <p>Jogo Principal do Squad</p>
                                    <select value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)}>
                                        <option value="">Selecione um jogo...</option>
                                        <option value="LoL">League of Legends</option>
                                        <option value="valorant">Valorant</option>
                                        <option value="cs2">CS2</option>
                                        <option value="fortnite">Fortnite</option>
                                        <option value="chess">Chess</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>

                                {subCategoria === "LoL" && (
                                    <div className="input-group">
                                        <p>Critério de XP para LoL</p>
                                        <select>
                                            <option value="vitoria">Vitória (+50 XP)</option>
                                            <option value="kda">KDA (Kills/Assists)</option>
                                            <option value="objetivos">Objetivos (Torres/Dragões)</option>
                                            <option value="tempo">Tempo de Partida (Minutos)</option>
                                            <option value="mvp">Destaque (MVP pela API)</option>
                                            <option value="partida">Apenas concluir partida</option>
                                        </select>
                                    </div>
                                )}

                                {(subCategoria === "valorant" || subCategoria === "cs2" || subCategoria === "fortnite") && (
                                    <div className="input-group">
                                        <p>Critério de XP para FPS</p>
                                        <select>
                                            <option value="vitoria">Vitória (+50 XP)</option>
                                            <option value="headshot">Tiros na cabeça (HS %)</option>
                                            <option value="kda">Total de Abates (Kills)</option>
                                            <option value="mvp">MVP da Rodada</option>
                                            <option value="partida">Apenas concluir partida</option>
                                        </select>
                                    </div>
                                )}

                                {subCategoria === "chess" && (
                                    <div className="input-group">
                                        <p>Critério de XP para Xadrez</p>
                                        <select >
                                            <option value="vitoria">Vitória (+30 XP)</option>
                                            <option value="elo">Aumento de Rating (Elo)</option>
                                            <option value="precisao">Precisão da Partida (%)</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

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