import { useParams, useNavigate, Link } from "react-router-dom";

function PerfilSquadConfig() {
    const { id } = useParams(); // Pega o ID do squad que veio do perfil
    const navigate = useNavigate();

    return (
        <div className="config-container">
            <div className="config">
                <h2 className="config-titulo">Configurações da exibição do Squad</h2>
                
                {/* Agora incluímos o ID na rota para o próximo componente saber quem editar */}
                <Link to={`/squadconfig/alterar/${id}/nome`}>
                    <button className="config-opcao">Alterar Nome</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/descricao`}>
                    <button className="config-opcao">Alterar Descrição</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoBanner`}>
                    <button className="config-opcao">Alterar banner</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoCapa`}>
                    <button className="config-opcao">Alterar capa</button>
                </Link>

                <Link to={`/squadconfig/alterar/${id}/fotoPerfil`}>
                    <button className="config-opcao">Alterar foto de perfil</button>
                </Link>

                <h2 className="config-titulo">Configurações dos membros Squad</h2>

                <Link to={`/squadconfig/alterar/${id}/mode`}>
                    <button className="config-opcao">Gerenciar moderadores</button>
                </Link>

                <Link to={`/squadconfig/administrar/${id}/administrar`}>
                    <button className="config-opcao">Gerenciar usuario</button>
                </Link>

                <button className="config-voltar" onClick={() => navigate(-1)}>
                    ← Voltar ao perfil
                </button>
            </div>
        </div>
    );
}
export default PerfilSquadConfig