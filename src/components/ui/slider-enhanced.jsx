import React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const SliderEnhanced = React.forwardRef(({ className, gradient = "from-blue-600 to-purple-600", thumbColor, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center group py-4", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100 shadow-inner">
      <SliderPrimitive.Range className={cn("absolute h-full bg-gradient-to-r", gradient)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-6 w-6 rounded-full border-2 border-white bg-white shadow-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "group-hover:scale-110 group-hover:shadow-blue-200/50 group-active:scale-95",
        thumbColor || "bg-white"
      )}
    >
       <div className={cn("w-full h-full rounded-full opacity-20", gradient.replace("from-", "bg-"))} />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))
SliderEnhanced.displayName = SliderPrimitive.Root.displayName

export { SliderEnhanced }