import logo from '../img/sephira_logo.png';

export function Nav() {
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-xl flex justify-between">
            <img src={logo} className="w-40" alt="Sephira Logo" />
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">ImpaktiRyhäm</span>
            </div>
        </nav>
    );
}