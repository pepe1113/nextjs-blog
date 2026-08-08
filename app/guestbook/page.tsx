import Guestbook from '@/components/Guestbook'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Guestbook',
  description: '歡迎在這裡留下訊息。',
})

export default function Page() {
  return (
    <SectionContainer>
      <div className="mx-auto max-w-2xl py-12">
        <header className="mb-10 border-b border-gray-200 pb-8 dark:border-gray-700">
          <PageTitle>Guestbook</PageTitle>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            走過路過歡迎留言，Email 選填只用於回覆通知。
          </p>
        </header>
        <Guestbook />
      </div>
    </SectionContainer>
  )
}
