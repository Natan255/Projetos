import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import "./AlterarPerfil.css"; // Pode reaproveitar o CSS ou criar um novo
import AlertaMsg from "../componentes/AlertaMsg"

function AlterarPerfilSquad({}) {
    // Pegamos o ID do squad e o CAMPO que queremos mudar da URL
    const { id, campo } = useParams(); 
    const navigate = useNavigate();
    
    const [valor, setValor] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);

    // Mapeamento de campos específicos do SQUAD
    const configs: Record<string, { titulo: string; tipo: string; banco: string }> = {
        nome: { titulo: "Nome do Squad", tipo: "text", banco: "nome" },
        descricao: { titulo: "Descrição", tipo: "text", banco: "descricao" },
        fotoBanner: { titulo: "Foto de banner do Squad", tipo: "url", banco: "fotoBanner" },
        fotoCapa: { titulo: "Foto de capa do Squad", tipo: "url", banco: "fotoCapa" },
        fotoPerfil: { titulo: "Foto de perfil do Squad", tipo: "url", banco: "fotoPerfil" },

    };

    const atual = configs[campo || "nome"] || configs.nome;

    const handleSalvar = async () => {
        if (!id) return alert("Squad não identificado!");
        
        setCarregando(true);
        try {
            // Referência direta para o documento do SQUAD
            const squadRef = doc(db, "squads", id);

            // Atualiza apenas no Firestore (Squads não usam Firebase Auth)
            await updateDoc(squadRef, {
                [atual.banco]: valor
            });

            setMostrarAlerta(true);
        } catch (error: any) {
            console.error("Erro ao atualizar squad:", error);
            alert("Erro: " + error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="alterar-pagina-container">
            {mostrarAlerta && (
                <AlertaMsg 
                    MsgTitulo="Sucesso!" 
                    Msg={`${atual.titulo} do squad atualizado.`} 
                    textoBotao="Voltar ao Squad"
                    aoClicar={() => navigate(`/paginas/PerfilSquad/${id}`)} // Volta para o perfil do squad
                />
            )}

            <h1>Alterar {atual.titulo}</h1>
            
            {/* Se for descrição, talvez prefira um <textarea> futuramente */}
            <input 
                type={atual.tipo} 
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={`Novo ${atual.titulo.toLowerCase()}...`}
                disabled={carregando}
            />

            <div className="botoes-acoes">
                <button 
                    onClick={handleSalvar} 
                    disabled={carregando || !valor}
                    className="btn-salvar"
                >
                    {carregando ? "Salvando..." : "Salvar Alteração"}
                </button>
                <button onClick={() => navigate(-1)} disabled={carregando}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default AlterarPerfilSquad;