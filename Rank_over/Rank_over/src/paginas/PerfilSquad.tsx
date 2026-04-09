import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./PerfilSquad.css";
import PostSquad from "../componentes/PostSquad";
import Modal from "../componentes/Modal";
import { getDoc, addDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";


function PerfilSquad({ squads, usuario }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const squadSelecionado = squads.find((s) => s.id === id);
    const isOwner = squadSelecionado?.idCriador === usuario?.uid;
    const isMod = squadSelecionado?.moderadores?.includes(usuario?.uid);
    const temPermissaoEspecial = isOwner || isMod;

    const [modalAberto, setModalAberto] = useState(false);
    const [posts, setPosts] = useState([])
    const [ranking, setRanking] = useState([]);
    const [solicitacaoPend, setSolicitacaoPend] = useState(false);

    const jaSegue = squadSelecionado?.membros?.includes(usuario?.uid);
    const consultarRanking = async (squadId) => {
       
        const rankingRef = collection(db, "squads", squadId, "ranking");
    
        const q = query(rankingRef, orderBy("pontos", "desc"));

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    };
    
    
    const gerenciarLike = async (postId, jaDeuLike) => {
        if (!usuario) return alert("Logue para curtir!");

        const postRef = doc(db, "posts", postId);

        try {
            if (jaDeuLike) {
                await updateDoc(postRef, {
                    quemDeuLike: arrayRemove(usuario.uid)
                });
            } else {

                await updateDoc(postRef, {
                    quemDeuLike: arrayUnion(usuario.uid)
                });
            }
        } catch (error) {
            console.error("Erro ao processar like:", error);
        }
    };

    const solicitarPost = async (dadosDoPost) => { // dadosDoPost vem do seu componente Modal
        if (!usuario || !id) return;

        try {
            await addDoc(collection(db, "squads", id, "solicitacoes_posts"), {
                titulo: dadosDoPost.titulo,
                texto: dadosDoPost.texto,
                idAutor: usuario.uid,
                nomeAutor: usuario.displayName,
                fotoAutor: usuario.photoURL || "",
                criadoEm: serverTimestamp(),
                status: "pendente" 
            });

            setModalAberto(false);

        } catch (error) {
            console.error("Erro ao solicitar post:", error);
        }
    };

    const solicitarEntrada = async () => {

        try{
            const docRef = doc(db, "squads", id, "solicitacao_entrada", usuario.uid);
        
            await setDoc(docRef, {
                uid: usuario.uid,
                nome: usuario.displayName || "Membro", // displayName é o padrão do Firebase Auth
                foto: usuario.photoURL || "",
                dataSolicitacao: serverTimestamp()
            });
            
            setSolicitacaoPend(true)

        }catch (error) {
            console.error("Erro ao solicitar:", error);
        }



    }

    const salvarPost = async (dadosDoModal: { titulo: string, texto: string }) => {
        try {
            const postsRef = collection(db, "posts");
            await addDoc(postsRef, {
                titulo: dadosDoModal.titulo,
                texto: dadosDoModal.texto,
                idSquad: id,
                idAutor: usuario.uid,
                nomeAutor: usuario.displayName || "Membro", // Salva o nome real
                fotoAutor: usuario.photoURL || "",
                likes: [],
                comentários: 0, 
                compartilhamento: 0,
                criadoEm: serverTimestamp(),
            });

            setModalAberto(false);
            
            const novosPosts = await buscarPostsDoSquad(id);
            setPosts(novosPosts);

        } catch (error) {
            console.error("Erro ao salvar post:", error);
        }
    };

    const buscarPostsDoSquad = async (squadId) => {
        const postsRef = collection(db, "posts");
        
        const q = query(
            postsRef, 
            where("idSquad", "==", squadId),
            orderBy("criadoEm", "desc") // Os mais novos primeiro
        );

        const querySnapshot = await getDocs(q);
        const listaPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        return listaPosts;
        };

    const gerenciarSeguir = async () => {
        if (!usuario) return alert("Logue primeiro!");
        if (!usuario) return alert("Logue primeiro!");
        if (!id) return;
        if (!squadSelecionado) return;

        const userRef = doc(db, "usuarios", usuario.uid);
        const squadRef = doc(db, "squads", id);
        const rankingMemberRef = doc(db, "squads", id, "ranking", usuario.uid);

        try {
            if (jaSegue === true) {
                await updateDoc(userRef, { squads_seguindo: arrayRemove(id) });
                await updateDoc(squadRef, { membros: arrayRemove(usuario.uid) });
                await deleteDoc(rankingMemberRef); 
                
            } 
            else {
                await updateDoc(userRef, { squads_seguindo: arrayUnion(id) });
                await updateDoc(squadRef, { membros: arrayUnion(usuario.uid) });
                await setDoc(rankingMemberRef, {
                    uid: usuario.uid,
                    nome: usuario.displayName || "Membro",
                    fotoUrl: usuario.photoURL || "",
                    pontos: 0,
                    cargo: "Recruta",
                    ultimaAtividade: serverTimestamp()
                });

            }
        } catch (error) {
            console.error("Erro na operação:", error);
        }
    };

    useEffect(() => {
        if (!id) return;
        const postsRef = collection(db, "posts");
        const q = query(
            postsRef, 
            where("idSquad", "==", id),
            orderBy("criadoEm", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const listaPosts = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setPosts(listaPosts);
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const rankingRef = collection(db, "squads", id, "ranking");
        const qRanking = query(rankingRef, orderBy("pontos", "desc"));

        const unsubscribeRanking = onSnapshot(qRanking, (querySnapshot) => {
            const listaRanking = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setRanking(listaRanking);
        });

        return () => unsubscribeRanking();
    }, [id]);


    useEffect(() => {
        const verificarStatus = async () => {
            // Corrigido: usamos 'usuario' que vem das props
            if (!usuario || !id || jaSegue) return;

            try {
                // Referência para o documento do usuário na sub-coleção de solicitações
                const docRef = doc(db, "squads", id, "solicitacao_entrada", usuario.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSolicitacaoPend(true);
                }
            } catch (error) {
                console.error("Erro ao verificar status de solicitação:", error);
            }
        };

        verificarStatus();
    }, [id, usuario, jaSegue]);

    if (!squadSelecionado) {
        return
    }

    return (
        <div className="perfil-container">
            <div className="Fundo_perfil_squad">
                <img src={squadSelecionado.fotoCapa} className="capa-img" alt="Capa" />
                <div className="perfil-header">
                    <div className="Foto_perfil_squad">
                        <img src={squadSelecionado.fotoPerfil} alt="Logo" />
                    </div>
                    <div className="Bios_squad">
                        <h1>
                            {squadSelecionado.nome} 
                            {isOwner && <span title="Você é o dono"> 👑</span>}
                            {isMod && !isOwner && <span title="Você é moderador"> 🛡️</span>}
                        </h1>
                        <p>{squadSelecionado.descricao}</p>
                        <div className="tags">
                            <span>#Produtividade</span>
                            <span>#Foco</span>
                            <span >
                                🔥 {squadSelecionado.membros?.length || 0} Membros
                            </span>
                        </div>
                    </div>
                    <div className="acoes">
                        {temPermissaoEspecial && (
                            <button className="btn-config" onClick={() => navigate(`/paginas/PerfilSquadconfig/${id}`)}>
                                ⚙️ Configurar Squad
                            </button>
                        )}

                        {!isOwner && (
                            <>
                                {jaSegue ? (
                                    <button className="btn-sair" onClick={gerenciarSeguir}>
                                        Sair do Squad
                                    </button>
                                ) : solicitacaoPend ? (
                                    <button className="btn-pendente" disabled>
                                        ⏳ Aguardando Aprovação
                                    </button>
                                ) : (
                                    /* ESTADO 3: Ainda não solicitou */
                                    <button className="btn-entrar" onClick={solicitarEntrada}>
                                        Entrar no Squad
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="Rank_secao">
                <h2>🏆 Ranking de Produção de {squadSelecionado.nome}</h2>

                {ranking.length > 0 ? (
                    <div className="Rank_container">
                        
                        {/* --- BLOCO DO PÓDIO (TOP 3) --- */}
                        <div className="Podio_container">
                            {ranking.slice(0, 3).map((membro, index) => {
                                const classes = ["primeiro", "segundo", "terceiro"];
                                const medalhas = ["🥇", "🥈", "🥉"];
                                const ordemVisual = index === 0 ? 2 : index === 1 ? 1 : 3;

                                return (
                                    <div key={membro.uid} className={`card-podio ${classes[index]}`} style={{ order: ordemVisual }}>
                                        <div className="medalha">{medalhas[index]}</div>
                                        <span className="nome">{membro.nome}</span>
                                        <span className="producao">
                                            {membro.pontos} {squadSelecionado.metrica}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- LISTA DO RESTANTE (4º em diante) --- */}
                        <div className="Rank_lista">
                            {ranking.slice(3).map((membro, index) => (
                                <div key={membro.uid} className="membro-rank">
                                    <span className="posicao">{index + 4}º</span>
                                    <span className="nome">{membro.nome}</span>
                                    <span className="producao">
                                        {membro.pontos} {squadSelecionado.metrica}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>Nenhum dado de ranking disponível.</p>
                )}
            </div>
            
            <div className="Topicos_squad">
                <h3 className="divisao"></h3>
                <div className="Topicos_config">
                    <button className="Filtro">Filtrar</button>
                    <button className="Postar" onClick={() => setModalAberto(true)}>Postar</button>
                    <Modal 
                        isOpen={modalAberto} 
                        onClose={() => setModalAberto(false)} 
                        aoPostar={solicitarPost} //aqui era aoPostar
                    />
                </div>
                <div className="Topicos">
                    
                    <div className="mural-posts">
                        {posts.length > 0 ? (
                            posts.map((post) => {
                                
                                const euCurti = post.quemDeuLike?.includes(usuario?.uid);

                                return (
                                    <PostSquad 
                                        key={post.id}
                                        id={post.id} 
                                        idAutor={post.idAutor}
                                        titulo={post.titulo} 
                                        texto={post.texto} 
                                        comentarios={post.comentários} 
                                        autor={post.nomeAutor} 
                                        fotoAutor={post.fotoAutor}
                                        likes={post.quemDeuLike?.length || 0}
                                        jaDeuLike={euCurti}
                                        aoDarLike={() => gerenciarLike(post.id, euCurti)}
                                    />
                                );
                            })
                        ) : (
                            <p>Nenhum post ainda. Seja o primeiro!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerfilSquad;