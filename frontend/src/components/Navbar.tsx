
import { Link, useLocation } from 'react-router-dom'

type NavbarLink = {
  label: string
  path: string
}

type NavbarProps = {
  variant?: 'simple' | 'branded'
  showSignIn?: boolean
  links?: NavbarLink[]
}

function Navbar({
  variant = 'simple',
  showSignIn = false,
  links = [
    { label: 'Home', path: '/' },
    { label: 'Compare Prices', path: '/compare-prices' },
  ],
}: NavbarProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b border-[#E5E1D7] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          {variant === 'branded' ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#286247] text-xl font-bold text-white">
                P
              </div>
              <span className="text-xl font-bold tracking-tight">
                Presyong<span className="text-[#286247]">Bayan</span>
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-[#286247]">
              PresyongBayan
            </span>
          )}
        </Link>

        <nav
          className={
            variant === 'branded'
              ? 'hidden items-center gap-8 text-sm font-medium md:flex'
              : 'flex gap-5 text-sm font-medium'
          }
        >
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={
                isActive(link.path)
                  ? 'text-[#286247]'
                  : 'text-[#68746D] hover:text-[#286247]'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {showSignIn && (
          <Link
            to="/login"
            className="rounded-lg bg-[#286247] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1C4635]"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
