import CardSquad from "../componentes/CardSquad"
import "./Home.css"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Importe os estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home({ squads, pesquisaQuery }) {

    const squadsPopulares = squads.slice(0, 7);
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
                        <h2>Bem-vindo ao Rank Over!</h2>
                        <p>Descubra os melhores squads pra te acompanhar</p>
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