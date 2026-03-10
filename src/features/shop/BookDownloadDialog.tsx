import { NewsletterSignupForm } from '@/components/newsletter/NewsletterSignupForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type BookDownloadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  error: string | null
  bookId?: string
}

export function BookDownloadDialog({ open, onOpenChange, title, body, error, bookId }: BookDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <NewsletterSignupForm bookId={bookId} />
      </DialogContent>
    </Dialog>
  )
}
