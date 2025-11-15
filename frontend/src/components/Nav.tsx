import GradientText from "./GradientText";

export function Nav() {
    return (
        <nav className="w-full py-4 px-8 backdrop-blur-xl flex justify-between">
            <GradientText className="text-4xl">Sephira</GradientText>
            <div className="flex items-center gap-4">
                <div className="text-sm bg-gray-400 w-1 h-1"></div>
                <span className="text-sm text-gray-400">Our team name and icon</span>
            </div>
        </nav>
    );
}

