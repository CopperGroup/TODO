import  TaskBoard  from '@/components/admin-components/Tasks/TaskBoard'
import { fetchTeamTasks } from '@/lib/actions/team.actions'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
    const user = await currentUser()

    if(!params.id) return

    const stringifiedTeamTasks = await fetchTeamTasks({ teamId: params.id }, 'json')

    return (
        <TaskBoard stringifiedTeamTasks={stringifiedTeamTasks} currentUser={{clerkId: user?.id as string, email: user?.primaryEmailAddress?.emailAddress as string }}/>
    )
}

export default Page