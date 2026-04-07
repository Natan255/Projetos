import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import PostSquad from "../componentes/PostSquad";
import "./GerenciarPostSquadConfig.css"

function GerenciaPostSquadConfig() {
    const { id } = useParams(); // ID do Squad
    const [solicitacoes, setSolicitacoes] = useState([]);

    useEffect(() => {
        if (!id) return;

        const q = collection(db, "squads", id, "solicitacoes_posts");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSolicitacoes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [id]);

    const aprovarPost = async (post: any) => {
        if (!id) return;

        try {
            const postsRef = collection(db, "posts");

            await addDoc(postsRef, {
                titulo: post.titulo,
                texto: post.texto,
                idSquad: id,
                idAutor: post.idAutor, // ID de quem pediu o post
                nomeAutor: post.nomeAutor || "Membro", 
                fotoAutor: post.fotoAutor || "",
                likes: [],
                comentários: 0, 
                compartilhamento: 0,
                criadoEm: serverTimestamp(), // Data da aprovação
            });

            // 2. Deletar a solicitação (limpar a fila)
            await deleteDoc(doc(db, "squads", id, "solicitacoes_posts", post.id));
            
            alert("Post aprovado com sucesso!");

        } catch (error) {
            console.error("Erro ao aprovar post:", error);
        }
    };

    const recusarPost = async (postId) => {
        await deleteDoc(doc(db, "squads", id, "solicitacoes_posts", postId));
    };

    return (
        <div className="gerenciapost-container">
            <h1 className="divisao">Solicitações Pendentes</h1>
            
            {solicitacoes.length === 0 && <p>Nenhuma solicitação no momento.</p>}

            {solicitacoes.map((post) => (
                <div key={post.id} className="solicitacao-card">
                    <PostSquad 
                        {...post} 
                        likes={0} 
                        jaDeuLike={false} 
                        aoDarLike={() => {}} 
                    />
                    <div className="acoes-moderacao">
                        <button className="Postar" onClick={() => aprovarPost(post)}>Aprovar Post</button>
                        <button className="btn-config" onClick={() => recusarPost(post.id)}>Recusar</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default GerenciaPostSquadConfig;