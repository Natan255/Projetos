import { useState, useEffect } from "react";
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
    const [mostrarSucesso, setMostrarSucesso] = useState(false);
    
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

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

        try {

            const docRef = await addDoc(collection(db, "squads"), {
                nome,
                descricao,
                categoria,
                metrica: metricaFinal,
                fotoPerfil,
                fotoBanner,
                fotoCapa,
                idCriador: auth.currentUser.uid,
                nomeCriador: auth.currentUser.displayName,
                membros: [auth.currentUser.uid],
                membrosCount: 1,
                postsCount: 0,
                visualizacoes: 0,
                status: "ativo",
                rankingGeral: {
                    [auth.currentUser.uid]: 0
                },
                criadoEm: serverTimestamp(),
            });
            const novoSquadId = docRef.id;
            const userRef = doc(db, "usuarios", auth.currentUser.uid);
            await updateDoc(userRef, {
                squads_admin: arrayUnion(novoSquadId)
            });
            setMostrarSucesso(true)
            
        } catch (error: any) {
            console.error("Erro ao criar squad:", error);
            alert("Erro ao criar: " + error.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        
        <div className="criars-container">
            {mostrarSucesso && (
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
                            {["Kills", "Metros", "Segundos", "Horas", "Linhas", "Outros"].map((m) => (
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