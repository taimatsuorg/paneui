import { AppleDark, AppleLight, GitHubDark, GitHubLight, Google } from "@ridemountainpig/svgl-react"

import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"

export default function BrandIconSignInExample() {
  return (
    <div className="flex w-64 flex-col gap-2">
      <Button variant="outline" className="w-full">
        <BrandIcon icon={Google} data-icon="inline-start" />
        Continue with Google
      </Button>
      <Button variant="outline" className="w-full">
        <BrandIcon
          icon={{ light: GitHubLight, dark: GitHubDark }}
          color="current"
          data-icon="inline-start"
        />
        Continue with GitHub
      </Button>
      <Button variant="outline" className="w-full">
        <BrandIcon
          icon={{ light: AppleLight, dark: AppleDark }}
          color="current"
          data-icon="inline-start"
        />
        Continue with Apple
      </Button>
    </div>
  )
}
