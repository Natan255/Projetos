import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./ItemExpansao.css";

function ItemExpansao() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!id) return;

        // Escuta os detalhes do item específico em tempo real
        const unsubscribe = onSnapshot(
            doc(db, "colecaoItens", id),
            (docSnap) => {
                if (docSnap.exists()) {
                    setItem({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Item não encontrado no banco de dados.");
                    setItem(null);
                }
                setCarregando(false);
            },
            (error) => {
                console.error("Erro ao buscar detalhes do item:", error);
                setCarregando(false);
            }
        );

        return () => unsubscribe();
    }, [id]);

    if (carregando) {
        return <h2 className="item-aviso">Carregando detalhes do item...</h2>;
    }

    if (!item) {
        return (
            <div className="item-aviso-container">
                <h2 className="item-aviso">Item não encontrado ou inexistente.</h2>
                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    Voltar para o Perfil
                </button>
            </div>
        );
    }

    return (
        <div className="item-expansao-container">
            <div className="item-expansao-card">
                
                {/* Botão de Voltar integrado no topo */}
                <button className="btn-voltar-topo" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <div className="item-expansao-grid">
                    {/* Lado Esquerdo: Imagem do Banner/Item */}
                    <div className="item-expansao-media">
                        <img src={item.fotoBanner} alt={item.nome} />
                    </div>

                    {/* Lado Direito: Informações detalhadas */}
                    <div className="item-expansao-info">
                        <h1 className="item-titulo-detalhe">{item.nome}</h1>
                        
                        <div className="item-descricao-bloco">
                            <p>{item.info}</p>
                        </div>

                        {/* Se no futuro você adicionar campos extras (como raridade, data, etc), pode renderizar aqui */}
                        {item.raridade && (
                            <div className="item-meta-info">
                                <span>Raridade:</span>
                                <p className={`raridade-${item.raridade.toLowerCase()}`}>{item.raridade}</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ItemExpansao;