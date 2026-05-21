import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import "./AlterarPerfil.css";
import { useAlerta } from "../componentes/AlertaProvider";

function AlterarPerfilSquad() {
    const { id, campo } = useParams();
    const { exibirAlerta } = useAlerta();
    const navigate = useNavigate();
    const [valor, setValor] = useState("");
    const [carregando, setCarregando] = useState(false);


    const configs: Record<string, { titulo: string; tipo: string }> = {
        nome: { titulo: "Nome do Squad", tipo: "text" },
        descricao: { titulo: "Descrição do Squad", tipo: "text" }, // Corrigido de password para text
        mural: { titulo: "Mural do Squad", tipo: "text" },
    };

    const atual = configs[campo || "nome"] || configs.nome;

    const handleSalvar = async () => {
        if (!valor.trim()) return;

        setCarregando(true);
        try {
            const squadRef = doc(db, "squads", id);

            if (campo === "nome") {
                await updateDoc(squadRef, { nome: valor });
            } 
            else if (campo === "descricao") {
                await updateDoc(squadRef, { descricao: valor });
            } 
            else if (campo === "mural") {
                await updateDoc(squadRef, { mural: valor });
            }

            exibirAlerta("Sucesso", `${atual.titulo} atualizado com sucesso!`);
        } catch (error: any) {
            console.error("Erro ao atualizar o squad:", error);
            alert("Erro: " + error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="alterar-pagina-container">


            <h1>Alterar {atual.titulo}</h1>
            
            {/* Renderização condicional limpa: Usa textarea para descrições longas e input normal para o restante */}
            {(campo === "mural") ? (
                <textarea
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Digite a nova ${atual.titulo}...`}
                    disabled={carregando}
                    rows={4}
                    className="alterar-textarea"
                />
            ) : (
                <input 
                    type={atual.tipo} 
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Digite o novo ${atual.titulo}...`}
                    disabled={carregando}
                    className="alterar-input"
                />
            )}

            <div className="botoes-acoes">
                <button 
                    onClick={handleSalvar} 
                    disabled={carregando || !valor.trim()}
                    className="btn-salvar"
                >
                    {carregando ? "Salvando..." : "Salvar"}
                </button>
                <button 
                    onClick={() => navigate(-1)} 
                    disabled={carregando}
                    className="btn-cancelar"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default AlterarPerfilSquad;