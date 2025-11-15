import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { InputWithButton } from "@/components/InputWithButton";

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <PrismaticBurst
          animationType="rotate3d"
          intensity={2}
          speed={0.5}
          distort={1.0}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={24}
          mixBlendMode="lighten"
          colors={["#ff007a", "#4d3dff", "#ffffff"]}
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 whitespace-nowrap">
            Welcome to {""}
            <span className="inline">
            </span>
          </h1>
          <TextType
            className="text-1xl md:text-4xl mb-2 font-bold color-gray-300"
            text={[
              "Your personalized marketing tool",
              "Automate painfull tasks",
              "One manager, a thousand campaigns",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="_"
          />
          <SpotlightCard
            className="flex flex-col items-center justify-center custom-spotlight-card"
            spotlightColor="rgba(0, 229, 255, 0.2)"
          >
            <p className="mb-4">Enter your Braze Canvas ID to get started</p>
            <InputWithButton />
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};
