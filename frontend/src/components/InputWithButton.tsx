import { Input } from "@/components/ui/input"
import React from "react"

interface Props {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
}

export function InputWithButton({ value, onChange, onSubmit, placeholder, className }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit && onSubmit()
      }}
      className={`w-full ${className ?? ""}`}
    >
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          className="bg-gray-900 border-0"
          type="text"
          placeholder={placeholder || "Search Canvas to create a new Campaign"}
          value={value}
          onChange={onChange}
        />
      </div>
    </form>
  )
}