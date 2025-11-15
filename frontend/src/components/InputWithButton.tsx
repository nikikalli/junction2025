import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
export function InputWithButton() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input className="bg-gray-900 border-0" type="email" placeholder="Braze Canvas ID" />
      <Button className="bg-gray-100 border-0 text-gray-900" type="submit" variant="outline">
        Start
      </Button>
    </div>
  )
}