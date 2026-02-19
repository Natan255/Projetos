import CardSquad from "../componentes/CardSquad"
import "./Home.css"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Importe os estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home({ squads, pesquisaQuery }) {

    const squadsPopulares = squads.slice(0, 5);
    const banners = [
        "https://picsum.photos/id/15/1200/400",
        "https://picsum.photos/id/20/1200/400",
        "https://picsum.photos/id/30/1200/400"
    ];

    return (
        <div className="home">
            {pesquisaQuery === "" ? (
                <>
                    <div className="Banner">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 3000 }} // Passa sozinho a cada 3 seg
                            loop={true}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {banners.map((img, index) => (
                                <SwiperSlide key={index}>
                                    <img src={img} alt={`Banner ${index}`} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="Descricao">
                        <h2>Sua produtividade tem um <span className="destaque">Ranking</span>.</h2>
                        <p>No Rank Over, se voce nao se esforçar seu concorrente vai! <strong>Qual o seu lugar no topo hoje?</strong></p>
                    </div>

                    {/* --- NOVA SEÇÃO: SQUADS POPULARES --- */}
                    <div className="secao_populares">
                        <h3 className="titulo_secao">Squads Populares</h3>
                        <div className="squad_grid">
                            {squadsPopulares.map((squad) => (
                                <CardSquad card={squad} key={squad.id} />
                            ))}
                        </div>
                    </div>

                    <div className="Descricao_2">
                        <div className="ilustracao_1">
                            <h1>Não encontrou seu Squad? Crie seu próprio e lidere a jornada!</h1>
                            <h3>Se junte a pessoas que estao tao motivadas quanto voce em seus objetivos</h3>
                        </div>

                        <div className="bota_criar_squad">
                            <button>Crie seu squad</button>
                        </div>

                    </div>

                    <div className="Descricao_3">
                        <div className="cabecalho_recursos">
                            <h1>Por que entrar em um Squad?</h1>
                            <p>A ciência prova: você produz mais quando está em um ambiente competitivo e colaborativo.</p>
                        </div>

                        <div className="grid_recursos">
                            <div className="recurso_item">
                                <div className="icon">🔥</div>
                                <h4>Constância</h4>
                                <p>Mantenha sua chama acesa vendo o progresso diário dos seus parceiros.</p>
                            </div>

                            <div className="recurso_item">
                                <div className="icon">🏆</div>
                                <h4>Ranking Vivo</h4>
                                <p>Suba posições conforme entrega suas tasks e ganhe destaque na comunidade.</p>
                            </div>

                            <div className="recurso_item">
                                <div className="icon">🤝</div>
                                <h4>Networking</h4>
                                <p>Conecte-se com pessoas que buscam o mesmo objetivo que você.</p>
                            </div>
                        </div>

                        <div className="bloco_destaque_final">
                            <div className="conteudo_destaque">
                                <span>Foco Coletivo</span>
                                <h2>Pronto para sair da inércia?</h2>
                                <p>
                                    No Rank Over, não somos apenas indivíduos estudando; somos uma engrenagem.
                                    Mais de <strong>10.000 horas</strong> foram focadas esta semana pela nossa comunidade.
                                    O próximo recorde pode ser o seu.
                                </p>
                                <button className="btn_bora">Bora pra cima</button>
                            </div>
                            <div className="ilustracao_destaque">
                                {/* Aqui você pode colocar um ícone grande ou um gráfico de barras subindo */}
                                <div className="barra_progresso_fake">
                                    <div className="progresso_preenchido"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rodape">
                        <div className="rodape_conteudo">
                            {/* Lado Esquerdo: Identidade */}
                            <div className="rodape_info">
                                <h2>RANK<span>OVER</span></h2>
                                <p>Domine sua rotina, suba no ranking e conquiste seus objetivos com a melhor comunidade de foco.</p>
                            </div>

                            {/* Centro: Navegação rápida */}
                            <div className="rodape_links">
                                <h4>Navegação</h4>
                                <ul>
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/squads">Squads</a></li>
                                    <li><a href="/sobre">Sobre nós</a></li>
                                </ul>
                            </div>

                            {/* Lado Direito: Redes Sociais */}
                            <div className="Redes_sociais">
                                <h4>Siga-nos</h4>
                                <ul>
                                    <li><a href="#">Instagram</a></li>
                                    <li><a href="#">Discord</a></li>
                                    <li><a href="#">GitHub</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="rodape_copyright">
                            <p>&copy; 2024 Rank Over. Todos os direitos reservados.</p>
                        </div>
                    </div>

                </>

            ) : (
                <div className="squad_grid">
                    {/* Filtro de pesquisa que você já fez */}
                    {squads.map((cards) => cards.nome.toLowerCase().includes(pesquisaQuery.toLowerCase()) && (
                        <CardSquad card={cards} key={cards.id} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Home