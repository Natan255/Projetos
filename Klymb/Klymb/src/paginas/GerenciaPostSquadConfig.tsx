import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, increment, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useAlerta } from "../componentes/AlertaProvider";

import PostSquad from "../componentes/PostSquad";
import "./GerenciarPostSquadConfig.css"

function GerenciaPostSquadConfig() {
    const { id } = useParams();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const { exibirAlerta } = useAlerta();

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
            const squadRef = doc(db, "squads", id);
            const squadSnap = await getDoc(squadRef);

            if (!squadSnap.exists()) {
                console.error("Squad não encontrado.");
                return;
            }

            const squadDados = squadSnap.data();

            if (squadDados.estilo === "Colecao" && squadDados.disputarRanking === true) {
                const rankingRef = doc(db, "squads", id, "ranking", post.idAutor);
                
                if (post.texto.length > 300) {
                    await updateDoc(rankingRef, {
                        pontos: increment(30) 
                    });
                }
                
                //Futuramente tem que ajeitar aqui pq ainda nao da pra botar fotos no site
                // |
                // |
                // v

                if (post.foto && post.foto !== "") {
                    await updateDoc(rankingRef, {
                        pontos: increment(10) 
                    });
                }
                await updateDoc(rankingRef, {
                    pontos: increment(20),
                    ultimaAtividade: serverTimestamp()
                });
                                      
            }
        } catch (error) {
            console.error("Erro ao acessar ranking:", error);
        }

        try {
            const postsRef = collection(db, "posts");

            await addDoc(postsRef, {
                titulo: post.titulo,
                texto: post.texto,
                idSquad: id,
                idAutor: post.idAutor,
                nomeAutor: post.nomeAutor || "Membro", 
                fotoAutor: post.fotoAutor || "",
                likes: [],
                comentarios: 0, 
                compartilhamento: 0,
                criadoEm: serverTimestamp(),
            });

            await deleteDoc(doc(db, "squads", id, "solicitacoes_posts", post.id));
            exibirAlerta("Post Aprovado!", "");

        } catch (error) {
            console.error("Erro ao aprovar post:", error);
        }
    };

    const recusarPost = async (postId) => {
        await deleteDoc(doc(db, "squads", id, "solicitacoes_posts", postId));
        exibirAlerta(
                "Post recusado!", 
                "",
                "Ok",
                () => navigate(-1)
            );
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