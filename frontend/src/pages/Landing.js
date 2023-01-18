import { Link } from "react-router-dom";
function Landing () {
  return (
    <div className="bg-books-art w-full h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-4xl font-sans text-white font-bold">Non-fiction books you'll actually remember</div>
      <div className="text-xl font-sans text-white font-semibold">Enhancing existing books with summaries, better search, flashcards, and a "teacher" you can ask questions to</div>
      <Link to="/chapter/1" className="font-sans bg-transparent hover:bg-white text-white font-semibold hover:text-slate-700 py-2 px-4 border border-white-500 hover:border-transparent rounded-full">Start Reading Zero to One (but better)</Link>
    </div>
  )

}
export default Landing;