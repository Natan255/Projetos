import "./PerfilConfig.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

function PerfilConfig({ usuario }) {
    const [privacidadePerfil, setPrivacidadePerfil] = useState("nao");
    const navigate = useNavigate();

    const atualizarPrivacidadePerfil = async (novoValor) => {
            try {
                const usuarioRef = doc(db, "usuarios", usuario.uid);
                await updateDoc(usuarioRef, {
                    privado: novoValor
                });
            } catch (error) {
                console.error("Erro ao atualizar solicitação de post:", error);
            }
        };
    return (
        <div className="config-container">
            <div className="config">
                <h2 className="config-titulo">Configurações</h2>
                
                {/* Cada Link envia um parâmetro diferente para a mesma página */}
                <Link to="/config/alterar/nome">
                    <button className="config-opcao">Alterar Nome</button>
                </Link>

                <Link to="/config/alterar/bio">
                    <button className="config-opcao">Alterar Bio</button>
                </Link>

                <Link to="/config/alterar/foto">
                    <button className="config-opcao">Alterar Foto de perfil</button>
                </Link>

                <Link to="/config/alterar/senha">
                    <button className="config-opcao">Alterar Senha</button>
                </Link>

                <section className="config-privacidade-grupo">
                    <label htmlFor="privacidadePerfil">Perfil privado?</label>
                    <select 
                        name="privacidadePerfil" 
                        id="privacidadePerfil" 
                        value={privacidadePerfil} 
                        onChange={(e) => {
                            const valor = e.target.value;
                            setPrivacidadePerfil(valor);
                            atualizarPrivacidadePerfil(valor); 
                        }}
                    >
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>
                </section>

                <button className="config-opcao" style={{ color: '#ff4444', borderColor: '#442222' }}>
                    Excluir Conta
                </button>

                <button className="config-voltar" onClick={() => navigate(-1)}>
                    ← Voltar ao perfil
                </button>
            </div>
        </div>
    );
}

export default PerfilConfig;