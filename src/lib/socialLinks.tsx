import type { FC, SVGProps } from 'react'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'

const WhatsAppIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.004 2C6.478 2 2 6.477 2 12.004c0 2.258.74 4.382 2.137 6.103L2 22l4.883-1.281A9.963 9.963 0 0 0 12.004 22c5.526 0 10.004-4.478 10.004-10.004 0-5.526-4.478-9.996-10.004-9.996zm0 18.182c-1.381 0-2.72-.333-3.919-.968l-.259-.122-2.507.671.705-2.476-.17-.269A7.993 7.993 0 0 1 4.182 12.004c0-4.536 3.283-8.182 7.822-8.182 4.539 0 7.822 3.646 7.822 8.182s-3.283 8.182-7.822 8.182z"
      fill="currentColor"
    />
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.149-.198.297-.767.967-.94 1.167-.173.198-.347.223-.644.074-.297-.149-1.254-.463-2.39-1.476-.883-.788-1.48-1.761-1.654-2.058-.173-.297-.018-.458.13-.607.134-.133.298-.347.447-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.077-.148-.672-1.613-.92-2.211-.242-.579-.488-.5-.672-.51-.173-.007-.372-.009-.57-.009-.198 0-.52.074-.792.372-.273.298-1.041 1.016-1.041 2.479 0 1.463 1.066 2.875 1.213 3.074.148.198 2.102 3.211 5.077 4.501.71.306 1.26.489 1.689.626.71.226 1.357.194 1.868.118.57-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347z"
      fill="currentColor"
    />
  </svg>
)

export type SocialLink = {
  name: string
  href: string
  labelKey: string
  Icon: FC<SVGProps<SVGSVGElement>>
}

export const CATALOGUS_SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'WhatsApp',
    href: 'https://wa.link/w0z5g3',
    labelKey: 'footer.links.whatsapp',
    Icon: WhatsAppIcon,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/catalogusautores',
    labelKey: 'footer.links.facebookSocial',
    Icon: Facebook,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/catalogus.autores/',
    labelKey: 'footer.links.instagram',
    Icon: Instagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/catalogus/?viewAsMember=true',
    labelKey: 'footer.links.linkedin',
    Icon: Linkedin,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@catalogus1625',
    labelKey: 'footer.links.youtube',
    Icon: Youtube,
  },
]
