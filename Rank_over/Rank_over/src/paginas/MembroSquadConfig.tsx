import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import UsuariosLista from "../componentes/UsuariosLista";
import "./MembroSquadConfig.css";

function MembroSquadConfig() {
    const { id, campo } = useParams(); 
    const navigate = useNavigate();
    const [squad, setSquad] = useState<any>(null);
    const [usuariosDetalhados, setUsuariosDetalhados] = useState<any[]>([]);


    // 1. Busca os dados básicos do Squad
    useEffect(() => {
        const carregarSquad = async () => {
            if (!id) return;
            const docRef = doc(db, "squads", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setSquad(snap.data());
            }
        };
        carregarSquad();
    }, [id]);

    let listaIds: string[] = [];
   if (squad) {
        if (campo === "mode") {
             listaIds = squad.moderadores || [];
        } else {
             listaIds = squad.membros || [];
        }
    }
    
    useEffect(() => {
        const buscarDadosUsuarios = async () => {
            if (listaIds.length === 0) {
                setUsuariosDetalhados([]);
                return;
            }

            try {
                const usersRef = collection(db, "usuarios");
                const q = query(usersRef, where("__name__", "in", listaIds));
                const querySnapshot = await getDocs(q);
                
                const dados = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("Usuários encontrados no banco:", dados);
                setUsuariosDetalhados(dados);
            } catch (e) {
                console.error("Erro:", e);
            }
        };

        buscarDadosUsuarios();
    }, [listaIds.join(",")]); // O .join(",") faz o React perceber se qualquer ID da lista mudou


    // Função para Promover Membro a Moderador
    const promoverParaMod = async (membroId: string) => {
        if (!window.confirm("Tornar este usuário um moderador?")) return;
        try {
            const squadRef = doc(db, "squads", id!);
            await updateDoc(squadRef, {
                membros: arrayRemove(membroId),
                moderadores: arrayUnion(membroId)
            });
            window.location.reload();
        } catch (e) {
            alert("Erro ao promover.");
        }
    };

    // Função para Remover/Banir
    const removerMembro = async (membroId: string) => {
        const acao = campo === "mode" ? "remover cargo" : "banir";
        if (!window.confirm(`Deseja ${acao} deste usuário?`)) return;
        try {
            const squadRef = doc(db, "squads", id!);
            const campoBanco = campo === "mode" ? "moderadores" : "membros";
            await updateDoc(squadRef, { [campoBanco]: arrayRemove(membroId) });
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    };

    if (!squad) return <div className="loading">Carregando Squad...</div>;

    return (
        <div className="config-membros-container">
            <h1>Gerenciar {campo === "mode" ? "Moderadores" : "Usuários"}</h1>
            


            <div className="lista-membros">
                <h3>{campo === "mode" ? "Moderadores Atuais" : "Membros do Squad"}</h3>
                {usuariosDetalhados.length === 0 && <p className="vazio">Nenhum usuário encontrado.</p>}
                
                {usuariosDetalhados.map((user) => (
                    <div key={user.id} className="linha-gestao-usuario">
                        <UsuariosLista 
                            id={user.id} 
                            nome={user.nome || "Sem nome"} 
                            foto={user.fotoUrl} 
                        />
                        
                        <div className="botoes-gestao">
                            {campo !== "mode" && (
                                <button className="btn-promover" onClick={() => promoverParaMod(user.id)}>
                                    👑 Mod
                                </button>
                            )}
                            <button className="btn-banir" onClick={() => removerMembro(user.id)}>
                                {campo === "mode" ? "Tirar Mod" : "Banir"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn-voltar" onClick={() => navigate(-1)}>Voltar</button>
        </div>
    );
}

export default MembroSquadConfig;