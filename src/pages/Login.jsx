import { Logo, LoginForm } from "../components"

const Login = () => {
  return (
    <section className="container mx-auto">
      <div className="flex">
        <aside className="relative my-16 hidden flex-col justify-between space-y-10 overflow-hidden rounded-2xl bg-primary p-10 shadow-2xl md:w-1/2 lg:flex xl:w-1/3">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-white">
            MilvusMatch.
          </h1>
          <div className="space-y-6">
            <h3 className="text-3xl font-medium leading-[3rem] text-white xl:text-5xl xl:leading-[4rem]">
              Smarter internship allocations.
            </h3>
            <h4 className="text-xl text-gray-300">
              Log in to manage postings, review AI matches and track reservation quotas in real-time.
            </h4>
          </div>
          <div className="py10 flex flex-col justify-between space-y-12 rounded-xl bg-secondary-800 p-4">
            <p className="text-gray-300">
              &ldquo;MilvusMatch helps us shortlist candidates fairly while honoring every inclusion mandate.&rdquo;
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-lg font-semibold text-white">
                AK
              </div>
              <div>
                <h4 className="text-lg text-white">Ahana Kumar</h4>
                <p className="text-gray-400">Software Engineer</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-secondary-900 opacity-40"></div>
        </aside>

        <article className="my-10 flex w-full flex-col items-center space-y-12 md:my-16">
          <div className="flex flex-col items-center space-y-4">
            <Logo className="w-20" />
            <h4 className="text-4xl font-medium">Welcome back</h4>
            <p className="text-sm text-gray-500">Manage applications, quotas and recommendations in one place.</p>
          </div>
          <LoginForm />
        </article>
      </div>
    </section>
  )
}

export default Login

