import { useEffect, useState } from "react";
import UsuariosLista from "../componentes/UsuariosLista";
import { collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion, setDoc, serverTimestamp } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";

function GerenciaEntradaSquadConfig() {
    const { id } = useParams();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);

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
            const squadRef = doc(db, "squads", id);
            const rankingMemberRef = doc(db, "squads", id, "ranking", user.uid);
            await updateDoc(squadRef, {
                membros: arrayUnion(user.uid)
            });

            await setDoc(rankingMemberRef, {
                uid: user.uid,
                nome: user.nome,
                fotoUrl: user.foto || "",
                pontos: 0,
                cargo: "Recruta",
                ultimaAtividade: serverTimestamp()
            });

            await deleteDoc(doc(db, "squads", id, "solicitacao_entrada", user.id));
            setSolicitacoes(prev => prev.filter(s => s.id !== user.id));

        } catch (error) {
            console.error("Erro ao aceitar usuário:", error);
            alert("Erro ao processar a entrada.");
        }
    };

    if (carregando) return <p>Carregando solicitações...</p>;

    return (
        <div className="gerenciar-container">
            <h3>📩 Solicitações Pendentes ({solicitacoes.length})</h3>
            
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