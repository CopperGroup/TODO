"use client"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CreateBoardAnimatedBackground from "@/components/backgrounds/CreateBoardAnimatedBackground"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { boardSchema } from "@/lib/validations/board"
import { useRouter } from "next/navigation"
import { createBoard } from "@/lib/actions/board.actions"

const CreateBoardPage = ({ params }: { params: { id: string }}) => {

    if(!params.id) {
        return null
    }

    const router = useRouter();

    const form = useForm<z.infer<typeof boardSchema>>({
        resolver: zodResolver(boardSchema),
        defaultValues: {
        boardName: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof boardSchema>) => {
        const result = await createBoard({ teamId: params.id, boardName: values.boardName }, 'json')

        const board = JSON.parse(result);

        router.push(`/dashboard/team/${params.id}/board/${board._id}`)

        // router.refresh()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 relative overflow-hidden">
        <CreateBoardAnimatedBackground />
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="z-10 w-full max-w-md p-8 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl"
        >
            <h1 className="text-3xl font-bold text-neutral-100 mb-6">Create New Board</h1>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="boardName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-300">Board Name</FormLabel>
                    <FormControl>
                        <Input
                        {...field}
                        className="w-full bg-neutral-700 border-neutral-600 text-neutral-100"
                        placeholder="Enter board name"
                        />
                    </FormControl>
                    <FormDescription className="text-xs text-neutral-400">
                        Board name must be between 1 and 16 characters.
                    </FormDescription>
                    <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                )}
                />
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button type="submit" className="w-full text-md bg-blue-600 hover:bg-blue-700 text-white">
                        Create Board
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Click to create your new board</p>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </form>
            </Form>
        </motion.div>
        </div>
    )
}

export default CreateBoardPage

