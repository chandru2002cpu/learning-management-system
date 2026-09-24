function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto] lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-950">LumaLearn</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
            A better way to find expert guidance, build confidence, and keep
            learning.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Explore</p>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <a href="/" className="block hover:text-indigo-600">
              Home
            </a>
            <a href="/student/tutors" className="block hover:text-indigo-600">
              Find tutors
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Account</p>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <a href="/login" className="block hover:text-indigo-600">
              Login
            </a>
            <a href="/register" className="block hover:text-indigo-600">
              Create account
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-400 sm:px-6">
        © {year} LumaLearn. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
