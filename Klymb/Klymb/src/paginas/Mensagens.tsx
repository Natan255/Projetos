import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc , getDoc, collection, query, where, getDocs, documentId } from "firebase/firestore";
import SeguidoresMensagem from "../componentes/SeguidoresMensagem";
import "./Mensagens.css";

function Mensagens({ usuario }) {
    const [mensagem, setMensagens] = useState("");
    const [amigosDados, setAmigosDados] = useState([]);
    const [amigoAtivo, setAmigoAtivo] = useState(null);

    const handleEnviar = () => {
        if (!mensagem.trim()) return;

        setMensagens("");
    };

    useEffect(() => {
        async function carregarDadosEPrefis() {
            
            const meuUid = usuario?.uid;
            
            if (!meuUid) {
                return;
            }
            
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
                    <p style={{ color: "#444", fontSize: "0.85rem", textAlign: "center", marginTop: "20px" }}>
                        Você não segue ninguém ainda.
                    </p>
                )}
            </div>

            <div className="conteudo-mensagens">
                {amigoAtivo ? (
                    <>

                        <div className="topo-conversa">
                            <div className="foto-amigo">
                                <img src={amigoAtivo.fotoPerfil || "https://via.placeholder.com/150"} alt={amigoAtivo.nome} />
                            </div>
                            <span className="nome-amigo-topo">{amigoAtivo.nome}</span>
                        </div>

                        <div className="corpo-conversa">
                            <p className="sistema-aviso">Início da conversa com {amigoAtivo.nome}</p>
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