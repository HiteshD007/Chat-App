import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Auth from './components/auth/auth';
import Invite from './components/invite';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}/>
        <Route path='/login' element={<Auth />} />
        <Route path='/invite/:token' element={<Invite />} />
      </Routes>
    </BrowserRouter>
  )
};

export default AppRouter;
