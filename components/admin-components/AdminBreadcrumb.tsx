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

const routeNameMap: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/dashboard/tasks": "Tasks",
  "/dashboard/boards": "Boards",
  "/dashboard/members": "Members",
  // Add more routes as needed
}

const boardNames: { [key: string]: string } = {
  "1": "Project Alpha",
  "2": "Marketing Campaign",
  "3": "Bug Tracker",
  // Add more board names as needed
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const isLast = index === pathSegments.length - 1

          let segmentName = routeNameMap[href] || segment

          // Special handling for board pages
          if (segment === "boards" && index < pathSegments.length - 1) {
            const boardId = pathSegments[index + 1]
            segmentName = boardNames[boardId] || `Board ${boardId}`
          }

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

