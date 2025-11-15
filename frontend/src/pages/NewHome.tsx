import TextType from "@/components/TextType";
import SpotlightCard from "@/components/SpotlightCard";
import PrismaticBurst from "@/components/PrismaticBurst";
import { InputWithButton } from "@/components/InputWithButton";
import { Nav } from "@/components/Nav";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CanvasList {
  id: string;
  name: string;
}


export const NewHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanvasList = async () => {
      setLoadingList(true);
      try {
        const res = await fetch('http://localhost:3000/api/braze/canvas/list');
        const data = await res.json();
        const list = data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
        setCanvasList(list);
      } catch (err) {
        console.error('Error fetching canvas list:', err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchCanvasList();
  }, []);

  const filteredCanvasList = canvasList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

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
        <div className="absolute inset-0 z-10 flex flex-col items-center h-full">
          <Nav />
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <TextType
              className="text-4xl md:text-6xl font-bold mb-2 whitespace-nowrap"
              text={["One manager, a thousand campaigns"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="_"
            />
            <p className="text-1xl md:text-2xl text-gray-400">
              Turn assets into campaigns with one click
            </p>
            <SpotlightCard
              className="flex flex-col items-center justify-center custom-spotlight-card w-full"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="relative w-full flex justify-center">
                <InputWithButton
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSubmit={() => {
                    if (filteredCanvasList.length === 1) {
                      navigate(`/campaign?canvasId=${filteredCanvasList[0].id}`)
                    } else {
                      navigate(`/campaign?q=${encodeURIComponent(searchTerm)}`)
                    }
                  }}
                />

                {searchTerm.trim() !== '' && (
                  <div className="absolute mt-2 top-full w-full max-w-sm bg-white text-black rounded shadow-lg overflow-visible z-20">
                    {loadingList ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    ) : filteredCanvasList.length > 0 ? (
                      filteredCanvasList.slice(0, 6).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => navigate(`/campaign?canvasId=${c.id}`)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          {c.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                    )}
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
          {/* <SpotlightCard
            className="flex flex-col items-center justify-center custom-spotlight-card"
            spotlightColor="rgba(0, 229, 255, 0.2)"
          >
            <h2>Ongoing/Previous Campaigns</h2>
          </SpotlightCard> */}
        </div>
      </div>
    </div>
  );
};
