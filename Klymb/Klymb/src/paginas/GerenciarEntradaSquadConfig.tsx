import { useEffect, useState } from "react";
import UsuariosLista from "../componentes/UsuariosLista";
import { collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import "./GerenciarEntradaSquadConfig.css";
import { useAlerta } from "../componentes/AlertaProvider";

function GerenciaEntradaSquadConfig() {
    const { id } = useParams();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const { exibirAlerta } = useAlerta();

    useEffect(() => {
        const buscarSolicitacoes = async () => {
            if (!id) return;
            try {
                const pendEntRef = collection(db, "squads", id, "solicitacao_entrada");
                const snapshot = await getDocs(pendEntRef);
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
        buscarSolicitacoes();
    }, [id]);

    const aceitarUsuario = async (user) => {
        try {
            const usuarioId = user.uid || user.id;

            if (!usuarioId) {
                alert("Erro: ID do usuário não encontrado.");
                return;
            }

            const userRef = doc(db, "usuarios", usuarioId);
            const squadRef = doc(db, "squads", id);
            const rankingMemberRef = doc(db, "squads", id, "ranking", usuarioId);
            const solicitacaoRef = doc(db, "squads", id, "solicitacao_entrada", usuarioId);

            const batch = writeBatch(db);
            batch.update(squadRef, {
                membros: arrayUnion(usuarioId)
            });

            batch.update(userRef, {
                squads_seguindo: arrayUnion(id)
            });

            batch.set(rankingMemberRef, {
                uid: usuarioId,
                nome: user.nome || "Recruta Anônimo",
                fotoUrl: user.foto || user.fotoUrl || "",
                pontos: 0,
                cargo: "Recruta",
                ultimaAtividade: serverTimestamp()
            });

            batch.delete(solicitacaoRef);
            await batch.commit();
            setSolicitacoes(prev => prev.filter(s => (s.uid || s.id) !== usuarioId));
            
            exibirAlerta(
                "Entrada Aprovada!", 
                `${user.nome} agora é um membro do squad!`
            );

        } catch (error) {
            console.error("Erro ao aceitar usuário:", error);
            alert("Erro ao processar a entrada. Tente novamente.");
        }
    };

    if (carregando) return <p>Carregando solicitações...</p>;

    return (
        <div className="gerenciar-container">
            <h3> Solicitações Pendentes ({solicitacoes.length})</h3>
            
            {solicitacoes.length > 0 ? (
                solicitacoes.map((user) => (
                    <UsuariosLista 
                        key={user.id}
                        id={user.uid}
                        nome={user.nome || "Sem nome"} 
                        foto={user.foto} 
                        acaoAceitar={() => aceitarUsuario(user)} 
                    />
                ))
            ) : (
                <p>Nenhuma solicitação no momento.</p>
            )}
        </div>
    );
}

export default GerenciaEntradaSquadConfig;