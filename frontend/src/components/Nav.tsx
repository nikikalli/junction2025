import logo from '../img/sephira_logo.png';
import GooeyNav from './GooeyNav';

const navItems = [
    { label: 'Home', href: '#' },
    { label: 'How we use SAS Viya', href: '/our-ai' },
];

export function Nav() {
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-xl flex justify-between bg-black">
            <img src={logo} className="w-40" alt="Sephira Logo" />
            <div className="flex items-center gap-4">
                <GooeyNav
                    items={navItems}
                    particleCount={15}
                    particleDistances={[90, 10]}
                    particleR={100}
                    initialActiveIndex={0}
                    animationTime={600}
                    timeVariance={300}
                    colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                />
                <span className="text-sm text-gray-400">ImpaktiRyhäm</span>
            </div>
        </nav>
    );
}