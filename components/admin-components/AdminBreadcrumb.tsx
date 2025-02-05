"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AdminBreadcrumb({
  teams,
}: {
  teams: {
    teamId: string
    name: string
    teamColor: string
    boards: { boardId: string; name: string }[]
  }[]
}) {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  const getSegmentName = (segment: string, index: number) => {
    // Handle team name
    if (pathSegments[index - 1] === "team") {
      const team = teams.find((t) => t.teamId === segment)
      return team ? team.name : `Team ${segment}`
    }

    // Handle board name
    if (pathSegments[index - 1] === "board") {
      const boardId = segment
      const team = teams.find((t) =>
        t.boards.some((board) => board.boardId === boardId)
      )
      const board = team?.boards.find((b) => b.boardId === boardId)
      return board ?`${board.name} Board`: `Board ${segment}`
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          // Skip "team" and "board" segments
          if (segment === "team" || segment === "board") return null

          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const isLast = index === pathSegments.length - 1

          const segmentName = getSegmentName(segment, index)

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segmentName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{segmentName}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
