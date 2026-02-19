import { useParams } from "react-router-dom";
import "./PerfilSquad.css";
import PostSquad from "../componentes/PostSquad"; // Ajustei o import aqui

function PerfilSquad({ squads }) {
    const { id } = useParams();
    const squadSelecionado = squads.find((s) => s.id === parseInt(id));

    const listaPosts = [
        { id: 1, userName: "Marcos_Foco", userImg: "https://i.pravatar.cc/150?u=1", title: "Cronograma de estudos", text: "Organizei um Notion brabo!", like: 25, comments: 8 },
        { id: 2, userName: "Ana_Dev", userImg: "https://i.pravatar.cc/150?u=2", title: "Dúvida React", text: "Como proteger rotas?", like: 12, comments: 4 },
        { id: 3, userName: "Cyber_Gamer", userImg: "https://i.pravatar.cc/150?u=3", title: "Rush de exercícios", text: "Bora fechar 50 questões?", like: 50, comments: 15 }
    ];

    if (!squadSelecionado) {
        return <h2 style={{ color: "white", padding: "100px" }}>Squad não encontrado!</h2>;
    }

    return (
        <div className="perfil-container">
            <div className="Fundo_perfil_squad">
                <img src={squadSelecionado.url} className="capa-img" alt="Capa" />
                <div className="perfil-header">
                    <div className="Foto_perfil_squad">
                        <img src={squadSelecionado.url} alt="Logo" />
                    </div>
                    <div className="Bios_squad">
                        <h1>{squadSelecionado.nome}</h1>
                        <p>{squadSelecionado.info}</p>
                        <div className="tags">
                            <span>#Produtividade</span>
                            <span>#Foco</span>
                        </div>
                    </div>
                    <div className="acoes">
                        <button className="btn-entrar">Pedir para Entrar</button>
                    </div>
                </div>
            </div>

            <div className="Rank_secao">
                <h2>🏆 Ranking de Produção de {squadSelecionado.nome}</h2>
                <div className="Rank_lista">
                    <div className="membro-rank item-topo">
                        <span className="posicao">1º</span>
                        <span className="nome">Usuário Exemplo</span>
                        <span className="producao">45h focadas</span>
                    </div>
                </div>
            </div>

            {/* SEÇÃO TIPO REDDIT */}
            <div className="Topicos_squad">
                <div className="Topicos_config">
                    <button className="Filtro">
                        -
                    </button>

                    <button className="Postar">
                        +
                    </button>
                </div>
                <div className="Topicos">
                    <h3 className="titulo_discussao">Discussões do Squad</h3>
                    {listaPosts.map((item) => (
                        <PostSquad key={item.id} post={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PerfilSquad;