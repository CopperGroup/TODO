import Chats from "@/components/admin-components/Chats/Chats";
import { fetchTeamChats } from "@/lib/actions/chat.actions";
import { currentUser } from "@clerk/nextjs/server"


const Page = async ({ params }: { params: { id: string }}) => {
  const user = await currentUser();

  if(!params.id) {
    return null
  }
  
  const chats = await fetchTeamChats({ teamId: params.id, clerkId: user?.id }, 'json')


  console.log(chats)
  return (
    <Chats stringifiedTeamData={chats} clerkId={user?.id as string}/>
  )
}

export default Page