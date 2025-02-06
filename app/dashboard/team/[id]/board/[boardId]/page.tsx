import Board from "@/components/KanBoard/Board";
import { fetchBoardById } from "@/lib/actions/board.actions";

interface Card {
  title: string; 
  id: string; 
  column: string
}

export default async function Page({ params }: { params: { boardId: string } }) {
  if(!params.boardId) {
    return (
      <h1>Board does not exist</h1>
    )
  }

  const stringifiedBoard = await fetchBoardById({ boardId: params.boardId }, 'json');

  return (
    <section className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board stringifiedBoard={stringifiedBoard} />
    </section>
  );
}
