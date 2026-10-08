import Link from "next/link";
import type { SVGProps } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "À propos", path: "/about" },
  { name: "Activités", path: "/activities" },
];

const contactItems = [
  { icon: Phone, label: "+243 812 345 678", href: "tel:+243812345678" },
  { icon: Mail, label: "contact@lesaiglesducongo.cd", href: "mailto:contact@lesaiglesducongo.cd" },
  { icon: MapPin, label: "Kinshasa, République Démocratique du Congo", href: undefined },
];

const openingHours = [
  { days: "Lundi – Vendredi", hours: "06:00 – 22:00" },
  { days: "Samedi", hours: "08:00 – 20:00" },
  { days: "Dimanche", hours: "09:00 – 18:00" },
];

const socialLinks = [
  { name: "Facebook", href: "#", Icon: FacebookIcon },
  { name: "Instagram", href: "https://www.instagram.com/fc_lesaiglesducongo/", Icon: InstagramIcon },
  { name: "X (Twitter)", href: "#", Icon: XIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-400">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-primary-600/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/aigles-logo.png" alt="Blason du Football Club Les Aigles du Congo" className="h-11 w-auto shrink-0 object-contain" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold uppercase tracking-[0.14em] text-white">Les Aigles</span>
                <span className="font-display text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#C8A44A]">du Congo</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Football Club Les Aigles du Congo — « Les Samouraïs ». Club
              omnisports fondé le 21 août 2023 à Kinshasa, champion de la
              Linafoot Ligue 1 2024-2025.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500 hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-600/30"
                >
                  <span className="sr-only">{name}</span>
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Navigation
            </h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-300" />
            <ul className="mt-5 space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="group inline-flex items-center gap-1 transition-colors hover:text-white"
                  >
                    {link.name}
                    <ChevronRight className="h-3.5 w-3.5 -translate-x-1 text-primary-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Contact
            </h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-300" />
            <ul className="mt-5 space-y-4 text-sm">
              {contactItems.map(({ icon: ItemIcon, label, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <ItemIcon className="h-4 w-4 text-primary-400" />
                  </span>
                  {href ? (
                    <a href={href} className="pt-1.5 transition-colors hover:text-white">
                      {label}
                    </a>
                  ) : (
                    <span className="pt-1.5">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Horaires
            </h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-300" />
            <ul className="mt-5 space-y-3 text-sm">
              {openingHours.map((slot) => (
                <li
                  key={slot.days}
                  className="flex items-center justify-between gap-4 border-b border-dashed border-white/10 pb-2.5 last:border-0 last:pb-0"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary-400" />
                    {slot.days}
                  </span>
                  <span className="font-medium text-slate-300">{slot.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm">
            &copy; {year}{" "}
            <span className="font-semibold text-slate-300">FC Les Aigles du Congo</span> — Kinshasa, RDC. Tous
            droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="transition-colors hover:text-white">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Confidentialité
            </Link>
            <a
              href="#"
              aria-label="Retour en haut de page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500 hover:bg-primary-600 hover:text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
