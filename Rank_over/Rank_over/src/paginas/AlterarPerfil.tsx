import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import "./AlterarPerfil.css";
import AlertaMsg from "../componentes/AlertaMsg"

function AlterarPerfil() {
    const { campo } = useParams();
    const navigate = useNavigate();
    const [valor, setValor] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSucesso, setMostrarSucesso] = useState(false);

    const configs: Record<string, { titulo: string; tipo: string }> = {
        nome: { titulo: "Nome de Usuário", tipo: "text" },
        senha: { titulo: "Senha", tipo: "password" },
        bio: { titulo: "Biografia", tipo: "text" },
        foto: { titulo: "URL da Foto", tipo: "url" }
    };

    const atual = configs[campo || "nome"] || configs.nome;

    const handleSalvar = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Usuário não encontrado!");
        
        setCarregando(true);
        try {

            const userRef = doc(db, "usuarios", user.uid);

            if (campo === "nome") {
                
                await updateProfile(user, { displayName: valor });
                await updateDoc(userRef, { nome: valor });
            } 
            
            else if (campo === "bio") {
                
                await updateDoc(userRef, { bio: valor });
            } 
            
            else if (campo === "foto") {
                // Atualiza foto no Auth e no Firestore
                await updateProfile(user, { photoURL: valor });
                await updateDoc(userRef, { fotoUrl: valor });
            } 
            
            else if (campo === "senha") {
                // Senha é apenas no Auth
                await updatePassword(user, valor);
            }

            setMostrarSucesso(true);
        } catch (error: any) {
            console.error("Erro ao atualizar:", error);
            alert("Erro: " + error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="alterar-pagina-container">
            {mostrarSucesso && (
                <AlertaMsg 
                    MsgTitulo="Sucesso!" 
                    Msg={`${atual.titulo} atualizado com sucesso.`} 
                    textoBotao="Voltar ao Perfil"
                    aoClicar={() => navigate("/paginas/Perfil")} // Ou navigate(-1)
                />
            )}

            <h1>Alterar {atual.titulo}</h1>
            
            <input 
                type={atual.tipo} 
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={`Digite seu novo ${atual.titulo}...`}
                disabled={carregando}
            />

            <div className="botoes-acoes">
                <button 
                    onClick={handleSalvar} 
                    disabled={carregando || !valor}
                    className="btn-salvar"
                >
                    {carregando ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={() => navigate(-1)} disabled={carregando}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default AlterarPerfil;