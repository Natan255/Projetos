import "./Perfil.css";
import PostSquad from "../componentes/PostSquad";
import type { User } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, getDoc, collection, query, where, orderBy, addDoc, documentId, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDocs } from "firebase/firestore";
import PostVotacaoSquad from "../componentes/VotoSquad";
import CardItem from "../componentes/CardItem";
import ModalListagem from "../componentes/ModalListagem";
import ModalListagemComp from "../componentes/ModalListagemComp";
import Modal from "../componentes/Modal";
import { useAlerta } from "../componentes/AlertaProvider";

interface PerfilProps {
    usuario: User | null;
    squads: any[];
}

type AbaPerfil = "postagens" | "votacoes" | "colecao";

function Perfil({ usuario, squads }: PerfilProps) {
    const navigate = useNavigate();
    const { idUsuario } = useParams();
    const { exibirAlerta } = useAlerta();
    const [tipoAtivo, setTipoAtivo] = useState<"usuario" | "squad">("usuario");
    const [info, setInfo] = useState<any[]>([]);
    const [dadosExtras, setDadosExtras] = useState<any>(null);
    const [meusPosts, setMeusPosts] = useState<any[]>([]);
    const [itensDaColecao, setItensDaColecao] = useState<any[]>([]); 
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("postagens");
    const [exibirMap, setExibirMap] = useState(false);
    const [exibirMapComp, setExibirMapComp] = useState(false);
    const [titulos, setTitulos] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [squadComp, setSquadComp] = useState<any>(null);
    const idParaBuscar = idUsuario || usuario?.uid;
    const eMeuPerfil = idParaBuscar === usuario?.uid;

    // Tem qeu depois fazer com que quando compartilhado o item da colecao seja levado os dados dele + oq o cara quis acrescentar de texto, ou fazer um
    // novo componente pra essas situacoes




    useEffect(() => {
        if (!idParaBuscar) return;

        const postsRef = collection(db, "posts");
        const q = query(
            postsRef, 
            where("idAutor", "==", idParaBuscar),
            orderBy("criadoEm", "desc")
        );
        
        const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMeusPosts(postsData);
        }, (error) => {
            console.error("Erro ao escutar posts em tempo real: ", error);
        });

        return () => unsubscribePosts();
    }, [idParaBuscar]);

    useEffect(() => {
        if (!idParaBuscar) return;

        const unsubscribeUser = onSnapshot(doc(db, "usuarios", idParaBuscar), (docSnap) => {
            if (docSnap.exists()) {
                setDadosExtras({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.warn("Este perfil não possui documento de dados extras no Firestore.");
                setDadosExtras(null);
            }
        });

        return () => unsubscribeUser();
    }, [idParaBuscar]);

    useEffect(() => {
        if (!dadosExtras?.colecao || dadosExtras.colecao.length === 0) {
            setItensDaColecao([]);
            return;
        }

        const itensRef = collection(db, "colecaoItens");
        const q = query(itensRef, where(documentId(), "in", dadosExtras.colecao));

        const unsubscribeItens = onSnapshot(q, (querySnapshot) => {
            const itensData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItensDaColecao(itensData);
        }, (error) => {
            console.error("Erro ao buscar itens da coleção: ", error);
        });

        return () => unsubscribeItens();
    }, [idParaBuscar, dadosExtras?.colecao?.length]);

    if (!usuario || !idParaBuscar) {
        return <h2 style={{ color: "white", padding: "100px", textAlign: "center" }}>Conectando ao Klymb...</h2>;
    }
    
    const solicitarPost = async (dadosDoPost) => {
        if (!usuario || !squadComp) return;

        try {
            const squadAtual = squads.find(s => s.id === squadComp);

            if (!squadAtual) {
                exibirAlerta("Erro", "Squad não encontrado.");
                return;
            }
            
            const membro = squadAtual.membros?.includes(usuario.uid);

            if (!membro) {
                exibirAlerta("Erro", "Você precisa ser membro do squad para enviar uma prova.");
                return;
            }

            const squadRef = doc(db, "squads", squadComp);
            const squadSnap = await getDoc(squadRef);

            const squadDados = squadSnap.data();
            let precisaDeAprovacao = false;
            if (squadDados?.solicitarPost === "sim") {
                precisaDeAprovacao = true;
            }

            if (precisaDeAprovacao) {
                await addDoc(collection(db, "squads", squadComp, "solicitacoes_posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    idAutor: usuario.uid,
                    nomeAutor: dadosExtras.nome || "Membro",
                    fotoAutor: dadosExtras.ftoURL || "",
                    criadoEm: serverTimestamp(),
                    status: "pendente" 
                });
                exibirAlerta("Sucesso", "Sua publicação foi enviada para análise dos moderadores!");
            }else{
                await addDoc(collection(db, "posts"), {
                    titulo: dadosDoPost.titulo,
                    texto: dadosDoPost.texto,
                    idSquad: squadComp,
                    idAutor: usuario.uid,
                    nomeAutor: dadosExtras.nome || "Membro", 
                    fotoAutor: dadosExtras.fotoUrl || "",
                    likes: [],
                    comentarios: 0, 
                    compartilhamento: 0,
                    criadoEm: serverTimestamp(),
                });
                exibirAlerta("Sucesso", "Sua publicação foi postada!");
            }

            setModalAberto(false);
        } catch (error) {
            console.error("Erro ao solicitar post:", error);
        }
    };

    const buscarSeguidores = async () => {
        if (!dadosExtras?.seguidores || dadosExtras.seguidores.length === 0) return;
        try {
            const usuariosRef = collection(db, "usuarios");
            const q = query(usuariosRef, where(documentId(), "in", dadosExtras.seguidores));
            const querySnapshot = await getDocs(q);
            const listaSegui = querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    id: doc.id,
                    nome: dados.nome,
                    foto: dados.fotoUrl || "https://via.placeholder.com/150"
                };
            });
            setTitulos("Seguidores");
            setInfo(listaSegui);
            setTipoAtivo("usuario");
        } catch (error) {
            console.error("Erro ao buscar seguidores:", error);
        }     
    }

    const buscaSquad = async () => {
        if (!dadosExtras?.squads_seguindo || dadosExtras.squads_seguindo.length === 0) return;
        try {
            const squadsRef = collection(db, "squads");
            const q = query(squadsRef, where(documentId(), "in", dadosExtras.squads_seguindo));
            const querySnapshot = await getDocs(q);
            const listaSegui = querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    id: doc.id,
                    nome: dados.nome,
                    foto: dados.fotoPerfil || "https://via.placeholder.com/150"
                };
            });
            setTitulos("Squads");
            setInfo(listaSegui);
            setTipoAtivo("squad");
        } catch (error) {
            console.error("Erro ao buscar squads seguindo:", error);
        }
    }

    const buscaUsuSeguindo = async () => {
        if (!dadosExtras?.usuario_seguindo || dadosExtras.usuario_seguindo.length === 0) return;
        try {
            const usuariosRef = collection(db, "usuarios");
            const q = query(usuariosRef, where(documentId(), "in", dadosExtras.usuario_seguindo));
            const querySnapshot = await getDocs(q);
            const listaSegui = querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return {
                    id: doc.id,
                    nome: dados.nome,
                    foto: dados.fotoUrl || "https://via.placeholder.com/150"
                };
            });
            setTitulos("Seguindo");
            setInfo(listaSegui);
            setTipoAtivo("usuario");
        } catch (error) {
            console.error("Erro ao buscar usuários seguindo:", error);
        }
    }

    const handleSair = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const handleDeletarItem = async (idItem: string) => {
        if (!usuario) return;
        const confirmar = window.confirm("Tem certeza que deseja apagar este item da sua coleção?");
        if (!confirmar) return;

        try {
            const userRef = doc(db, "usuarios", usuario.uid);
            const coleRef = doc(db, "colecaoItens", idItem);            
            await updateDoc(coleRef, {
                colecao: arrayRemove(idItem)
            });
            await updateDoc(userRef, {
                colecao: arrayRemove(idItem)
            });

            if (dadosExtras?.itemFixadoId === idItem) {
                await updateDoc(coleRef, { itemFixados: arrayRemove(idItem) });
            }

            await deleteDoc(doc(db, "colecaoItens", idItem));
        } catch (error) {
            console.error("Erro ao deletar item:", error);
        }
    };

    const handleFixarItem = async (idItem: string) => {
        if (!usuario) return;

        try {
            const itemAtual = itensDaColecao.find(item => item.id === idItem);
            if (!itemAtual) return;
            const novoStatusFixado = !itemAtual.fixado;
            const coleRef = doc(db, "colecaoItens", idItem);

            await updateDoc(coleRef, { 
                fixado: novoStatusFixado
            });
        } catch (error) {
            console.error("Erro ao atualizar item fixado:", error);
        }
    };

    const deixarSeguir = async () => {
        if (!usuario) return;
        try {
            const userRef = doc(db, "usuarios", usuario.uid);
            const perfilRef = doc(db, "usuarios", idParaBuscar);
            await updateDoc(userRef, {
                usuario_seguindo: arrayRemove(idParaBuscar)
            });
            await updateDoc(perfilRef, {
                seguidores: arrayRemove(usuario.uid)
            });
        } catch (error) {
            console.error("Erro ao seguir usuário:", error);
        }
    }

    const seguir = async () => {
        if (!usuario) return;
        try {
            const userRef = doc(db, "usuarios", usuario.uid);
            const perfilRef = doc(db, "usuarios", idParaBuscar);
            await updateDoc(userRef, {
                usuario_seguindo: arrayUnion(idParaBuscar)
            });
            await updateDoc(perfilRef, {
                seguidores: arrayUnion(usuario.uid)
            });
        } catch (error) {
            console.error("Erro ao seguir usuário:", error);
        }
    }

    const postsNormaisEConquistas = meusPosts ? meusPosts.filter(p => p.tipo !== "conquistaVoto") : [];
    const postsDeVotacao = meusPosts ? meusPosts.filter(p => p.tipo === "conquistaVoto") : [];
    const imagemPerfil = dadosExtras?.fotoUrl || usuario?.photoURL || "https://via.placeholder.com/150";


    const euSigoEles = dadosExtras?.seguidores?.includes(usuario.uid);
    const elesMeSeguem = dadosExtras?.usuario_seguindo?.includes(usuario.uid);
    const seguimentoMutuo = euSigoEles && elesMeSeguem;
    const perfilEstaPrivado = !eMeuPerfil && dadosExtras?.privado === "sim" && !seguimentoMutuo;

    return (
        <div className="perfil-container-user">
            <div className="perfil">
                <div className="perfil-header-user">
                    <div className="perfil-coluna-esquerda">
                        <div className="perfil-foto">
                            <img
                                src={imagemPerfil}
                                alt="foto-user"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        <div className="perfil-stats-group" >
                            <div className="perfil-squad-quant" onClick={() => {setExibirMap(true); buscaSquad()}}>
                                <p>{dadosExtras?.squads_seguindo?.length || 0}</p>
                                <span>Squads</span>
                            </div>
                            <div className="perfil-squad-quant" onClick={() => {setExibirMap(true); buscaUsuSeguindo()}}>
                                <p>{dadosExtras?.usuario_seguindo?.length || 0}</p>
                                <span>Seguindo</span>
                            </div>
                            <div className="perfil-squad-quant" onClick={() => {setExibirMap(true); buscarSeguidores()}}>
                                <p>{dadosExtras?.seguidores?.length || 0}</p>
                                <span>Seguidores</span>
                            </div>
                        </div>
                    </div>

                    {perfilEstaPrivado ? (
                        <div className="perfil-privado-mensagem">
                            <div className="perfil-bio">
                                <h1 className="perfil-nome-user">{dadosExtras?.nome || "Usuário"}</h1>
                            </div>
                            <div className="perfil-acoes-group">
                                {dadosExtras?.seguidores?.includes(usuario.uid) ? (
                                    <button className="perfil-seguir" onClick={deixarSeguir}>
                                        Deixar de Seguir
                                    </button>
                                ) : (
                                    <button className="perfil-seguir" onClick={seguir}>
                                        Seguir
                                    </button>
                                )}
                            </div>
                            <div className="aviso-privado-box">
                                <h3>Este perfil é privado</h3>
                                <p>Siga este usuário para acompanhar as suas postagens, votações e coleções.</p>
                            </div>
                        </div>
                    ) : (
                        <>
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

                            {exibirMapComp && (
                                <ModalListagemComp 
                                    isOpen={exibirMapComp}
                                    onClose={() => setExibirMapComp(false)}
                                    titulo={titulos}
                                    itens={info}
                                    onItemClick={(idClicado) => { setModalAberto(true); setSquadComp(idClicado);}}
                                />
                            )}

                            <Modal 
                                isOpen={modalAberto} 
                                onClose={() => setModalAberto(false)} 
                                aoPostar={solicitarPost} 
                            />

                            <div className="perfil-bio">
                                <h1 className="perfil-nome-user">{dadosExtras?.nome || usuario.displayName || "Usuário"}</h1>
                                <h3 className="perfil-bio-text">{dadosExtras?.bio || "Recruta do Klymb"}</h3>
                            </div>

                            <div className="perfil-acoes-group">
                                {!eMeuPerfil ? (
                                    <>
                                        {dadosExtras?.seguidores?.includes(usuario.uid) ? (
                                            <button className="perfil-seguir" onClick={deixarSeguir}>
                                                Deixar de Seguir
                                            </button>
                                        ) : (
                                            <button className="perfil-seguir" onClick={seguir}>
                                                Seguir
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button className="perfil-btn-config" onClick={() => navigate("/paginas/PerfilConfig")}>⚙️</button>
                                        <button className="perfil-sair" onClick={handleSair}>Sair</button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* SÓ MOSTRA AS ABAS SE O PERFIL NÃO ESTIVER PRIVADO */}
                {!perfilEstaPrivado && (
                    <>
                        <div className="perfil-abas-menu">
                            <button 
                                className={`perfil-aba-item ${abaAtiva === "postagens" ? "ativa" : ""}`}
                                onClick={() => setAbaAtiva("postagens")}
                            >
                                Postagens
                            </button>
                            <button 
                                className={`perfil-aba-item ${abaAtiva === "votacoes" ? "ativa" : ""}`}
                                onClick={() => setAbaAtiva("votacoes")}
                            >
                                Votações
                            </button>
                            <button 
                                className={`perfil-aba-item ${abaAtiva === "colecao" ? "ativa" : ""}`}
                                onClick={() => setAbaAtiva("colecao")}
                            >
                                Coleção
                            </button>
                        </div>

                        <div className="Topicos">
                            <div className="mural-posts">
                                {abaAtiva === "postagens" && (
                                    postsNormaisEConquistas.length > 0 ? (
                                        postsNormaisEConquistas.map((post) => (
                                            <PostSquad
                                                key={post.id}
                                                id={post.id}
                                                idAutor={post.idAutor || post.idUsuario}
                                                titulo={post.titulo}
                                                texto={post.texto}
                                                likes={post.likes || 0}
                                                comentarios={post.comentarios || 0}
                                                autor={post.nomeAutor || "Membro"}
                                                imagemPost={post.imagemPost}
                                                fotoAutor={post.fotoAutor}
                                                conquista={post.tipo?.includes("conquista")}
                                                squadId={post.idSquad}
                                                usuarioId={usuario?.uid}
                                                quemDeuLike={post.quemDeuLike || []}
                                            />
                                        ))
                                    ) : (
                                        <p className="sem-posts">Nenhuma postagem publicada ainda.</p>
                                    )
                                )}

                                {abaAtiva === "votacoes" && (
                                    postsDeVotacao.length > 0 ? (
                                        postsDeVotacao.map((post) => (
                                            <PostVotacaoSquad 
                                                key={post.id}
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
                                                likes={post.likes}
                                                comentarios={post.comentarios}
                                                encerraEm={post.encerraEm}
                                                rankingComputado={post.rankingComputado || false}
                                            />
                                        ))
                                    ) : (
                                        <p className="sem-posts">Nenhuma votação iniciada por este perfil.</p>
                                    )
                                )}

                                {abaAtiva === "colecao" && (
                                    <div className="colecao-wrapper">
                                        {eMeuPerfil && dadosExtras && (
                                            <button 
                                                className="add-item-trigger-btn"
                                                onClick={() => navigate("/paginas/AdicionarItem")}
                                            >
                                                + Adicionar
                                            </button>
                                        )}

                                        {itensDaColecao.length > 0 ? (
                                            <div className="perfil-grid-colecao">
                                                {[...itensDaColecao]
                                                    .sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0))
                                                    .map((item) => (
                                                        <CardItem 
                                                            key={item.id}
                                                            id={item.id}
                                                            nome={item.nome}
                                                            fotoBanner={item.fotoBanner}
                                                            info={item.info}
                                                            eMeuPerfil={eMeuPerfil}
                                                            fixado={!!item.fixado}
                                                            onDeletar={handleDeletarItem}
                                                            onFixar={handleFixarItem}
                                                            onCompartilhar={buscaSquad}
                                                            abrirMap={setExibirMapComp}
                                                        />
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="sem-posts">Nenhum item adicionado à coleção ainda.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Perfil;