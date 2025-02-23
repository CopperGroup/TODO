import MeetingScheduler from "@/components/admin-components/Meetings/Sheduler/MeetingSheduler";
import { fetchTeamMeetings } from "@/lib/actions/meeting.actions";
const Page = async ({params }: { params: { id: string } }) => {
    if(!params.id) return

    const stringifiedTeamWithMeetings = await fetchTeamMeetings({ teamId: params.id }, 'json')
    return (
        <section className="w-full h-screen overflow-hidden">
            <MeetingScheduler stringifiedTeamWithMeetings={stringifiedTeamWithMeetings}/>
        </section>
    )
}

export default Page