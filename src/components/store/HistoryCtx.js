import { createContext, useContext, useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { VideoDetailContext } from "./VideoDetailCtx";
import { VideoSearchContext } from "./VideoSearchCtx";

const HistoryProvider = (props) => {
  const { setSelectedVideo, selectedVideo } = useContext(VideoSearchContext);
  const { handleVideoSelect } = useContext(VideoDetailContext);
  let selHistoryL = localStorage.getItem("selectedHistory");
  let selHistoryArr = selHistoryL ? JSON.parse(selHistoryL) : [];
  const [selectedHistory, setSelectedHistory] = useState(selHistoryArr);

  const history = useHistory();

  const handleViewHistory = (termP) => {
    let hisViewStr = localStorage.getItem(termP);
    let hisViewArr = hisViewStr ? JSON.parse(hisViewStr) : [];
    setSelectedHistory((prev) => hisViewArr);
    localStorage.setItem("seletedHistory", hisViewStr);
    handleVideoSelect(hisViewArr[0].id.videoId, "selectedHistory");
    setSelectedVideo((prev) => hisViewArr[0]);
    localStorage.setItem("selectedVideo", JSON.stringify(hisViewArr[0]));
  };

  return (
    <HistoryContext.Provider
      value={{
        selectedHistory: selectedHistory,
        handleViewHistory: handleViewHistory,
      }}
    >
      {props.children}
    </HistoryContext.Provider>
  );
};

export default HistoryProvider;

export const HistoryContext = createContext();
