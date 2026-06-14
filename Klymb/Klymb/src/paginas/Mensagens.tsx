import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import "./Mensagens.css";
import { useNavigate } from "react-router-dom";
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    documentId, 
    addDoc, 
    orderBy, 
    onSnapshot, 
    serverTimestamp 
} from "firebase/firestore";
import SeguidoresMensagem from "../componentes/SeguidoresMensagem";

function Mensagens({ usuario }) {
    const [mensagem, setMensagens] = useState("");
    const [amigosDados, setAmigosDados] = useState([]);
    const [amigoAtivo, setAmigoAtivo] = useState(null);
    const [historicoMensagens, setHistoricoMensagens] = useState([]);
    const navigate = useNavigate();

    const obterIdChat = (idA, idB) => {
        return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
    };

    const handleEnviar = async () => {
        if (!mensagem.trim() || !amigoAtivo || !usuario?.uid) return;

        const idChat = obterIdChat(usuario.uid, amigoAtivo.id);

        try {
            const mensagensRef = collection(db, "conversas", idChat, "mensagens");
            await addDoc(mensagensRef, {
                texto: mensagem.trim(),
                enviadoPor: usuario.uid,
                criadoEm: serverTimestamp()
            });

            setMensagens("");
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    // Função que formata o Timestamp do Firebase para HH:MM
    const formatarHorario = (criadoEm) => {
        if (!criadoEm) return "..."; 
        const data = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
        return data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    useEffect(() => {
        async function carregarDadosEPrefis() {
            const meuUid = usuario?.uid;
            if (!meuUid) return;

            try {
                const userDocRef = doc(db, "usuarios", meuUid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    setAmigosDados([]);
                    return;
                }

                const dadosDoMeuPerfil = userDocSnap.data();
                const idsList = dadosDoMeuPerfil?.usuario_seguindo;

                if (!idsList || idsList.length === 0) {
                    setAmigosDados([]);
                    return;
                }

                const q = query(collection(db, "usuarios"), where(documentId(), "in", idsList));
                const querySnapshot = await getDocs(q);
                
                const listaAmigos = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAmigosDados(listaAmigos);
            } catch (error) {
                console.error("Erro na carga de dados do chat:", error);
            }
        }

        carregarDadosEPrefis();
    }, [usuario]);

    useEffect(() => {
        if (!usuario?.uid || !amigoAtivo?.id) {
            setHistoricoMensagens([]);
            return;
        }

        const idChat = obterIdChat(usuario.uid, amigoAtivo.id);
        
        const mensagensRef = collection(db, "conversas", idChat, "mensagens");
        const q = query(mensagensRef, orderBy("criadoEm", "asc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const listaMsg = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistoricoMensagens(listaMsg);
        });

        return () => unsubscribe();
    }, [amigoAtivo, usuario]);

    return (
        <div className="mensagens-container">
            <div className="lateral-amigos">
                {amigosDados.map((amigo) => (
                    <SeguidoresMensagem 
                        key={amigo.id} 
                        usuario={amigo} 
                        onSelect={setAmigoAtivo}
                        ativo={amigoAtivo?.id === amigo.id}
                    />
                ))}

                {amigosDados.length === 0 && (
                    <p className="sem-amigos-aviso">
                        Você não segue ninguém ainda.
                    </p>
                )}
            </div>

            <div className="conteudo-mensagens">
                {amigoAtivo ? (
                    <>
                        <div className="topo-conversa" onClick={() => navigate(`/paginas/Perfil/${amigoAtivo.id}`)}>
                            <div className="foto-amigo">
                                <img src={amigoAtivo.fotoUrl || "https://via.placeholder.com/150"} alt={amigoAtivo.nome} />
                            </div>
                            <span className="nome-amigo-topo">{amigoAtivo.nome}</span>
                        </div>

                        <div className="corpo-conversa">
                            <p className="sistema-aviso">Início da conversa com {amigoAtivo.nome}</p>
                            
                            {historicoMensagens.map((msg) => {
                                const souEu = msg.enviadoPor === usuario?.uid;
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`balao-mensagem ${souEu ? "enviada" : "recebida"}`}
                                    >
                                        <p className="texto-mensagem">{msg.texto}</p>
                                        <span className="horario-mensagem">
                                            {formatarHorario(msg.criadoEm)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="input-mensagem">
                            <input 
                                type="text" 
                                placeholder="Digite sua mensagem..." 
                                value={mensagem} 
                                onChange={(e) => setMensagens(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                            />
                            <button onClick={handleEnviar}>Enviar</button>
                        </div>
                    </>
                ) : (
                    <div className="sem-conversa-selecionada">
                        <p>💬 Selecione um squad ou amigo para iniciar a conversa.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Mensagens;