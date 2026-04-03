import './App.css'
import Home from './paginas/Home'
import Navbar from './paginas/Navbar'
import Squads from './paginas/Squads'
import Cadastrar from './paginas/Cadastrar'
import PerfilSquad from './paginas/PerfilSquad'
import Entrar from './paginas/Entrar'
import Perfil from './paginas/Perfil'
import PerfilConfig from './paginas/PerfilConfig'
import CadastrarSquad from './paginas/CadastrarSquad'
import AlterarPerfil from './paginas/AlterarPerfil'
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { db } from "./firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";



function App() {
  const [pesquisaQuery, setPesquisa] = useState("");
  const [usuario, setUsuario] = useState<User | null>(null);
  const [squads, setSquads] = useState([]);

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
      <Navbar squads={squads} setPesquisa={setPesquisa} pesquisaQuery={pesquisaQuery} usuario={usuario} />

      <Routes>
        <Route path="/" element={<Home squads={squads} pesquisaQuery={pesquisaQuery} />} />

        <Route path="/paginas/Squads" element={<Squads squads={squads} />} />

        <Route path="/paginas/PerfilSquad/:id" element={<PerfilSquad squads={squads} usuario={usuario} />} />

        <Route path='/paginas/Cadastrar' element={<Cadastrar />} />

        <Route path="/paginas/CadastrarSquad" element={<CadastrarSquad/>} />

        <Route path='/paginas/Entrar' element={<Entrar />} />

        <Route path="/config/alterar/:campo" element={<AlterarPerfil />} />

        <Route path='/paginas/Perfil' element={<Perfil usuario={usuario}/>}/>

        <Route path="/paginas/PerfilConfig" element={<PerfilConfig usuario={usuario} />} />
      </Routes>
    </Router>
  );
}

export default App;
