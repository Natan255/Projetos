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
    
    // --- ESTADOS DE RANKING E LISTAGEM DE ABAS ---
    const [ranksDisponiveis, setRanksDisponiveis] = useState<any[]>([]); 
    const [rankAtivoId, setRankAtivoId] = useState<string>("principal"); 
    const [rankingExibido, setRankingExibido] = useState<any[]>([]);
    const [metricaAtual, setMetricaAtual] = useState<string>("Pts");

    // Estado para guardar as fotos em tempo real do Top 3
    const [fotosPodio, setFotosPodio] = useState<Record<string, string>>({});
    const [solicitacaoPend, setSolicitacaoPend] = useState(false);
    const [squadSelecionado, setSquadSelecionado] = useState<any>(null);

    const isOwner = squadSelecionado?.idCriador === usuario?.uid;
    const isMod = squadSelecionado?.moderadores?.includes(usuario?.uid);
    const temPermissaoEspecial = isOwner || isMod;
    const jaSegue = squadSelecionado?.membros?.includes(usuario?.uid);  


    const navegarRanking = (direcao) => {
        const listaCompleta = ["principal", ...ranksDisponiveis.map(r => r.id)];
        const indiceAtual = listaCompleta.indexOf(rankAtivoId);

        if (direcao === "avancar") {
            const proximoIndice = (indiceAtual + 1) % listaCompleta.length;
            setRankAtivoId(listaCompleta[proximoIndice])
            ;
        } else if (direcao === "voltar") {

            const indiceAnterior = (indiceAtual - 1 + listaCompleta.length) % listaCompleta.length;
            setRankAtivoId(listaCompleta[indiceAnterior]);
        }
    };
    const buscaUsuSeguindo = async () => {
        if (!squadSelecionado?.membros || squadSelecionado.membros.length === 0) return;
        try {
            const usuariosRef = collection(db, "usuarios");
            const membrosLimitados = squadSelecionado.membros.slice(0, 30);
            const q = query(usuariosRef, where(documentId(), "in", membrosLimitados));
            const querySnapshot = await getDocs(q);
            const listaSegui = querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    id: doc.id,
                    nome: dados.nome,
                    foto: dados.fotoUrl || "https://via.placeholder.com/150"
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

            if (dadosDoPost.imagem) {
                const nomeArquivo = `${Date.now()}_${dadosDoPost.imagem.name}`;
                const storageRef = ref(storage, `posts/${id}/${nomeArquivo}`);
                const uploadTask = await uploadBytesResumable(storageRef, dadosDoPost.imagem);
                urlImagem = await getDownloadURL(uploadTask.ref);
            }

            const precisaDeAprovacao = squadAtual.solicitarPost !== "nao"; 
            const usuarioRef = doc(db, "usuarios", usuario.uid);
            const usuarioSnap = await getDoc(usuarioRef);
            const usuarioDados = usuarioSnap.data();

            if (precisaDeAprovacao) {
                // --- FLUXO COM MODERAÇÃO ---
                await addDoc(collection(db, "squads", id, "solicitacoes_posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    imagemPost: urlImagem,
                    idAutor: usuario.uid,
                    nomeAutor: usuario.displayName || "Membro",
                    fotoAutor: usuario.photoURL || "",
                    criadoEm: serverTimestamp(),
                    status: "pendente" 
                });
                exibirAlerta("Sucesso", "Sua publicação foi enviada para análise dos moderadores!");
            } else {
                // --- FLUXO DIRETO (SEM ADM) ---
                
                // 1. Cria o post imediatamente no feed global
                await addDoc(collection(db, "posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    imagemPost: urlImagem,
                    idSquad: id,
                    idAutor: usuario.uid,
                    nomeAutor: usuarioDados?.nome || "Membro", 
                    fotoAutor: usuarioDados?.fotoUrl || usuarioDados?.foto || "",
                    likes: 0, 
                    quemDeuLike: [],
                    comentarios: 0, 
                    compartilhamento: 0,
                    criadoEm: serverTimestamp(),
                });

                // 2. Calcula os pontos conquistados com base nas propriedades do post
                let pontosAGanhar = 20; // Pontuação base por postar
                if (dadosDoPost.texto && dadosDoPost.texto.length > 300) pontosAGanhar += 30;
                if (urlImagem !== "") pontosAGanhar += 10; // Se subiu imagem, soma bônus

                // 3. Atualiza o Ranking Principal (Se o squad for "Colecao" e estiver competitivo)
                if (squadAtual.estilo === "Colecao" && squadAtual.disputarRanking === true) {
                    const rankingPrincipalRef = doc(db, "squads", id, "ranking", usuario.uid);
                    await updateDoc(rankingPrincipalRef, {
                        pontos: increment(pontosAGanhar),
                        ultimaAtividade: serverTimestamp()
                    });
                }

                // 4. Atualiza os Ranks Extras Cadastrados dinamicamente
                const ranksExtraSnapshot = await getDocs(collection(db, "squads", id, "ranks_extra"));
                
                const promessasRanksExtras = ranksExtraSnapshot.docs.map(async (rankDoc) => {
                    const rankExtraMembroRef = doc(db, "squads", id, "ranks_extra", rankDoc.id, "ranking", usuario.uid);
                    
                    return updateDoc(rankExtraMembroRef, {
                        pontos: increment(pontosAGanhar),
                        ultimaAtividade: serverTimestamp()
                    }).catch(async (err) => {
                        // Se o documento do usuário não existir neste rank extra específico, criamos ele agora
                        if (err.code === "not-found") {
                            await setDoc(rankExtraMembroRef, {
                                uid: usuario.uid,
                                nome: usuarioDados?.nome || "Membro",
                                fotoUrl: usuarioDados?.fotoUrl || usuarioDados?.foto || "",
                                pontos: pontosAGanhar,
                                ultimaAtividade: serverTimestamp()
                            });
                        }
                    });
                });

                // Executa a atualização de todos os sub-rankings em paralelo para não travar a UI
                await Promise.all(promessasRanksExtras);

                exibirAlerta("Sucesso", "Sua publicação foi postada e seus pontos foram computados!");
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
            } else {
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
            console.error("Erro na operation de seguir/sair:", error);
        }
    };

    // Realtime Listeners - Posts
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

    // Realtime Listeners - Dados do Squad
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
        const subColecaoRanksRef = collection(db, "squads", id, "ranks_extra");
        
        const unsubscribeRanks = onSnapshot(subColecaoRanksRef, (snapshot) => {
            const extraRanks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRanksDisponiveis(extraRanks);
        });

        return () => unsubscribeRanks();
    }, [id]);

    // --- ESCUTA DINÂMICA DO RANKING SELECIONADO (PRINCIPAL OU EXTRA) ---
    useEffect(() => {
        if (!id) return;

        let rankingRef;
        let metricaLabel = "Pts";

        if (rankAtivoId === "principal") {
            rankingRef = collection(db, "squads", id, "ranking");
            metricaLabel = squadSelecionado?.metrica || "Pts";
        } else {
            rankingRef = collection(db, "squads", id, "ranks_extra", rankAtivoId, "ranking");
            const dadosRankExtra = ranksDisponiveis.find(r => r.id === rankAtivoId);
            metricaLabel = dadosRankExtra?.metrica || "Pts";
        }

        setMetricaAtual(metricaLabel);

        const qRanking = query(rankingRef, orderBy("pontos", "desc"));
        const unsubscribeRanking = onSnapshot(qRanking, (querySnapshot) => {
            const listaRanking = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setRankingExibido(listaRanking);
        });

        return () => unsubscribeRanking();
    }, [id, rankAtivoId, squadSelecionado, ranksDisponiveis]);

    useEffect(() => {
        if (rankingExibido.length === 0) return;

        const buscarFotosTop3 = async () => {
            const top3 = rankingExibido.slice(0, 3);
            const novasFotos: Record<string, string> = {};

            try {
                await Promise.all(
                    top3.map(async (membro) => {
                        if (!membro.uid) return;
                        
                        const userRef = doc(db, "usuarios", membro.uid);
                        const userSnap = await getDoc(userRef);
                        
                        if (userSnap.exists()) {
                            const dadosUser = userSnap.data();
                            novasFotos[membro.uid] = dadosUser.foto || dadosUser.fotoUrl || "https://via.placeholder.com/150";
                        } else {
                            novasFotos[membro.uid] = "https://via.placeholder.com/150";
                        }
                    })
                );
                setFotosPodio(novasFotos);
            } catch (error) {
                console.error("Erro ao buscar fotos em tempo real do top 3:", error);
            }
        };

        buscarFotosTop3();
    }, [rankingExibido]);

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

            <div className="seletor-ranking-carrossel">
                <button 
                    className="seta-rank-btn" 
                    onClick={() => navegarRanking("voltar")}
                    aria-label="Ranking anterior"
                >
                    ◀
                </button>

                <div className="info-rank-atual">
                    {rankAtivoId === "principal" ? (
                        <>
                            <div className="texto-rank">
                                <strong className="nome-rank">Geral</strong>
                                <span className="metrica-rank">{squadSelecionado.metrica || "Pts"}</span>
                            </div>
                        </>
                    ) : (
                        (() => {
                            const atual = ranksDisponiveis.find(r => r.id === rankAtivoId);
                            return (
                                <>
                                    <div className="texto-rank">
                                        <strong className="nome-rank">{atual?.subCategoria || atual?.nomeRank || "Rank Extra"}</strong>
                                        <span className="metrica-rank">{atual?.metrica}</span>
                                    </div>
                                </>
                            );
                        })()
                    )}
                </div>

                <button 
                    className="seta-rank-btn" 
                    onClick={() => navegarRanking("avancar")}
                    aria-label="Próximo ranking"
                >
                    ▶
                </button>
            </div>

            {/* --- SEÇÃO DO RANKING --- */}
            <div className="Rank_secao">
                {rankingExibido.length > 0 ? (
                    <div className="Rank_container">
                        <div className="Podio_container">
                            {rankingExibido.slice(0, 3).map((membro, index) => {
                                const classes = ["primeiro", "segundo", "terceiro"];
                                const ordemVisual = index === 0 ? 2 : index === 1 ? 1 : 3;

                                const fotoAtualizada = fotosPodio[membro.uid] || membro.fotoUrl || "https://via.placeholder.com/150";

                                return (
                                    <div 
                                        key={membro.id || index} 
                                        className={`card-podio ${classes[index]}`} 
                                        style={{ order: ordemVisual }} 
                                        onClick={() => navigate(`/paginas/Perfil/${membro.uid}`)}
                                    >
                                        <div className="medalha">
                                            <img 
                                                src={fotoAtualizada} 
                                                alt={`Foto do ${index + 1}º colocado`} 
                                                className="foto-campeao-podio"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://via.placeholder.com/150";
                                                }}
                                            />
                                        </div>
                                        <span className="nome">{membro.nome}</span>
                                        <span className="producao">
                                            {membro.pontos} {metricaAtual}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="Rank_lista">
                            {rankingExibido.slice(3).map((membro, index) => (
                                <div key={membro.id || index} className="membro-rank" onClick={() => navigate(`/paginas/Perfil/${membro.uid}`)}>
                                    <span className="posicao">{index + 4}º</span>
                                    <span className="nome">{membro.nome}</span>
                                    <span className="producao">
                                        {membro.pontos} {metricaAtual}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p style={{ textAlign: "center", padding: "20px" }}>Nenhum dado de ranking disponível para esta categoria.</p>
                )}
            </div>

            <div className="Topicos_squad">
                <div className="Topicos_header_acoes">

                    {squadSelecionado.estilo !== "Colecao" && (
                        <button 
                            className="prova" 
                            onClick={() => {
                                if (rankAtivoId === "principal") {
                                    navigate(`/paginas/Prova/${id}`);
                                } else {
                                    navigate(`/paginas/Prova/${id}?rankExtra=${rankAtivoId}`);
                                }
                            }}
                        >
                            {rankAtivoId === "principal" ? "Provar Geral" : `Provar ${metricaAtual}`}
                        </button>
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
                                                                    tipo={post.tipo}
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