import './App.css'
import Home from './paginas/Home'
import Navbar from './paginas/Navbar'
import Cadastrar from './paginas/Cadastrar'
import PerfilSquad from './paginas/PerfilSquad'
import Entrar from './paginas/Entrar'
import Perfil from './paginas/Perfil'
import PerfilConfig from './paginas/PerfilConfig'
import CadastrarSquad from './paginas/CadastrarSquad'
import AlterarPerfil from './paginas/AlterarPerfil'
import PerfilSquadConfig from './paginas/PerfilSquadConfig'
import MembroSquadConfig from './paginas/MembroSquadConfig'
import GerenciarEntradaSquadConfig from './paginas/GerenciarEntradaSquadConfig'
import GerenciarProvaSquadConfig from './paginas/GerenciarProvaSquadConfig'
import ExpansaoPost from './paginas/ExpansaoPost'
import Prova from './paginas/Prova'
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { db } from "./firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import AlertaProvider from "./componentes/AlertaProvider";
import GerenciaPostSquadConfig from './paginas/GerenciaPostSquadConfig'
import AlterarPerfilSquad from './paginas/AlterarPerfilSquad'
import AdicionarItem from './paginas/AdicionarItem'
import ItemExpansao from './paginas/ItemExpansao'
import SquadInsignias from './paginas/SquadInsignias'
import Mensagens from './paginas/Mensagens'
import AdicionarRankSquad from './paginas/AdicionarRankSquad'
import RemoverRankSquad from './paginas/RemoverRankSquad'


function App() {
  const [pesquisaQuery, setPesquisa] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [squads, setSquads] = useState<any[]>([]);
  

useEffect(() => {

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUsuario(user);
    } else {
      setUsuario(null);
    }
  });

  const unsubscribeSquads = onSnapshot(collection(db, "squads"), (snapshot) => {
    const listaSquads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any;
    
    setSquads(listaSquads);
  });

  // Limpa os dois vigias quando o app fechar
  return () => {
    unsubscribeAuth();
    unsubscribeSquads();
  };
}, []);

  return (
    <Router>
      <AlertaProvider>
        <Navbar squads={squads} setPesquisa={setPesquisa} pesquisaQuery={pesquisaQuery} usuario={usuario} />

        <Routes>
          <Route path="/" element={<Home squads={squads} pesquisaQuery={pesquisaQuery} usuario={usuario} />} />

          <Route path='/paginas/Cadastrar' element={<Cadastrar />} />

          <Route path="/paginas/CadastrarSquad" element={<CadastrarSquad usuario={usuario}/>} />

          <Route path='/paginas/Entrar' element={<Entrar />} />

          <Route path="/config/alterar/:campo" element={<AlterarPerfil />} />

          <Route path="/post/:idPost" element={<ExpansaoPost usuario={usuario} />} />

          <Route path="/paginas/Mensagens" element={<Mensagens usuario={usuario} />} />


          <Route path="/paginas/adicionarItem" element={<AdicionarItem usuario={usuario} />} />

          <Route path="/paginas/PerfilSquad/:id" element={<PerfilSquad squads={squads} usuario={usuario} />} />

          <Route path='/squadconfig/alterar/:id/:campo' element={<AlterarPerfilSquad/>}/>

          <Route path='/squadconfig/administrar/:id/:campo' element={<MembroSquadConfig/>}/>

          <Route path='/squadconfig/insignias/:id' element={<SquadInsignias/>}/>

          <Route path='/squadconfig/rank/:id' element={<AdicionarRankSquad/>}/>

          <Route path='/squadconfig/retirar_rank/:id' element={<RemoverRankSquad/>}/>



          <Route path='/squadconfig/solicitacao/:id/prova' element={<GerenciarProvaSquadConfig/>}/>

          <Route path='/squadconfig/solicitacao/:id/post' element={<GerenciaPostSquadConfig/>}/>

          <Route path='/squadconfig/solicitacao/:id/entrada' element={<GerenciarEntradaSquadConfig/>}/>

          <Route path="/paginas/ItemExpansao/:id" element={<ItemExpansao />} />

          <Route path="/paginas/Prova/:id" element={<Prova usuario={usuario} squads={squads} />} />


          <Route path='/paginas/perfil'element={<Perfil usuario={usuario} squads={squads} />} />

          <Route path="/paginas/perfil/:idUsuario" element={<Perfil usuario={usuario} squads={squads} />} />
      
          <Route path="/paginas/PerfilConfig" element={<PerfilConfig usuario={usuario} />} />

          <Route path="/paginas/PerfilSquadconfig/:id" element={<PerfilSquadConfig />} />


        </Routes>
      </AlertaProvider>
    </Router>
  );
}

export default App;
