import { ImageIcon } from "@paneui/ui/icons"
import { Button } from "@paneui/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardPanel, CardTitle } from "@paneui/ui/components/card"

export default function CardInsetMedia() {
  return (
    <Card variant="inset" className="w-full max-w-sm">
      <CardPanel className="pt-0">
        <div className="flex aspect-video items-center justify-center bg-linear-to-br from-primary/25 to-primary/5 text-primary-text">
          <ImageIcon className="size-6" />
        </div>
        <CardHeader>
          <CardTitle>Kyoto, autumn</CardTitle>
          <CardDescription>48 photos from Nov 12–18.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">Shared with 3 people.</CardContent>
      </CardPanel>
      <CardFooter className="justify-end py-3">
        <Button variant="secondary" size="sm">
          Open album
        </Button>
      </CardFooter>
    </Card>
  )
}
