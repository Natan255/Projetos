import { useParams } from "react-router-dom";
import "./PerfilSquad.css";
import PostSquad from "../componentes/PostSquad";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Certifique-se de importar o db

// Adicionamos 'usuario' nas props que vêm do App.tsx
function PerfilSquad({ squads, usuario }) {
    const { id } = useParams();
    const squadSelecionado = squads.find((s) => s.id === id);

    // Verifica se o usuário atual está na lista de seguidores do squad
    const jaSegue = squadSelecionado?.seguidores?.includes(usuario?.uid);

    const listaPosts = [
        { id: 1, userName: "Marcos_Foco", userImg: "https://i.pravatar.cc/150?u=1", title: "Cronograma de estudos", text: "Organizei um Notion brabo!", like: 25, comments: 8 },
        { id: 2, userName: "Ana_Dev", userImg: "https://i.pravatar.cc/150?u=2", title: "Dúvida React", text: "Como proteger rotas?", like: 12, comments: 4 },
        { id: 3, userName: "Cyber_Gamer", userImg: "https://i.pravatar.cc/150?u=3", title: "Rush de exercícios", text: "Bora fechar 50 questões?", like: 50, comments: 15 }
    ];

    const gerenciarSeguir = async () => {
        if (!usuario) {
            alert("Você precisa estar logado para entrar em um squad!");
            return;
        }

        const userRef = doc(db, "usuarios", usuario.uid);
        const squadRef = doc(db, "squads", squadSelecionado.id);

        try {
            if (!jaSegue) {
                await updateDoc(userRef, {
                    squads_seguindo: arrayUnion(squadSelecionado.id)
                });
                await updateDoc(squadRef, {
                    seguidores: arrayUnion(usuario.uid)
                });
                console.log("Agora você segue este squad!");
            } else {
                await updateDoc(userRef, {
                    squads_seguindo: arrayRemove(squadSelecionado.id)
                });
                await updateDoc(squadRef, {
                    seguidores: arrayRemove(usuario.uid)
                });
                console.log("Você saiu do squad.");
            }
        } catch (error) {
            console.error("Erro na operação:", error);
        }
    };

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
                            {/* Mostra a contagem real de seguidores */}
                            <span >
                                🔥 {squadSelecionado.seguidores?.length || 0} Membros
                            </span>
                        </div>
                    </div>
                    <div className="acoes">
                        {/* Botão dinâmico: muda texto e cor se já segue */}
                        <button 
                            className={jaSegue ? "btn-sair" : "btn-entrar"} 
                            onClick={gerenciarSeguir}
                        >
                            {jaSegue ? "Sair do Squad" : "Entrar no Squad"}
                        </button>
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

            <div className="Topicos_squad">
                <div className="Topicos_config">
                    <button className="Filtro">-</button>
                    <button className="Postar">+</button>
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