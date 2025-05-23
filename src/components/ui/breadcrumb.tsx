import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  children: React.ReactNode;
}

export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"div"> {
  children?: React.ReactNode;
  decorative?: boolean;
}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

export function BreadcrumbList({ className, children, ...props }: BreadcrumbListProps) {
  return (
    <div
      role="list"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
  return (
    <div
      role="listitem"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BreadcrumbLink({
  className,
  children,
  asChild,
  ...props
}: BreadcrumbLinkProps) {
  return (
    <button
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function BreadcrumbSeparator({
  children,
  className,
  decorative,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <div
      role={decorative ? "presentation" : "separator"}
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </div>
  );
}
