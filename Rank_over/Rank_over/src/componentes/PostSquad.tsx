import "./Cardsquad.css"
import "./PostSquad.css"
function PostSquad({ post }) {
    return (
        <div className="Estrutura_post">
            <div className="Foto_perfil">
                <img src={post.userImg || "https://via.placeholder.com/40"} alt="foto perfil" />
                <p>{post.userName}</p>
            </div>

            <div className="Conteudo_Post">
                <h1>{post.title}</h1>
                <p>{post.text}</p>
            </div>

            <div className="Botoes_interacoes">
                <button className="btn_interacao btn_like">
                    <span className="icon">❤️</span>
                    <span className="count">{post.like}</span>
                </button>

                <button className="btn_interacao btn_comment">
                    <span className="icon">💬</span>
                    <span className="count">{post.comments}</span>
                </button>
            </div>
        </div>
    );
}

export default PostSquad;