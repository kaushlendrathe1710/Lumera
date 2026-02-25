"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

interface ConfirmDialogContentProps {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
}

export const ConfirmDialog = Dialog
export const ConfirmDialogTrigger = DialogTrigger

export function ConfirmDialogContent({
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  ...props
}: ConfirmDialogContentProps & React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">{cancelText}</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            onClick={() => {
              void (async () => {
                try {
                  await onConfirm?.()
                } catch (e) {
                  console.error(e)
                }
              })()
            }}
          >
            {confirmText}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

export const ConfirmDialogClose = DialogClose

export default ConfirmDialog
