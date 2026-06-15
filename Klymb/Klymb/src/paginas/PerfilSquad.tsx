import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./PerfilSquad.css";
import PostSquad from "../componentes/PostSquad";
import Modal from "../componentes/Modal";
import { 
    getDoc, doc, setDoc, updateDoc, deleteDoc,
    addDoc, collection, query, where, orderBy, getDocs, 
    documentId, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, increment, writeBatch
} from "firebase/firestore";
// Adicione essa importação no topo do seu PerfilSquad.js junto com as outras
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import PostVotacaoSquad from "../componentes/VotoSquad";
import ModalListagem from "../componentes/ModalListagem";
import { useAlerta } from "../componentes/AlertaProvider";

function PerfilSquad({ squads, usuario }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { exibirAlerta } = useAlerta();
    
    const [tipoAtivo, setTipoAtivo] = useState<"usuario" | "squad">("usuario");
    const [info, setInfo] = useState<any[]>([]);
    const [exibirMap, setExibirMap] = useState(false);
    const [titulos, setTitulos] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [solicitacaoPend, setSolicitacaoPend] = useState(false);
    const [squadSelecionado, setSquadSelecionado] = useState<any>(null);

    const isOwner = squadSelecionado?.idCriador === usuario?.uid;
    const isMod = squadSelecionado?.moderadores?.includes(usuario?.uid);
    const temPermissaoEspecial = isOwner || isMod;
    const jaSegue = squadSelecionado?.membros?.includes(usuario?.uid);  

    // Busca os usuários membros para o ModalListagem
    const buscaUsuSeguindo = async () => {
        if (!squadSelecionado?.membros || squadSelecionado.membros.length === 0) return;
        try {
            const usuariosRef = collection(db, "usuarios");
            // Nota: O limite do 'in' no Firestore é de 30 IDs.
            const membrosLimitados = squadSelecionado.membros.slice(0, 30);
            const q = query(usuariosRef, where(documentId(), "in", membrosLimitados));
            const querySnapshot = await getDocs(q);
            const listaSegui = querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    id: doc.id,
                    nome: dados.nome,
                    foto: dados.foto || "https://via.placeholder.com/150"
                };
            });
            setTitulos("Membros do Squad");
            setInfo(listaSegui);
            setTipoAtivo("usuario");
        } catch (error) {
            console.error("Erro ao buscar membros:", error);
        }
    };

    // Fluxo 1: Envia post para aprovação (Pendente) ou direto para o Feed com suporte a imagem
    const solicitarPost = async (dadosDoPost) => {
        if (!usuario || !id) return;

        try {
            const squadAtual = squads.find(s => s.id === id) || squadSelecionado;

            if (!squadAtual) {
                exibirAlerta("Erro", "Squad não encontrado.");
                return;
            }
            
            const membro = squadAtual.membros?.includes(usuario.uid);

            if (!membro) {
                exibirAlerta("Erro", "Você precisa ser membro do squad para enviar uma prova.");
                return;
            }

            let urlImagem = "";

            // Se houver uma imagem anexada, fazemos o upload dela primeiro
            if (dadosDoPost.imagem) {
                // Cria um nome único usando timestamp e o nome do arquivo original
                const nomeArquivo = `${Date.now()}_${dadosDoPost.imagem.name}`;
                const storageRef = ref(storage, `posts/${id}/${nomeArquivo}`);
                
                // Faz o upload do arquivo
                const uploadTask = await uploadBytesResumable(storageRef, dadosDoPost.imagem);
                // Obtém a URL pública do arquivo recém upado
                urlImagem = await getDownloadURL(uploadTask.ref);
            }

            const precisaDeAprovacao = squadAtual.solicitarPost !== "nao"; 
            const usuarioRef = doc(db, "usuarios", usuario.uid);
            const usuarioSnap = await getDoc(usuarioRef);
            const usuarioDados = usuarioSnap.data();

            if (precisaDeAprovacao) {
                await addDoc(collection(db, "squads", id, "solicitacoes_posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    imagemPost: urlImagem, // Salva a URL da imagem (vazia se não tiver)
                    idAutor: usuario.uid,
                    nomeAutor: usuario.displayName || "Membro",
                    fotoAutor: usuario.photoURL || "",
                    criadoEm: serverTimestamp(),
                    status: "pendente" 
                });
                exibirAlerta("Sucesso", "Sua publicação foi enviada para análise dos moderadores!");
            } else {
                await addDoc(collection(db, "posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    imagemPost: urlImagem, // Salva a URL da imagem (vazia se não tiver)
                    idSquad: id,
                    idAutor: usuario.uid,
                    nomeAutor: usuarioDados?.nome || "Membro", 
                    fotoAutor: usuarioDados?.fotoUrl || usuarioDados?.foto || "",
                    likes: 0, // Dica: seu gerenciarLike usa increment, recomendo iniciar o campo com número 0 e não array vazio []
                    quemDeuLike: [],
                    comentarios: 0, 
                    compartilhamento: 0,
                    criadoEm: serverTimestamp(),
                });
                exibirAlerta("Sucesso", "Sua publicação foi postada!");
            }

            setModalAberto(false);
        } catch (error) {
            console.error("Erro ao solicitar post:", error);
            exibirAlerta("Erro", "Ocorreu um erro ao enviar sua publicação.");
        }
    };


    const gerenciarLike = async (postId: string, euCurti: boolean) => {
        if (!usuario) return exibirAlerta("Erro", "Você precisa estar logado para curtir.");
        
        const postRef = doc(db, "posts", postId);
        try {
            if (euCurti) {
                await updateDoc(postRef, {
                    likes: increment(-1),
                    quemDeuLike: arrayRemove(usuario.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: increment(1),
                    quemDeuLike: arrayUnion(usuario.uid)
                });
            }
        } catch (error) {
            console.error("Erro ao processar curtida:", error);
        }
    };

    const solicitarEntrada = async () => {
        if (!usuario || !id) return;
        try {
            const docRef = doc(db, "squads", id, "solicitacao_entrada", usuario.uid);
            if (squadSelecionado.solicitarEntrada == "sim"){
                await setDoc(docRef, {
                    uid: usuario.uid,
                    nome: usuario.displayName || "Membro",
                    foto: usuario.photoURL || "",
                    dataSolicitacao: serverTimestamp()
                });
            }else{
                const usuarioId = usuario.uid || usuario.id;
                if (!usuarioId) {
                    alert("Erro: ID do usuário não encontrado.");
                    return;
                }
                
                const usuarioRef = doc(db, "usuarios", usuario.uid);
                const usuarioSnap = await getDoc(usuarioRef);
                const usuarioDados = usuarioSnap.data();
                const squadRef = doc(db, "squads", id);
                const rankingMemberRef = doc(db, "squads", id, "ranking", usuarioId);
                    
                const batch = writeBatch(db);
                batch.update(squadRef, {
                    membros: arrayUnion(usuarioId)
                });
                    
                batch.update(usuarioRef, {
                    squads_seguindo: arrayUnion(id)
                });
                    
                batch.set(rankingMemberRef, {
                    uid: usuarioId,
                    nome: usuarioDados?.nome || "Recruta Anônimo",
                    fotoUrl: usuarioDados?.foto || usuarioDados?.fotoUrl || "",
                    pontos: 0,
                    cargo: "Recruta",
                    ultimaAtividade: serverTimestamp()
                });
                await batch.commit();
                            
            }
            setSolicitacaoPend(true);
        } catch (error) {
            console.error("Erro ao solicitar entrada:", error);
        }
    };

    const gerenciarSeguir = async () => {
        if (!usuario || !id || !squadSelecionado) return;

        const userRef = doc(db, "usuarios", usuario.uid);
        const squadRef = doc(db, "squads", id);
        const rankingMemberRef = doc(db, "squads", id, "ranking", usuario.uid);

        try {
            if (jaSegue) {
                await updateDoc(userRef, { squads_seguindo: arrayRemove(String(id)) });
                await updateDoc(squadRef, { membros: arrayRemove(usuario.uid) });
                await deleteDoc(rankingMemberRef); 
            } else {
                await updateDoc(userRef, { squads_seguindo: arrayUnion(String(id)) });
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
            console.error("Erro na operação de seguir/sair:", error);
        }
    };

    // Realtime Listeners
    useEffect(() => {
        if (!id) return;
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("idSquad", "==", id), orderBy("criadoEm", "desc"));

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
        const squadRef = doc(db, "squads", id);
        const unsubscribe = onSnapshot(squadRef, (docSnap) => {
            if (docSnap.exists()) {
                setSquadSelecionado({ id: docSnap.id, ...docSnap.data() });
            }
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
            if (!usuario || !id || jaSegue) {
                if (jaSegue) setSolicitacaoPend(false);
                return;
            }
            try {
                const docRef = doc(db, "squads", id, "solicitacao_entrada", usuario.uid);
                const docSnap = await getDoc(docRef);
                setSolicitacaoPend(docSnap.exists());
            } catch (error) {
                console.error("Erro ao verificar status de solicitação:", error);
            }
        };

        verificarStatus();
    }, [id, usuario, jaSegue]);

    if (!squadSelecionado) {
        return <div className="carregando">Carregando dados do Squad...</div>;
    }

    return (
        <div className="perfil-container">
            {/* --- HEADER DO PERFIL --- */}
            <div className="Fundo_perfil_squad">
                <img src={squadSelecionado.fotoCapa || "https://via.placeholder.com/1200x400"} className="capa-img" alt="Capa" />
                <div className="perfil-header">
                    <div className="Foto_perfil_squad">
                        <img src={squadSelecionado.fotoPerfil || "https://via.placeholder.com/150"} alt="Logo" />
                    </div>
                    <div className="Bios_squad">
                        <h1>
                            {squadSelecionado.nome} 
                            {isOwner && <span title="Você é o dono"> 👑</span>}
                            {isMod && !isOwner && <span title="Você é moderador"> 🛡️</span>}
                        </h1>
                        <p>{squadSelecionado.descricao}</p>

                        <div className="Membros_squad" onClick={() => { buscaUsuSeguindo(); setExibirMap(true); }}>
                            {squadSelecionado.membros?.length || 0} Membros
                        </div>
                    </div>
                    
                    {exibirMap && (
                        <ModalListagem 
                            isOpen={exibirMap}
                            onClose={() => setExibirMap(false)}
                            titulo={titulos}
                            itens={info} 
                            onItemClick={(idClicado) => {
                                if (tipoAtivo === "squad") {
                                    navigate(`/paginas/PerfilSquad/${idClicado}`);
                                } else {
                                    navigate(`/paginas/Perfil/${idClicado}`);
                                }
                            }}
                        />
                    )}

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
                                    <button className="btn-entrar" onClick={solicitarEntrada}>
                                        Entrar no Squad
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SEÇÃO DO RANKING --- */}
            <div className="Rank_secao">

                {ranking.length > 0 ? (
                    <div className="Rank_container">
                        <div className="Podio_container">
                            {ranking.slice(0, 3).map((membro, index) => {
                                const classes = ["primeiro", "segundo", "terceiro"];
                                const medalhas = ["🥇", "🥈", "🥉"];
                                const ordemVisual = index === 0 ? 2 : index === 1 ? 1 : 3;

                                return (
                                    <div key={membro.id || index} className={`card-podio ${classes[index]}`} style={{ order: ordemVisual }} onClick={() => navigate(`/paginas/Perfil/${membro.uid}`)}>
                                        <div className="medalha">{medalhas[index]}</div>
                                        <span className="nome">{membro.nome}</span>
                                        <span className="producao">
                                            {membro.pontos} {squadSelecionado.metrica || "Pts"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="Rank_lista">
                            {ranking.slice(3).map((membro, index) => (
                                <div key={membro.id || index} className="membro-rank" onClick={() => navigate(`/paginas/Perfil/${membro.id}`)}>
                                    <span className="posicao">{index + 4}º</span>
                                    <span className="nome">{membro.nome}</span>
                                    <span className="producao">
                                        {membro.pontos} {squadSelecionado.metrica || "Pts"}
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
                <div className="Topicos_header_acoes">
                    {squadSelecionado.estilo !== "Colecao" && (
                        <button className="prova" onClick={() => navigate(`/paginas/Prova/${id}`)}>Prova</button>
                    )}
                    <button className="Postar" onClick={() => setModalAberto(true)}>Postar</button>
                    <Modal 
                        isOpen={modalAberto} 
                        onClose={() => setModalAberto(false)} 
                        aoPostar={solicitarPost} 
                    />
                </div>
                
                <div className="squad-flex-container">
                    {(() => {
                        const postsFixados = posts.filter(p => p?.fixado === true);
                        const postsNormais = posts.filter(p => p?.fixado !== true);

                        return (
                            <>
                                <div className="Topicos">
                                    <div className="mural-posts">
                                        <div className="secao-posts-feed">
                                            {postsNormais.length > 0 ? (
                                                postsNormais.map((post) => {
                                                    const euCurti = post.quemDeuLike?.includes(usuario?.uid);
                                                    
                                                    return (
                                                        <div id={`post-${post.id}`} key={post.id}>
                                                            {post.tipo === "conquistaVoto" ? (
                                                                <PostVotacaoSquad 
                                                                    id={post.id}
                                                                    idAutor={post.idAutor}
                                                                    titulo={post.titulo}
                                                                    texto={post.texto}
                                                                    autor={post.nomeAutor}
                                                                    fotoAutor={post.fotoAutor}
                                                                    squadId={post.idSquad}
                                                                    votosPositivos={post.votosPositivos || []}
                                                                    votosNegativos={post.votosNegativos || []}
                                                                    statusVotacao={post.statusVotacao || "aberta"}
                                                                    usuario={usuario}
                                                                    likes={post.likes || 0}
                                                                    comentarios={post.comentarios || 0}
                                                                    jaDeuLike={euCurti}
                                                                    aoDarLike={() => gerenciarLike(post.id, euCurti)}
                                                                    encerraEm={post.encerraEm}
                                                                    rankingComputado={post.rankingComputado || false}
                                                                />
                                                            ) : (
                                                                <PostSquad 
                                                                    id={post.id} 
                                                                    idAutor={post.idAutor}
                                                                    titulo={post.titulo} 
                                                                    texto={post.texto} 
                                                                    comentarios={post.comentarios || 0} 
                                                                    autor={post.nomeAutor} 
                                                                    fotoAutor={post.fotoAutor}
                                                                    likes={post.likes || 0}
                                                                    imagemPost={post.imagemPost}
                                                                    conquista={post.tipo?.includes("conquista")}
                                                                    jaDeuLike={euCurti}
                                                                    aoDarLike={() => gerenciarLike(post.id, euCurti)}
                                                                    squadId={post.idSquad}
                                                                    usuarioId={usuario?.uid}
                                                                    quemDeuLike={post.quemDeuLike || []}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="sem-posts">Nenhuma atividade recente no feed.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="MuralLateral_Squad">
                                    <h3>Mural Squad</h3>
                                    <p>{squadSelecionado?.mural || "Nenhum aviso importante no mural por enquanto."}</p>

                                    {postsFixados.length > 0 && (
                                        <div className="secao-posts-fixados-lateral">
                                            <div className="titulo-secao-fixados">
                                                📌 Posts Fixados
                                            </div>
                                            <div className="lista-fixados-scroll">
                                                {postsFixados.map(post => (
                                                    <div 
                                                        key={post.id} 
                                                        className="mini-post-fixado"
                                                        onClick={() => navigate(`/post/${post.id}`)}
                                                        title="Clique para ir ao post"
                                                    >
                                                        <h4>{post.titulo}</h4>
                                                        <span className="mini-autor">Por: {post.nomeAutor}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

export default PerfilSquad;