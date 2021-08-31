import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
//import { useLocation } from "react-router";
import axios from "axios";
import moment from "moment-timezone";

const VideoSearchProvider = (props) => {
  let searchTerm = localStorage.getItem("searchItem")
    ? localStorage.getItem("searchItem")
    : "penguins";

  let videosL = localStorage.getItem("videos");
  let videosArr = videosL ? JSON.parse(videosL) : [];
  let historyVideosL = localStorage.getItem("historyVideos");
  let historyVideosArr = historyVideosL
    ? JSON.parse(historyVideosL)
    : [{ searchTermH: "1919", historyVidList: [] }];
  let historyMixL = localStorage.getItem("historyMix");
  let historyMixArr = historyMixL ? JSON.parse(historyMixL) : [];
  const history = useHistory();
  const location = useLocation();
  //const { searchTerm } = useParams();
  const [refreshMain, setRefreshMain] = useState(true);
  const searchRef = useRef();
  const buttonHeart = useRef("heart");
  const [searchItem, setSearchItem] = useState(searchTerm);

  const [videos, setVideos] = useState(videosArr);
  const [loadVideos, setLoadVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectId, setSelectId] = useState("");
  const [nextPageToken, setNextPageToken] = useState("");
  const [videoSearchErr, setVideoSearchErr] = useState({
    status: false,
    errLog: [],
  });
  const [historyVideos, setHistoryVideos] = useState(historyVideosArr);
  const [historyMix, setHistoryMix] = useState(historyMixArr);
  const [loadSelVideo, setLoadSelVideo] = useState(false);
  const [selVidErr, setSelVidErr] = useState(false);

  if (refreshMain) {
    console.log("AT REFRESH CHECKPOINT");
    if (localStorage.getItem("searchItem")) {
      console.log("searchTerm :" + searchTerm);
      let res = searchTerm.localeCompare(location.pathname.substring(1));
      console.log("comparison result of local and url " + res);
      //refresh scenario
      if (
        res === 0 &&
        searchItem.localeCompare(location.pathname.substring(1)) !== 0
      ) {
        console.log("WOOOOOWWWWW browser was refreshed");
        setRefreshMain((prev) => true);
        console.log("refresh status -> " + refreshMain);
      }
    } else {
      console.log("NOT REFRESH");
      setRefreshMain((prev) => false);
    }
  }

  const getVideos = async () => {
    console.log("2nd LOAD VIDEOS AFTER REFRESH CHECK");
    let apiKey4 = `${process.env.REACT_APP_ACCESS_KEY1}`;
    let apiKey = `${process.env.REACT_APP_ACCESS_KEY2}`;
    let apiKey2 = `AIzaSyBNV1xLcc3zEuseiBN2ZNiDEIe3WpUM_RM`;
    let apiKey0 = `AIzaSyBQu_RLMTu-Fd9s-dTMNZcbRI04rbcM8zs`;
    console.log(
      "location.pathname before history.push=" + location.pathname.substring(1)
    );

    try {
      //getting videos as a result of submitting something in the search bar, therefore not as a result of refreshing.
      let searchTerm = localStorage.getItem("searchItem")
        ? localStorage.getItem("searchItem")
        : "penguins";

      let searchStr = searchRef.current.value
        ? searchRef.current.value
        : searchTerm;
      history.push(`/${searchStr}`);

      let res = nextPageToken
        ? await axios.get("https://youtube.googleapis.com/youtube/v3/search?", {
            params: {
              part: "snippet",
              maxResults: 25,
              pageToken: nextPageToken,
              q: searchStr,
              key: apiKey,
              videoEmbeddable: "any",
            },
          })
        : await axios.get("https://youtube.googleapis.com/youtube/v3/search?", {
            params: {
              part: "snippet",
              maxResults: 25,
              q: searchStr,
              key: apiKey,
              videoEmbeddable: "any",
            },
          });
      await console.log(searchStr);
      await console.log(res.data.items);

      //1st load scenario and new search term entered scenario
      if (
        videos.length === 0 ||
        searchStr.localeCompare(
          JSON.parse(localStorage.getItem(searchItem))
        ) !== 0
      ) {
        await localStorage.setItem(searchStr, JSON.stringify(res.data.items));
        await localStorage.setItem("videos", JSON.stringify(res.data.items));
        await setVideos((previousVideos) => {
          return res.data.items;
        });

        if (historyVideosArr[0].searchTermH.localeCompare(searchStr) !== 0) {
          await historyVideosArr.unshift({
            searchTermH: searchStr,
            historyVidList: res.data.items,
            date: moment().tz("Europe/Madrid").format(),
          });

          await localStorage.setItem(
            "historyVideos",
            JSON.stringify(historyVideosArr)
          );
          await setHistoryVideos((prevHistoryVideos) => historyVideosArr);

          await addToHistoryMix(historyVideosArr, historyMixArr, searchStr);
        }
      } else {
        //Scenario that the new pagetoken is added but have the same searchtern
        await localStorage.setItem(
          searchStr,
          JSON.stringify([...videos, ...res.data.items])
        );
        await localStorage.setItem(
          "videos",
          JSON.stringify([...videos, ...res.data.items])
        );
        await setVideos((previousVideos) => {
          return [...previousVideos, ...res.data.items];
        });
      }

      //setting the page token corresponding the current list downloaded
      await localStorage.setItem("nextPageToken", res.data.nextPageToken);
      //setting the searchItem to the current ref or "penguins" - refresh not considered here
      await setSearchItem((prev) => searchStr);
      await localStorage.setItem("searchItem", searchStr);
      await setSelectedVideo(
        (prev) => JSON.parse(localStorage.getItem(searchStr))[0]
      );
      await setSelectId(
        (prev) => JSON.parse(localStorage.getItem(searchStr))[0].id.videoId
      );
      //await setSelectedVideo((prev) => res.data.items[0]);
      //await setSelectId((prev) => res.data.items[0].id.videoId);
      await setLoadVideos((prev) => false);
      await console.log(
        "location.pathname after big code=" + location.pathname.substring(1)
      );

      await setVideoSearchErr((prev) => {
        return {
          status: false,
          errLog: [...videoSearchErr.errLog],
        };
      });
      await localStorage.setItem(
        "videoSearchErr",
        JSON.stringify({
          status: false,
          errLog: [...videoSearchErr.errLog],
        })
      );
    } catch (error) {
      setLoadVideos((prev) => false);
      console.log("9999-searchctx -ERROR" + error);
      console.log(error.statusCode);
      setVideoSearchErr((prev) => {
        return {
          status: true,
          errLog: [...videoSearchErr.errLog, { error }],
        };
      });
      localStorage.setItem(
        "videoSearchErr",
        JSON.stringify({
          status: true,
          errLog: [...videoSearchErr.errLog, { error }],
        })
      );
    }
  };

  //adding to historyMix function
  const addToHistoryMix = (arrHisVids, arrHisMix, searchStrP) => {
    //checking not same searchTerm or the default searchTerm
    console.log("AAAAA-ADDTOHISTORYMIX-READING");
    console.log("AAAA-" + arrHisVids[0].searchTermH);
    console.log("AAAA-arrHisMix" + arrHisMix.length);
    //  if (arrHisVids[0].searchTermH.localeCompare(searchStrP) !== 0) {
    console.log("AIAIAIAI -historyVid.length " + arrHisVids.length);

    arrHisMix.unshift(arrHisVids[0].historyVidList[1]);
    arrHisMix.unshift(arrHisVids[0].historyVidList[0]);
    if (arrHisVids.length <= 2) {
      arrHisMix.pop();
      arrHisMix.pop();
    }
    //checking list length max 10 videos
    if (arrHisMix.length > 10) {
      arrHisMix.pop();
      arrHisMix.pop();
    }

    localStorage.setItem("historyMix", JSON.stringify(historyMixArr));
    setHistoryMix((prev) => historyMixArr);
    //  }
  };

  //for default load and for api pagination
  useEffect(() => {
    getVideos();
  }, [nextPageToken]); //nextPageToken

  /*
  /////////////////////////////////infinite scroll
  useEffect(() => {
    const event = window.addEventListener("scroll", () => {
      // console.log(`innerHeight ${window.innerHeight}`);
      // console.log(`scrollY ${window.scrollY}`);
      // console.log(`body height ${document.body.scrollHeight}`);

      if (
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 10
      ) {
        console.log("it worked");
        console.log("why aren't you printing");
        let nextPageTokenL = localStorage.getItem("nextPageToken");
        console.log("why aren't you printing");
        console.log(nextPageTokenL);
        setNextPageToken((prev) => nextPageTokenL);
        console.log(nextPageTokenL);
      }
    });
    return () => window.removeEventListener("scroll", event);
  }, []);

  //////////////////////////////infinite scroll*/

  //get default load from firestore?
  /*
  useEffect(() => {
    localStorage.setItem("videoSearchErr", JSON.stringify(videoSearchErr));
    console.log(videoSearchErr.errLog.length);
  }, [videoSearchErr]);
*/
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoadVideos((prev) => true);
    console.log("submitting " + searchRef.current.value);
    getVideos();
  };
  /*
  useEffect(() => {
    setSearchItem((prev) => searchRef.current.value);
  }, [searchRef.current.value]);
*/

  /*
  useEffect(() => {
    console.log("1st REFRESH CHECK");
    console.log("location.pathname OIIII" + location.pathname.substring(1));
    let localSearch = localStorage.getItem("searchItem");
    if (localSearch) {
      console.log("localSearch :" + localSearch);
      let res = localSearch.localeCompare(location.pathname.substring(1));
      console.log("comparison result of local and url " + res);
      //refresh scenario

      if (
        res === 0 &&
        searchItem.localeCompare(location.pathname.substring(1)) !== 0
      ) {
        console.log("browser was refreshed");
        setRefreshMain((prev) => true);
      }
    }
  }, [location.pathname, searchItem]);
*/
  return (
    <VideoSearchContext.Provider
      value={{
        historyMix: historyMix,
        historyVideos: historyVideos,
        buttonHeart: buttonHeart,
        videos: videos,
        loadVideos: loadVideos,
        selectId: selectId,
        selectedVideo: selectedVideo,
        refreshMain: refreshMain,
        searchRef: searchRef,
        searchItem: searchItem,
        videoSearchErr: videoSearchErr,
        setVideos: setVideos,
        setNextPageToken: setNextPageToken,
        setLoadVideos: setLoadVideos,
        setSelectId: setSelectId,
        setSelectedVideo: setSelectedVideo,
        setSearchItem: setSearchItem,
        handleSubmit: handleSubmit,
        setRefreshMain: setRefreshMain,
      }}
    >
      {props.children}
    </VideoSearchContext.Provider>
  );
};

export default VideoSearchProvider;
export const VideoSearchContext = createContext();

/*
 await localStorage.setItem(
          "historyVideos",
          JSON.stringify([
            ...historyVideos,
            {
              searchTermH: searchStr,
              historyVidList: res.data.items,
              date: moment(),
            },
          ])
        );

*/
