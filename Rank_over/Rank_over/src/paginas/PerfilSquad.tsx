import { useParams } from "react-router-dom"; // Importe o useParams
import "./PerfilSquad.css"

function PerfilSquad({ squads }) {
    // 1. Pegamos o ID que veio da URL (aquele que você colocou no Link do CardSquad)
    const { id } = useParams();

    // 2. Procuramos na lista de squads qual deles tem o ID igual ao da URL
    const squadSelecionado = squads.find((s) => s.id === parseInt(id));

    // 3. Caso o ID não exista ou a página seja carregada errada
    if (!squadSelecionado) {
        return <h2 style={{color: "white", padding: "100px"}}>Squad não encontrado!</h2>;
    }

    return (
        <div className="perfil-container">
            <div className="Fundo_perfil">
                {/* Agora usamos squadSelecionado.url ou .capa */}
                <img src={squadSelecionado.url} className="capa-img" alt="Capa" />
                
                <div className="perfil-header">
                    <div className="Foto_perfil">
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
        </div>
    );
}

export default PerfilSquad;