export function NewsletterSection() {
  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
              Subscreva a nossa newsletter!
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              Receba actualizações mensais da plataforma Catalogus.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <iframe
              src="https://catalogusautores.substack.com/embed"
              className="h-40 w-full border border-gray-200 bg-white lg:w-96"
              title="Substack newsletter subscription"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
