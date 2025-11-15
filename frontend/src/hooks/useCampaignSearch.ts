import { useState, useEffect } from "react";
import { CanvasList } from "@/types";

interface UseCampaignSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  canvasList: CanvasList[];
  filteredCanvasList: CanvasList[];
  loadingList: boolean;
}

export const useCampaignSearch = (): UseCampaignSearchReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [canvasList, setCanvasList] = useState<CanvasList[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    const fetchCanvasList = async () => {
      setLoadingList(true);
      try {
        const res = await fetch("http://localhost:3000/api/braze/canvas/list");
        const data = await res.json();
        const list =
          data.canvases?.map((c: any) => ({ id: c.id, name: c.name })) || [];
        setCanvasList(list);
      } catch (err) {
        console.error("Error fetching canvas list:", err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchCanvasList();
  }, []);

  const filteredCanvasList = canvasList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    canvasList,
    filteredCanvasList,
    loadingList,
  };
};
