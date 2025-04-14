import './App.css';
import "@cyntler/react-doc-viewer/dist/index.css";
import Layout from './components/layout/layout'
import { useAuthStore } from '@/store/zustand.store';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


function App() {

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if(!isAuthenticated){
      navigate('/login',{state:{ from: location.pathname }});
      return;
    }
  },[isAuthenticated]);


  return (
    <>
      <Layout />
    </>
  )
}

export default App
