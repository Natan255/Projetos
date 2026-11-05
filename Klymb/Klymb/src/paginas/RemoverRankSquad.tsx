import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

interface RankExtra {
    id: string;
    nome?: string;
    [key: string]: any;
}

function RemoverRankSquad() {
    const [ranksExtras, setRanksExtras] = useState<RankExtra[]>([]);
    const { id: squadId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!squadId) return;

        const buscarRanksExtras = async () => {
            try {
                const ranksExtraRef = collection(db, "squads", squadId, "ranks_extra");
                const ranksExtraSnap = await getDocs(ranksExtraRef);
                
                const listaRanks: RankExtra[] = ranksExtraSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setRanksExtras(listaRanks);
            } catch (error) {
                console.error("Erro ao buscar ranks extras:", error);
            }
        };

        buscarRanksExtras();
    }, [squadId]);

    const lidarRemoverRank = async (rankId: string) => {
        if (!window.confirm(`Tem certeza que deseja remover o rank "${rankId}" por completo do squad?`)) return;

        try {
            const rankDocRef = doc(db, "squads", squadId!, "ranks_extra", rankId);
            await deleteDoc(rankDocRef);
            
            setRanksExtras(prev => prev.filter(r => r.id !== rankId));
            alert("Rank removido com sucesso!");
        } catch (error) {
            console.error("Erro ao remover rank:", error);
        }
    };

    return (
        <div className="config-membros-container">
            <h1>Alterar ranks do squad</h1>

            <div className="lista-membros">
                <h3>Ranks Alternativos Ativos</h3>
                {ranksExtras.length === 0 && <p className="vazio">Nenhum rank extra encontrado para este squad.</p>}
                
                {ranksExtras.map((rank) => (
                    <div key={rank.id} className="linha-gestao-usuario" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>

                        <span>{rank.nomeRank}</span>
                        
                        <div className="botoes-gestao">
                            <button className="btn-banir" onClick={() => lidarRemoverRank(rank.id)}>
                                Deletar Rank
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn-voltar" onClick={() => navigate(-1)}>Voltar</button>
        </div>
    );
}

export default RemoverRankSquad;