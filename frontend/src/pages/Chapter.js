import "react-chat-elements/dist/main.css";
import { MessageList, Input, Button } from "react-chat-elements";
import React, { useRef, useState, useEffect } from "react";
import { useParams, redirect, Link } from "react-router-dom";
import Question from "../components/Question.js";
import OrbitCard from "../components/OrbitCard.js";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

function Chapter() {
  const { id } = useParams();
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const messageListReferance = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(null);

  const routeChange = (pathToNavigate) => {
    redirect("/");
    redirect(pathToNavigate);
  };
  const handleKeypress = e => {
    //it triggers by pressing the enter key
  if (e.keyCode === 13) {
    e.preventDefault();
    handleSubmit(inputRef.current.value);
    handleSubmit(e.target.value)
  }
};
  const searchWithin = async (input) => {
    setSearchLoading(true);
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"question":"${input}"}`,
    };

    const result = await fetch(
      process.env.REACT_APP_API_ROOT + "/new/search",
      options
    );
    const response = await result.json();
    setSearchLoading(false);
    return response;
  };
  const handleSubmit = async (input) => {

    const response = await searchWithin(input);
    const botText = response.output.text;

    // const firstChapter = await search(response[0][0].substring(0, 20)); //response 0 is a list 2 quotes from the question
    // const secondChapter = await search(response[0][1].substring(0, 20));
    // let botText = "";
    // const firstChapterId = firstChapter.fuzzyResults[0].chapterId
    // const firstChapterTitle = firstChapter.fuzzyResults[0].chapterName
    // let secondChapterId = secondChapter.fuzzyResults[0].chapterId
    // let secondChapterTitle = secondChapter.fuzzyResults[0].chapterName
    // if (secondChapterTitle === firstChapterTitle) {
    //   for (let i = 0; i < secondChapter.fuzzyResults.length; i++) {
    //     if (secondChapter.fuzzyResults[i].chapterId !== firstChapterId) {
    //       secondChapterId = secondChapter.fuzzyResults[i].chapterId
    //       secondChapterTitle = secondChapter.fuzzyResults[i].chapterName
    //       break;
    //     }
    //   }
    // }
    // botText = (
    //   <span>
    //     {response[1] !== "" && response[1]}
    //         <span> You can read more in</span>
    //     <button
    //       style={{ color: "blue" }}
    //       onClick={() => {
    //         setChapterId(firstChapterId);
    //         routeChange(`chapter/${firstChapterId}`);
    //       }}
    //     >
    //       <span>Chapter {firstChapterTitle}</span>
    //     </button>
    //     <span> or </span>
    //     <button
    //       style={{ color: "blue" }}
    //       onClick={() => {
    //         setChapterId(secondChapterId);
    //         routeChange(`chapter/${secondChapterId}`);
    //       }}
    //     >
    //       <span> Chapter {secondChapterTitle}</span>
    //     </button>
    //   </span>
    // )

    const userChatObj = {
      position: "right",
      type: "text",
      text: input,
      date: new Date(),
    };
    const botChatObj = {
      position: "left",
      type: "text",
      text: botText,
      date: new Date(),
    };
    setMessages([...messages, userChatObj, botChatObj]);
    inputRef.current.value = "";
  };

  const [sidebarAccordion, setSideBarAccordion] = useState({
    summary: true,
    flashcards: false,
    semantic: false,
  });

  const [bookId, setBookId] = useState(1);
  const [book, setBook] = useState(null);
  const [chapterId, setChapterId] = useState(id);
  const [chapter, setChapter] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!bookId) return;
    fetch(process.env.REACT_APP_API_ROOT + "/book/" + bookId)
      .then((response) => response.json())
      .then((data) => {
        setBook(data);
        if (!chapterId) setChapterId(data.chapters[0].id);
      });
  }, [bookId]);

  useEffect(() => {
    let secToScroll = sectionScroll.current;

    if (!chapterId) return;
    setLoadingChapter(chapterId);

    fetch(process.env.REACT_APP_API_ROOT + "/chapter/" + chapterId)
      .then((response) => response.json())
      .then((data) => {
        setChapter(data);
        setLoadingChapter(null);
        setTimeout(() => {
          if (!secToScroll) return;
          console.log(document.getElementById("section-" + secToScroll), "soo");
          let topX = document.getElementById(
            "section-" + secToScroll
          ).offsetTop;
          document.getElementById("contentContainer").scrollTop = topX - 20;

          sectionScroll.current = null;
        }, 500);
      });
    fetch(process.env.REACT_APP_API_ROOT + "/summary/" + chapterId)
      .then((response) => response.json())
      .then((data) => {
        let summ = data.join(" ");
        setSummary(summ);
      });
  }, [chapterId]);

  const [searchLoading, setSearchLoading] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  async function search(searchQuery) {
    setSearchLoading(true);
    const chapterContent = await fetch(
      process.env.REACT_APP_API_ROOT + "/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          book: bookId,
        }),
      }
    );
    const response = await chapterContent.json();
    setSearchResults(response);

    setSearchLoading(false);
    return response;
  }

  const [mouseOverTeaser, setMouseOverTeaser] = useState(false);
  const [mouseOverTOC, setMouseOverTOC] = useState(false);
  const displayingTOC = useRef(false);
  const toc = useRef(null);
  const sectionScroll = useRef(null);

  useEffect(() => {
    if ((mouseOverTOC || mouseOverTeaser) && !displayingTOC.current) {
      displayingTOC.current = true;
      toc.current.style.visibility = "";
      toc.current.style.opacity = "1";
      toc.current.style.transform = "translateX(0%)";
      setTimeout(() => {
        // for some bullshit reason this only works if i do it a few ms later
        searchRef.current.focus();
        const end = searchRef.current.value.length;
        searchRef.current.setSelectionRange(end, end);
        searchRef.current.focus();
      }, 100);
    } else if (!mouseOverTeaser && !mouseOverTOC && displayingTOC.current) {
      displayingTOC.current = false;
      toc.current.style.visibility = "hidden";
      toc.current.style.transform = "translateX(-10%)";
      toc.current.style.opacity = "0";
    }
  }, [mouseOverTOC, mouseOverTeaser]);

  function setChapterSection(chapterId, sectionId) {
    sectionScroll.current = sectionId;
    console.log(sectionScroll, sectionScroll.current);
    setChapterId(chapterId);
  }

  return (
    <div id="app">
      <div
        id="toc"
        ref={toc}
        style={{
          visibility: "hidden",
          transform: "translateX(-100%)",
          opacity: 0,
        }}
        className="transition-all h-screen w-80 p-2 sansserif bg-stone-100/90 absolute z-10 overflow-scroll"
        onMouseEnter={() => setMouseOverTOC(true)}
        onMouseLeave={() => setMouseOverTOC(false)}
      >
        <div className="leading-4 text-sm p-4">
          <div className="font-semibold">{book?.title}</div>
          <div className="">{book?.author}</div>
          <form className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <svg
                  ariaHidden="true"
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="search"
                ref={searchRef}
                className="sans-serif block w-full p-2 pl-7 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-0"
                spellCheck="false"
                placeholder="Search for anything"
                required
                onKeyDown={(e) => {
                  if (!e.target.value) setSearchResults(null);
                  if (e.keyCode === 13) {
                    e.preventDefault();
                    search(e.target.value);
                  }
                }}
              />
            </div>
          </form>
        </div>

        {searchResults &&
          searchResults.fuzzyResults &&
          searchResults.fuzzyResults.length && (
            <>
              <p
                className="text-sm ml-4 cursor-pointer"
                onClick={() => setSearchResults(null)}
              >
                Clear search
              </p>

              <div className="flex flex-col mt-2">
                {searchResults.fuzzyResults.map((result, i) => {
                  return (
                    <Link
                      to={`/chapter/${result.chapterId}#section-${result.sectionId}`}
                      key={i}
                    >
                      <div
                        onClick={() =>
                          setChapterSection(result.chapterId, result.sectionId)
                        }
                        className="border-b-2 hover:bg-stone-200 flex flex-col text-sm py-2 cursor-pointer px-3"
                      >
                        <div
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: result.text.trim(),
                          }}
                        ></div>
                        <div className="text-gray-500 font-bold text-sm uppercase mt-1">
                          {result.chapterName}
                        </div>
                        <div></div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        {!searchResults?.fuzzyResults?.length && (
          <div className="flex flex-col mt-2">
            {book?.chapters ? (
              book.chapters.map((chapter, i) => {
                return (
                  <Link key={i} to={`/chapter/${chapter.id}`}>
                    <div
                      className={
                        "flex items-center text-sm rounded py-1 cursor-pointer px-3 transition-colors" +
                        (chapter.id == chapterId
                          ? " bg-stone-800 text-stone-200"
                          : " hover:bg-stone-200")
                      }
                      onClick={() => setChapterId(chapter.id)}
                    >
                      <div>
                        {chapter.title.includes(". ") ? (
                          <>
                            <span className="font-extrabold mr-2">
                              {chapter.title.split(". ")[0]}
                            </span>
                            <span>{chapter.title.split(". ")[1]}</span>
                          </>
                        ) : (
                          <>{chapter.title}</>
                        )}
                      </div>
                      {loadingChapter === chapter.id && (
                        <div id="loading-spinner" className="ml-auto">
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-stone-500"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="animate-pulse">
                <div className="hover:bg-stone-200 rounded py-2 px-3 transition-colors">
                  <div className="h-2 bg-stone-300  rounded col-span-2"></div>
                </div>
                <div className="hover:bg-stone-200 rounded py-2 px-3 transition-colors">
                  <div className="h-2 bg-stone-300  rounded w-4/6"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div id="columns" className="flex overflow-hidden h-screen">

        <div
          id="leftTease"
          className="w-30 h-full sansserif p-4 text-sm text-center flex flex-col opacity-50 hover:opacity-100 transition-opacity"
          onMouseEnter={() => setMouseOverTeaser(true)}
          onMouseLeave={() => setMouseOverTeaser(false)}
        >
          <div
            id="tease"
            className={
              "mt-auto text-gray-700 " + (!book ? "animate-pulse" : "")
            }
          >
            <div className="animate-pulse">Hover for <br></br>Table of <br></br> Contents</div>
            <br></br>
            <div></div>
            {book?.cover ? (
              <img alt="" className="h-24 mx-auto mb-4" src={book?.cover} />
            ) : (
              <div className="h-24 w-16 mx-auto mb-4 bg-gray-600" />
            )}

            <div id="title" className="font-semibold leading-4 text-gray-600">
              {book?.title || (
                <div className="h-2 bg-gray-600  rounded w-3/6" />
              )}
            </div>
            <div
              id="author"
              className="text-gray-500"
              style={{ fontSize: "0.75rem" }}
            >
              {book?.author}
            </div>
          </div>
        </div>
        <div id="contentContainer" className="flex-1 overflow-auto">
          <article
            id="content"
            className="px-12 py-16 max-w-2xl mx-auto prose prose lg:prose-xl"
          >
            {chapter?.sections?.map((sect) => (
              <>
                <div
                  id={"section-" + sect.id}
                  dangerouslySetInnerHTML={{
                    __html: sect.content,
                  }}
                />
                {/* <Question question={sect.question} answer={sect.answer} /> */}
                <OrbitCard question={sect.question} answer={sect.answer}/>
              </>

            ))}
          </article>
        </div>
        <div
          id="right"
          className="flex flex-col w-96 ml-auto bg-blue-100 h-full overflow-auto"
        >
          <div className="mt-4 ml-4 select-none text-center font-semibold text-xl sansserif">
            Don't like Zero to One?<br></br>
            <a className= "text-blue-500" href = "https://aadillpickle.gumroad.com/l/booksbutgood"> Buy your own book (but good)</a> or <a className= "text-blue-500"href = "https://tally.so/r/3xVbkJ">suggest one!</a>
          </div>

          <div
            className={
              "mx-3 mt-5 rounded transition-all" +
              (sidebarAccordion.summary
                ? " bg-white drop-shadow mb-5 opacity-100"
                : " opacity-50")
            }
          >
            <div
              className="flex items-center  px-6 py-3 cursor-pointer"
              onClick={() =>
                setSideBarAccordion((prevState) => {
                  return { ...prevState, ...{ summary: !prevState.summary } };
                })
              }
            >
              <div className="select-none font-semibold text-xl sansserif flex-1">
                Chapter summary
              </div>
              <div
                className={
                  "border-b-2 border-r-2 h-3 w-3 border-gray-600" +
                  (sidebarAccordion.summary ? " -rotate-45" : " rotate-45")
                }
              ></div>
            </div>

            {sidebarAccordion.summary && (
              <div
                className={
                  "px-6 border-t-2 py-3 max-h-96 overflow-scroll" +
                  (sidebarAccordion.summary ? " bg-white" : "")
                }
              >
                {summary}
              </div>
            )}
          </div>

          {/* <div
            className={
              "mx-3 mt-5 rounded transition-all" +
              (sidebarAccordion.flashcards
                ? " bg-white drop-shadow mb-5 opacity-100"
                : " opacity-50")
            }
          > */}
            {/* <div
              className="flex items-center  px-6 py-3 cursor-pointer"
              onClick={() =>
                setSideBarAccordion((prevState) => {
                  return {
                    ...prevState,
                    ...{ flashcards: !prevState.flashcards },
                  };
                })
              }
            >
              {/* <div className="select-none font-semibold text-xl sansserif flex-1">
                Flashcards
              </div>}
              {<div
                className={
                  "border-b-2 border-r-2 h-3 w-3 border-gray-600" +
                  (sidebarAccordion.flashcards ? " -rotate-45" : " rotate-45")
                }
              ></div> }
            </div>

            {/* {sidebarAccordion.flashcards && (
              <div
                className={
                  "px-6 border-t-2 py-3 max-h-96 overflow-scroll" +
                  (sidebarAccordion.flashcards ? " bg-white" : "")
                }
              >
                <Question flashcard={true} />
              </div>
            )}
          </div> */}

          <div
            className={
              "mx-3 rounded transition-all" +
              (sidebarAccordion.semantic
                ? " bg-white drop-shadow mb-5 opacity-100"
                : " opacity-50")
            }
          >
            <div
              className="flex items-center  px-6 py-3 cursor-pointer"
              onClick={() =>
                setSideBarAccordion((prevState) => {
                  return {
                    ...prevState,
                    ...{ semantic: !prevState.semantic },
                  };
                })
              }
            >
              <div className="select-none font-semibold text-xl sansserif flex-1">
                Ask the Author
              </div>
              <div
                className={
                  "border-b-2 border-r-2 h-3 w-3 border-gray-600" +
                  (sidebarAccordion.semantic ? " -rotate-45" : " rotate-45")
                }
              ></div>
            </div>

            {sidebarAccordion.semantic && (
              <div
                className={
                  "px-6 border-t-2 py-3 max-h-96 overflow-scroll" +
                  (sidebarAccordion.semantic ? " bg-white" : "")
                }
              >
                <div className="flex flex-col h-3/6 justify-between" id="chat">
                  <MessageList
                    referance={messageListReferance}
                    className="message-list font-sans overflow-y-scroll"
                    lockable={true}
                    toBottomHeight={"100%"}
                    dataSource={messages}
                  />

                  <Input
                    className="font-sans rounded mb-2"
                    referance={inputRef}
                    placeholder="Ask a question!"
                    multiline={true}
                    onKeyDown={handleKeypress}
                    rightButtons={
                      <Button
                        onClick={() => {
                          handleSubmit(inputRef.current.value);
                        }}
                        disabled={searchLoading}
                        color="white"
                        backgroundColor = {searchLoading ? 'grey' : 'black'}
                        text="Send"
                      />
                    }
                  />
                  {searchLoading && (
                    <div id="loading-spinner" className="ml-auto">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 mr-2 text-gray-200 animate-spin self-center text-center dark:text-gray-600 fill-stone-500"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chapter;
