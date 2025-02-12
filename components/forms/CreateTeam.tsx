"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { createTeam } from "@/lib/actions/team.actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check, ChevronRight, PlusCircle, User, X, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { checkoutPlan, createTeamPlan } from "@/lib/actions/transaction.actions"

const formSchema = z.object({
  teamName: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  themeColor: z.string(),
  billingPlan: z.enum(["basic_plan", "pro_plan"]),
  members: z.array(
    z.object({
      label: z.string(),
      value: z.string().email(),
    }),
  ),
})

type FormData = z.infer<typeof formSchema>

const plans = {
  basic_plan: {
    price: 9,
    currency: "USD",
    billing_cycle: "monthly",
    features: {
      team_members: 12,
      boards: 1,
      tasks: Number.POSITIVE_INFINITY,
      storage: 50,
      task_tracking: "basic",
      custom_columns: false,
      chats: false,
    },
  },
  pro_plan: {
    price: 29,
    currency: "USD",
    billing_cycle: "monthly",
    features: {
      team_members: Number.POSITIVE_INFINITY,
      boards: 12,
      tasks: Number.POSITIVE_INFINITY,
      storage: 5000,
      task_tracking: "advanced",
      custom_columns: true,
      chats: true,
    },
  },
}

// Mock user data for suggestions
const mockUsers: { label: string, value: string}[] = [
  // { label: "Alice Johnson", value: "alice@example.com" },
  // { label: "Bob Smith", value: "bob@example.com" },
  // { label: "Charlie Brown", value: "charlie@example.com" },
  // { label: "Diana Ross", value: "diana@example.com" },
  // { label: "Edward Norton", value: "edward@example.com" },
]

export default function CreateTeamPage() {
  const [step, setStep] = useState(1)
  const { user } = useUser()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      themeColor: "#000000",
      billingPlan: "basic_plan",
      members: [],
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsCreating(true)
    try {
      const teamId = await createTeam({ 
        name: data.teamName,
        usersEmails: data.members.map(m => m.value),
        plan: 'free_plan',
        adminClerkId: user?.id
      }, 'json')

      const createdTeam = {_id: '1'};

      const transaction = { plan: data.billingPlan, teamId, clerkId: user?.id };
      await checkoutPlan(transaction);
      // await createTeam(
      //   {
      //     name: data.teamName,
      //     usersEmails: data.members.map((member) => member.value),
      //     adminClerkId: user?.id,
      //     plan: data.billingPlan,
      //   },
      //   "json",
      // )
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      })
      // Redirect to teams page or dashboard
    } catch (error) {
      console.error("Failed to create team:", error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const nextStep = (e: any) => {
    e.preventDefault();

    setStep((prev) => Math.min(prev + 1, 4))
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-black rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4 text-center">Create Your New Kolos Team</h1>
            <StepIndicator currentStep={step} totalSteps={4} />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div>
                  {step === 1 && <NameAndTheme form={form} />}
                  {step === 2 && <BillingPlan form={form} plans={plans} />}
                  {step === 3 && <InviteMembers form={form} setStep={setStep} />}
                  {step === 4 && <Preview form={form} plans={plans} />}
                </div>

                <div className="flex justify-between pt-4">
                  {step > 1 && (
                    <Button type="button" onClick={prevStep} variant="outline" size="sm">
                      Previous
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto coppergroup-gradient" size="sm">
                      Next
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isCreating} className="ml-auto coppergroup-gradient" size="sm">
                      {isCreating ? "Creating..." : "Launch Your Team"}
                      <Zap className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step <= currentStep
                ? "coppergroup-gradient text-white"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {step < currentStep ? <Check className="w-3 h-3" /> : <span>{step}</span>}
          </div>
          {step < totalSteps && (
            <div
              className={`h-0.5 flex-1 mx-1 ${
                step < currentStep ? "bg-gradient-to-r from-[#B78628] to-[#DBA514]" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function NameAndTheme({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="teamName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Team Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter team name" {...field} className="border-gray-300 dark:border-gray-700" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="themeColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Theme Color</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  {...field}
                  className="w-10 h-10 p-1 rounded-md border-gray-300 dark:border-gray-700"
                />
                <span className="text-sm">{field.value}</span>
              </div>
            </FormControl>
            <FormDescription className="text-xs mt-1">
              Choose a color that represents your team&apos;s identity.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

function BillingPlan({ form, plans }: { form: any; plans: any }) {
  return (
    <FormField
      control={form.control}
      name="billingPlan"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold mb-2 block">Choose Your Plan</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {Object.entries(plans).map(([planKey, plan]: [string, any]) => (
                <Card
                  key={planKey}
                  className={`relative overflow-hidden ${
                    field.value === planKey
                      ? "border-2 border-[#DBA514]"
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-bold">{planKey === "basic_plan" ? "Basic" : "Pro"}</CardTitle>
                    <CardDescription className="text-sm">
                      ${plan.price}/{plan.billing_cycle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-1 text-sm">
                      {Object.entries(plan.features).map(([feature, value]: [string, any]) => (
                        <li key={feature} className="flex items-center">
                          <Check className="w-4 h-4 text-[#DBA514] mr-2 flex-shrink-0" />
                          <span>
                            {feature
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                            :{" "}
                            <span className="font-medium">
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : typeof value === "number"
                                  ? value === Number.POSITIVE_INFINITY
                                    ? "Unlimited"
                                    : value
                                  : value}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-4">
                    <RadioGroupItem value={planKey} id={planKey} className="sr-only" />
                    <Label
                      htmlFor={planKey}
                      className={`w-full py-2 px-4 text-center text-sm font-medium text-white  rounded-md cursor-pointer ${planKey === "pro_plan" ? "coppergroup-gradient" : 'text-nautral-800'}`}
                    >
                      Select Plan
                    </Label>
                  </CardFooter>
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function InviteMembers({ form, setStep }: { form: any, setStep: Dispatch<SetStateAction<number>>}) {
  const [inputValue, setInputValue] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const members = form.watch("members");
  const selectedPlan = form.getValues("billingPlan");
  const maxMembers = plans[selectedPlan as 'basic_plan' | 'pro_plan']?.features.team_members;

  const handleAddMember = (member: { label: string; value: string }) => {
    const currentMembers = form.getValues("members") || [];
    if (!currentMembers.some((m: any) => m.value === member.value)) {
      form.setValue("members", [...currentMembers, member]);
      setInputValue("");
      setComboboxOpen(false);
    }
  };

  const handleRemoveMember = (memberValue: string) => {
    const currentMembers = form.getValues("members") || [];
    form.setValue(
      "members",
      currentMembers.filter((m: any) => m.value !== memberValue)
    );
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const filteredItems = mockUsers.filter(
    (item) =>
      !members.some((m: any) => m.value === item.value) &&
      (item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.value.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <FormField
      control={form.control}
      name="members"
      render={() => (
        <FormItem>
          <FormLabel className="text-base font-semibold">Invite Team Members</FormLabel>
          <FormControl>
            <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <ComboboxTrigger
                className="w-full"
                disabled={members.length >= maxMembers}
              >
                Search for members or enter email...
              </ComboboxTrigger>
              <ComboboxContent className="w-full p-0">
                <ComboboxInput
                  placeholder="Search for members or enter email..."
                  value={inputValue}
                  onValueChange={setInputValue}
                  className="w-full p-2"
                  disabled={members.length >= maxMembers}
                />
                <ComboboxList className="max-h-[200px] overflow-y-auto">
                  {filteredItems.length === 0 && !isValidEmail(inputValue) && (
                    <ComboboxEmpty>No one found.</ComboboxEmpty>
                  )}
                  {filteredItems.map((item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleAddMember(item)}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-sm text-gray-500">{item.value}</span>
                    </ComboboxItem>
                  ))}
                  {isValidEmail(inputValue) &&
                    !filteredItems.some((item) => item.value === inputValue) && (
                      <ComboboxItem
                        value={inputValue}
                        onSelect={() => handleAddMember({ label: inputValue, value: inputValue })}
                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Add &quot;{inputValue}&quot;</span>
                      </ComboboxItem>
                    )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </FormControl>
          <FormMessage />

          {members.length > 0 && (
            <ScrollArea className="h-[100px] w-full rounded-md border p-2 mt-2">
              <div className="flex flex-wrap gap-2">
                {members.map((member: any) => (
                  <Badge key={member.value} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    <User className="h-3 w-3" />
                    <span className="text-sm">{member.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveMember(member.value)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {member.label}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
          {members.length >= maxMembers && (
            <div className="mt-2 flex flex-col items-center">
              <Button type="button" variant="ghost" className="mt-2 font-bold coppergroup-gradient-text hover:text-initial" onClick={() => setStep(prev => prev - 1)}>
                Upgrade to Pro
              </Button>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}



function Preview({ form, plans }: { form: any; plans: any }) {
  const { teamName, themeColor, billingPlan, members } = form.getValues()
  const selectedPlan = plans[billingPlan]

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Team Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <FormLabel className="text-sm font-semibold">Team Name</FormLabel>
            <div className="text-base mt-1">{teamName}</div>
          </div>
          <div>
            <FormLabel className="text-sm font-semibold">Theme Color</FormLabel>
            <div className="flex items-center mt-1">
              <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: themeColor }}></div>
              <span className="text-sm">{themeColor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4">
          <CardTitle className="text-lg"><span className={`${billingPlan === "basic_plan" ? "" : "coppergroup-gradient-text text-xl font-bold"}`}>{billingPlan === "basic_plan" ? "Basic" : "Pro"}</span> plan:</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <div className="text-base">
            ${selectedPlan.price}/{selectedPlan.billing_cycle}
          </div>
          <ul className="space-y-1 text-sm">
            {Object.entries(selectedPlan.features).map(([feature, value]: [string, any]) => (
              <li key={feature} className="flex items-center">
                <Check className="w-4 h-4 text-[#DBA514] mr-2 flex-shrink-0" />
                <span>
                  {feature
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  :{" "}
                  <span className="font-medium">
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : typeof value === "number"
                        ? value === Number.POSITIVE_INFINITY
                          ? "Unlimited"
                          : value
                        : value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Invited Members</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2 text-sm">
            {members.map((member: any) => (
              <li key={member.value} className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span>{member.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

