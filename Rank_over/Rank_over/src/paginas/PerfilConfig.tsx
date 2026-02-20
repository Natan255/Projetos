import "./PerfilConfig.css";
import { useNavigate } from "react-router-dom";

function PerfilConfig({ usuario }) {
    const navigate = useNavigate();

    return (
        <div className="config-container">
            <div className="config">
                <h2 className="config-titulo">Configurações</h2>
                <button className="config-opcao">Alterar Nome</button>
                <button className="config-opcao">Alterar Bio</button>
                <button className="config-opcao">Alterar Foto de perfil</button>
                <button className="config-opcao">Alterar Banner</button>
                <button className="config-opcao">Alterar Senha</button>

                <button className="config-opcao"style={{ color: '#ff4444', borderColor: '#442222' }}>
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