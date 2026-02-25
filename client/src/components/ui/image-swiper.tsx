import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageSwiperProps = {
  images: string[]
  alt?: string
  selectedIndex?: number
  onIndexChange?: (idx: number) => void
  showThumbnails?: boolean
  badgeDiscount?: number | null
  isFeatured?: boolean
}

export default function ImageSwiper({
  images,
  alt = "",
  selectedIndex = 0,
  onIndexChange,
  showThumbnails = true,
  badgeDiscount,
  isFeatured,
}: ImageSwiperProps) {
  const [api, setApi] = React.useState<CarouselApi | undefined>()

  React.useEffect(() => {
    if (!api) return
    api.scrollTo(selectedIndex)
  }, [api, selectedIndex])

  React.useEffect(() => {
    if (!api || !onIndexChange) return
    const handleSelect = () => {
      try {
        const idx = api.selectedScrollSnap()
        onIndexChange(idx)
      } catch (e) {
        // ignore
      }
    }

    api.on("select", handleSelect)
    return () => {
      api.off("select", handleSelect)
    }
  }, [api, onIndexChange])

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden relative w-full">
        <Carousel setApi={(a) => setApi(a)} className="w-full">
          <CarouselContent className="w-full">
            {images.map((src, i) => (
              <CarouselItem key={i} className="w-full">
                {src ? (
                  <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
            <div className="w-full flex justify-center">
                <CarouselPrevious variant="secondary" />
                <CarouselNext variant="secondary" />
            </div>
        </Carousel>

        {badgeDiscount && badgeDiscount > 0 && (
          <Badge variant="destructive" className="absolute top-4 left-4 text-md px-2 py-1">
            -{badgeDiscount}% OFF
          </Badge>
        )}

        {isFeatured && (
          <Badge className="absolute top-4 right-4">Featured</Badge>
        )}
      </div>

      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "aspect-square rounded-sm overflow-hidden border-2 w-10 h-10 transition-colors",
                selectedIndex === index ? "border-primary" : "border-transparent"
              )}
            >
              {src ? (
                <img src={src} alt={`${alt} ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
