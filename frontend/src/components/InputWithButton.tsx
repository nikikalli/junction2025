import { Input } from "@/components/ui/input"
import React from "react"

interface Props {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
}

export function InputWithButton({ value, onChange, onSubmit, placeholder }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit && onSubmit()
      }}
      className={`w-full`}
    >
      <Input
        className="bg-transparent border-0"
        type="text"
        placeholder={placeholder || "Search Canvas to create a new Campaign"}
        value={value}
        onChange={onChange}
      />
    </form>
  )
}