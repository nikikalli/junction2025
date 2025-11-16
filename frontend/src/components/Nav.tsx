import { useNavigate } from 'react-router-dom';
import logo from '../img/sephira_logo.png';
import { Button } from './ui/button';

export function Nav() {
    const navigate = useNavigate();
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-xl flex justify-between bg-black">
            <button onClick={() => navigate('/')} aria-label="Go to homepage" className="p-0 border-0 bg-transparent cursor-pointer">
            <img src={logo} className="w-40" alt="Sephira Logo" />
            </button>

            <div className="flex items-center gap-4 text-white">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Home</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/sas-viya-case-study')}>SAS Viya case study</Button>
                <span className="text-sm text-gray-400">ImpaktiRyhäm</span>
            </div>
        </nav>
    );
}