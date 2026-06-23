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

            // 1. Calcula a pontuação base do post de forma unificada
            let pontosAGanhar = 20; // Pontos fixos por aprovação
            if (post.texto && post.texto.length > 300) pontosAGanhar += 30;
            if (post.foto && post.foto !== "") pontosAGanhar += 10;

            // 2. Atualiza o Ranking Principal (se estiver ativo no cadastro do Squad)
            if (squadDados.estilo === "Colecao" && squadDados.disputarRanking === true) {
                const rankingPrincipalRef = doc(db, "squads", id, "ranking", post.idAutor);
                
                // Um único update resolve toda a pontuação do principal
                await updateDoc(rankingPrincipalRef, {
                    pontos: increment(pontosAGanhar),
                    ultimaAtividade: serverTimestamp()
                });
            }

            // 3. ATUALIZAÇÃO DOS RANKS EXTRAS (Competitivos ou Não)
            // Vamos buscar a subcoleção de configurações de ranks extras do squad
            const ranksExtraSnapshot = await getDocs(collection(db, "squads", id, "ranks_extra"));
            
            // Iteramos por cada rank extra que o admin cadastrou para este squad
            const promessasRanks = ranksExtraSnapshot.docs.map(async (rankDoc) => {
                const dadosRankExtra = rankDoc.data();

                // Aqui você decide a regra. Exemplo: 
                // Todos os ranks extras ganham os mesmos pontos? Ou apenas os que estão ativos?
                // Se o rank extra tiver um campo 'acumulaComPost: true' no cadastro, pontuamos:
                
                const rankExtraMembroRef = doc(
                    db, 
                    "squads", 
                    id, 
                    "ranks_extra", 
                    rankDoc.id, // ID do Rank Extra (ex: "maratona-xp")
                    "ranking", 
                    post.idAutor // ID do jogador
                );

                // Atualiza (ou cria) os pontos do usuário dentro deste rank específico
                return updateDoc(rankExtraMembroRef, {
                    pontos: increment(pontosAGanhar),
                    ultimaAtividade: serverTimestamp()
                }).catch(async (err) => {
                    // Caso o usuário ainda não tenha registro nesse rank extra, tratamos o erro criando o doc
                    if (err.code === "not-found") {
                        const usuarioSnap = await getDoc(doc(db, "squads", id, "ranking", post.idAutor));
                        const nomeUsuario = usuarioSnap.exists() ? usuarioSnap.data().nome : "Membro";
                        
                        await setDoc(rankExtraMembroRef, {
                            nome: nomeUsuario,
                            pontos: pontosAGanhar,
                            ultimaAtividade: serverTimestamp()
                        });
                    }
                });
            });

            // Aguarda todos os ranks extras serem atualizados em paralelo
            await Promise.all(promessasRanks);

        } catch (error) {
            console.error("Erro ao processar pontuações dos rankings:", error);
        }

        // 4. Criação do Post e Deleção da Solicitação (Seu código original mantido)
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
            console.error("Erro ao criar post ou remover solicitação:", error);
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