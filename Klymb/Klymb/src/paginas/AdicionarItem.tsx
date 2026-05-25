import CardItem from "../componentes/CardItem";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AdicionarItem.css"; // Importando o CSS separado

interface AdicionarItemProps {
    usuario: User | null;
}

function AdicionarItem({ usuario }: AdicionarItemProps) {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [fotoBanner, setFotoBanner] = useState("");
    const [info, setInfo] = useState("");

    const adicionar = async () => {
        if (!nome || !fotoBanner || !info) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        // Segurança extra para garantir que o usuário está logado antes de atualizar o doc dele
        if (!usuario?.uid) {
            alert("Usuário não autenticado!");
            return;
        }

        try {
            console.log("Enviando item para aprovação:", { nome, fotoBanner, info });
            
            const colecaoRef = collection(db, "colecaoItens");
            const userRef = doc(db, "usuarios", usuario.uid);
            
            const docRef = await addDoc(colecaoRef, {
                nome: nome,
                fotoBanner: fotoBanner,
                info: info,
                idAutor: usuario.uid,
                nomeAutor: usuario.displayName,
                criadoEm: serverTimestamp()
            });

            await updateDoc(userRef, {
                colecao: arrayUnion(docRef.id)
            });
            setNome("");
            setFotoBanner("");
            setInfo("");
            
            navigate(-1);
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            alert("Houve um erro ao salvar o item.");
        }
    };

    return (
        <div className="add-item-container">
            <h1 className="add-item-titulo">Adicionar Item à Vitrine</h1>

            <div className="add-item-workspace">
                {/* FORMULÁRIO DE INPUTS */}
                <div className="add-item-form">
                    <input 
                        type="text" 
                        placeholder="Nome do Item" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="add-item-input"
                    />
                    <input 
                        type="text" 
                        placeholder="URL da Foto do Banner" 
                        value={fotoBanner} 
                        onChange={(e) => setFotoBanner(e.target.value)} 
                        className="add-item-input"
                    />
                    <textarea 
                        placeholder="Informações sobre o Item" 
                        value={info} 
                        onChange={(e) => setInfo(e.target.value)} 
                        className="add-item-textarea"
                        rows={4}
                    />
                    
                    <button onClick={adicionar} className="add-item-btn">
                        Adicionar Item
                    </button>
                </div>

                {/* PREVIEW EM TEMPO REAL */}
                <div className="add-item-preview">
                    <h3 className="preview-label">Pré-visualização</h3>
                    <CardItem 
                        nome={nome || "Nome do seu Item"} 
                        fotoBanner={fotoBanner || "https://via.placeholder.com/220x330?text=Rank+Over"} 
                        info={info || "As informações que você digitar vão aparecer aqui no verso do card."} 
                        id="preview" 
                    />
                </div>
            </div>
        </div>
    );
}

export default AdicionarItem;