import "./PerfilConfig.css";
import { useNavigate, Link } from "react-router-dom"; // Importado o Link aqui

function PerfilConfig({ usuario }) {
    const navigate = useNavigate();

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