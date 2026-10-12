import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getListPhonesQueryKey, useListPhones } from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, useRoute } from 'wouter';
import { ArrowDown, ArrowDownUp, ArrowLeft, ArrowRight, Check, Heart, Menu, Moon, Plus, Search, SlidersHorizontal, Smartphone, Sparkles, Sun, X } from 'lucide-react';
import NotFound from '@/pages/not-found';

type Phone = {
  id: string; brand: string; model: string; image: string; price: number; rating: number; releaseYear: number;
  color: string; display: string; processor: string; ram: string; storage: string; cameras: string;
  battery: string; charging: string; os: string; '5g': boolean;
};
const money = (price: number) => '$' + price.toLocaleString('en-US');
const PhoneCatalogContext = createContext<Phone[]>([]);
const usePhoneCatalog = () => useContext(PhoneCatalogContext);
const queryClient = new QueryClient();
const readList = (key: string): string[] => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as string[] : []; } catch { return []; }
};

function DeviceImage({ phone, className = '' }: { phone: Phone; className?: string }) {
  const [broken, setBroken] = useState(false);
  return <div className={`phone-image-wrap flex items-center justify-center ${className}`}>
    {!broken && phone.image ? <img className="phone-image max-h-full max-w-full object-contain" src={phone.image} alt={`${phone.model} in ${phone.color}`} onError={() => setBroken(true)} /> :
      <div className="relative flex h-44 w-24 items-center justify-center rounded-[1.5rem] border-[5px] border-foreground/20 bg-gradient-to-br from-secondary via-card to-muted shadow-xl">
        <div className="absolute left-1/2 top-2 h-1 w-7 -translate-x-1/2 rounded-full bg-foreground/25" />
        <Smartphone size={44} strokeWidth={1.1} className="text-foreground/25" />
      </div>}
  </div>;
}

function PhoneCard({ phone, favorite, compared, onFavorite, onCompare, compact = false }: {
  phone: Phone; favorite: boolean; compared: boolean; onFavorite: () => void; onCompare: () => void; compact?: boolean;
}) {
  return <article className={`phone-card group relative flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card ${compact ? 'min-w-[255px]' : ''}`} data-testid={`card-phone-${phone.id}`}>
    <div className="relative h-52 overflow-hidden">
      <Link href={`/phones/${phone.id}`} className="absolute inset-0" aria-label={`View ${phone.model}`} data-testid={`link-phone-${phone.id}`}>
        <DeviceImage phone={phone} className="h-full w-full p-5" />
      </Link>
      <span className="absolute left-4 top-4 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground backdrop-blur">{phone.brand}</span>
      <button type="button" onClick={onFavorite} aria-label={favorite ? `Remove ${phone.model} from favorites` : `Save ${phone.model} to favorites`} aria-pressed={favorite} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border transition hover:scale-105 ${favorite ? 'border-primary/20 bg-primary text-primary-foreground' : 'border-border bg-background/90 text-foreground'}`} data-testid={`button-favorite-${phone.id}`}>
        <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
      </button>
      <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur">
        <span className="text-primary">★</span>{phone.rating.toFixed(1)}
      </span>
    </div>
    <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
      <Link href={`/phones/${phone.id}`} className="text-lg font-extrabold tracking-[-.04em] text-foreground hover:text-primary" data-testid={`link-model-${phone.id}`}>{phone.model}</Link>
      <p className="mt-1 text-xs text-muted-foreground">{phone.display.split(',')[0]} <span className="mx-1.5 text-border">·</span>{phone.ram} RAM</p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-5">
        <div><span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">From</span><p className="display-font text-xl font-bold">{money(phone.price)}</p></div>
        <button type="button" onClick={onCompare} aria-pressed={compared} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${compared ? 'bg-secondary text-secondary-foreground' : 'border border-border text-foreground hover:border-primary hover:text-primary'}`} data-testid={`button-compare-${phone.id}`}>
          {compared ? <Check size={14} /> : <Plus size={14} />}{compared ? 'Added' : 'Compare'}
        </button>
      </div>
    </div>
  </article>;
}

function Header({ favoritesCount, compareCount, dark, toggleTheme }: { favoritesCount: number; compareCount: number; dark: boolean; toggleTheme: () => void }) {
  const [path] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [{ href: '/', label: 'Home' }, { href: '/explore', label: 'Explore' }, { href: '/compare', label: 'Compare', count: compareCount }, { href: '/favorites', label: 'Saved', count: favoritesCount }];
  return <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Smartphone size={19} strokeWidth={2.5} /></span>
        <span className="display-font text-[19px] font-bold tracking-[-.07em]">phone<span className="text-primary">compare</span></span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
        {nav.map((item) => <Link key={item.href} href={item.href} aria-current={path === item.href ? 'page' : undefined} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${path === item.href ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid={`nav-${item.label.toLowerCase()}`}>
          {item.label}{item.count ? <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{item.count}</span> : null}
        </Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition hover:bg-muted" data-testid="button-theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden" data-testid="button-mobile-menu">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
    </div>
    {mobileOpen && <nav className="absolute inset-x-0 top-full border-b border-border bg-background px-5 pb-4 pt-2 shadow-lg md:hidden" aria-label="Mobile navigation">
      {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${path === item.href ? 'bg-secondary text-secondary-foreground' : ''}`} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>{item.label}{item.count ? <span className="mono text-xs">{item.count}</span> : null}</Link>)}
    </nav>}
  </header>;
}

function SectionTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mono mb-2 text-[10px] font-medium uppercase tracking-[.2em] text-primary">{eyebrow}</p><h2 className="display-font text-3xl font-bold tracking-[-.06em] sm:text-4xl">{title}</h2>{detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}</div>{action}</div>;
}

function HomePage({ favoriteIds, comparedIds, toggleFavorite, toggleCompare }: { favoriteIds: string[]; comparedIds: string[]; toggleFavorite: (id: string) => void; toggleCompare: (id: string) => void }) {
  const phones = usePhoneCatalog();
  const featured = [phones[2], phones[0], phones[6], phones[5]].filter((phone): phone is Phone => Boolean(phone));
  return <main className="page-enter pb-24 md:pb-16">
    <section className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#e9e5d7] px-6 py-10 dark:bg-[#272f2c] sm:px-12 sm:py-14 lg:px-[4.7rem]">
        <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-primary/20 sm:right-[5%] sm:top-[-7rem] sm:h-[34rem] sm:w-[34rem]" />
        <div className="absolute right-[8%] top-[12%] hidden h-64 w-64 rounded-full border border-primary/15 sm:block" />
        <div className="relative z-10 max-w-[640px]">
          <p className="mono mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-primary"><Sparkles size={14} />A clearer way to choose</p>
          <h1 className="display-font max-w-[600px] text-[3.35rem] font-bold leading-[.99] tracking-[-.075em] sm:text-7xl">The right phone.<br /><span className="text-primary">No guesswork.</span></h1>
          <p className="mt-6 max-w-[430px] text-base leading-7 text-foreground/70 sm:text-lg">Good decisions start with the details. Find your next phone by what matters to you—not by the noise.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground transition hover:-translate-y-0.5" data-testid="link-explore-hero">Explore phones <ArrowRight size={16} /></Link>
            <Link href="/compare" className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3.5 text-sm font-bold transition hover:bg-background/70" data-testid="link-compare-hero">Compare side by side <ArrowDown size={15} /></Link>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-[-12%] right-[5%] hidden h-[92%] w-[34%] items-end justify-center gap-[-20px] md:flex">
          <div className="absolute bottom-0 right-4 h-64 w-36 rotate-[14deg] rounded-[2.2rem] border-[8px] border-[#303a3e] bg-gradient-to-br from-[#b7c9c2] to-[#43534f] shadow-2xl" />
          <div className="absolute bottom-[-14px] right-[155px] h-72 w-40 rotate-[-9deg] rounded-[2.5rem] border-[8px] border-[#303a3e] bg-gradient-to-br from-[#db967c] to-[#493d43] shadow-2xl" />
          <div className="absolute bottom-[5px] right-[295px] h-60 w-32 rotate-[-19deg] rounded-[2rem] border-[7px] border-[#303a3e] bg-gradient-to-br from-[#a2adb8] to-[#445265] shadow-2xl" />
        </div>
        <div className="relative z-10 mt-9 flex items-center gap-4 border-t border-foreground/10 pt-5 text-xs sm:max-w-[470px]">
          <span className="mono text-primary">01 / 03</span><span className="h-px flex-1 bg-foreground/15" /><span className="text-muted-foreground">Independent specs. Better choices.</span>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 sm:px-8">
      <SectionTitle eyebrow="A few worth a look" title="Popular right now" detail="A handpicked starting point, across sizes and budgets." action={<Link href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3" data-testid="link-all-phones">All phones <ArrowRight size={16} /></Link>} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((phone) => <PhoneCard key={phone.id} phone={phone} favorite={favoriteIds.includes(phone.id)} compared={comparedIds.includes(phone.id)} onFavorite={() => toggleFavorite(phone.id)} onCompare={() => toggleCompare(phone.id)} />)}</div>
    </section>
    <section className="mx-auto mt-20 max-w-[1240px] px-5 sm:px-8">
      <div className="grid gap-8 rounded-[1.75rem] bg-[#dce8e2] p-7 dark:bg-[#233632] sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
        <div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-secondary-foreground">Make the trade-offs visible</p><h2 className="display-font text-3xl font-bold tracking-[-.06em] sm:text-4xl">Two phones. One good decision.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-foreground/70">Put the specs that matter next to each other. The differences get a lot easier to see.</p></div>
        <Link href="/compare" className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:-translate-y-0.5" data-testid="link-compare-prompt">Start comparing <ArrowRight size={16} /></Link>
      </div>
    </section>
  </main>;
}

function FilterPanel({ brand, setBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating, only5g, setOnly5g, clear }: {
  brand: string; setBrand: (v: string) => void; minPrice: string; setMinPrice: (v: string) => void; maxPrice: string; setMaxPrice: (v: string) => void; minRating: string; setMinRating: (v: string) => void; only5g: boolean; setOnly5g: (v: boolean) => void; clear: () => void;
}) {
  const phones = usePhoneCatalog();
  const brands = [...new Set(phones.map((phone) => phone.brand))].sort();
  const fieldClass = 'mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary';
  return <aside className="rounded-2xl border border-card-border bg-card p-4 sm:p-5" aria-label="Catalog filters">
    <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-extrabold"><SlidersHorizontal size={16} className="text-primary" />Filters</h2><button type="button" onClick={clear} className="text-xs font-bold text-primary hover:underline" data-testid="button-clear-filters">Reset</button></div>
    <label className="mt-5 block text-xs font-bold">Brand<select className={fieldClass} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Filter by brand" data-testid="select-brand"><option value="">All brands</option>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</select></label>
    <div className="mt-5"><span className="text-xs font-bold">Price range</span><div className="mt-2 grid grid-cols-2 gap-2"><label className="sr-only" htmlFor="min-price">Minimum price</label><input id="min-price" type="number" min="0" placeholder="$ Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={fieldClass + ' mt-0'} data-testid="input-min-price" /><label className="sr-only" htmlFor="max-price">Maximum price</label><input id="max-price" type="number" min="0" placeholder="$ Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={fieldClass + ' mt-0'} data-testid="input-max-price" /></div></div>
    <label className="mt-5 block text-xs font-bold">Minimum rating<select className={fieldClass} value={minRating} onChange={(e) => setMinRating(e.target.value)} aria-label="Filter by minimum rating" data-testid="select-rating"><option value="">Any rating</option><option value="4">4.0 and up</option><option value="4.5">4.5 and up</option></select></label>
    <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl bg-muted/70 px-3 py-3 text-sm font-semibold"><span>5G capable</span><input type="checkbox" checked={only5g} onChange={(e) => setOnly5g(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" aria-label="Show only 5G phones" data-testid="checkbox-5g" /></label>
  </aside>;
}

function ExplorePage({ favoriteIds, comparedIds, toggleFavorite, toggleCompare }: { favoriteIds: string[]; comparedIds: string[]; toggleFavorite: (id: string) => void; toggleCompare: (id: string) => void }) {
  const phones = usePhoneCatalog();
  const [query, setQuery] = useState(''); const [brand, setBrand] = useState(''); const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState(''); const [minRating, setMinRating] = useState(''); const [only5g, setOnly5g] = useState(false); const [sort, setSort] = useState('recommended');
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const result = phones.filter((p) => (!text || `${p.brand} ${p.model} ${p.processor}`.toLowerCase().includes(text)) && (!brand || p.brand === brand) && (!minPrice || p.price >= Number(minPrice)) && (!maxPrice || p.price <= Number(maxPrice)) && (!minRating || p.rating >= Number(minRating)) && (!only5g || p['5g']));
    return result.sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : b.releaseYear - a.releaseYear);
  }, [query, brand, minPrice, maxPrice, minRating, only5g, sort]);
  const clear = () => { setBrand(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); setOnly5g(false); setQuery(''); };
  return <main className="page-enter mx-auto max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14 md:pb-16">
    <div className="mb-8 max-w-2xl"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">The whole shortlist</p><h1 className="display-font text-4xl font-bold tracking-[-.07em] sm:text-6xl">Find your fit.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Browse the details, narrow the field, and keep the phones you want to come back to.</p></div>
    <label className="mb-6 flex h-14 items-center gap-3 rounded-2xl border border-card-border bg-card px-4 shadow-sm focus-within:border-primary"><Search size={19} className="shrink-0 text-primary" /><span className="sr-only">Search phones</span><input type="search" placeholder="Search by model, brand, or processor…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" data-testid="input-search" /><span className="mono hidden text-[10px] text-muted-foreground sm:block">{filtered.length} RESULTS</span></label>
    <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
      <FilterPanel brand={brand} setBrand={setBrand} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} minRating={minRating} setMinRating={setMinRating} only5g={only5g} setOnly5g={setOnly5g} clear={clear} />
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> phones to explore</p>
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ArrowDownUp size={14} />Sort by<select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-input bg-card px-2.5 py-2 text-xs font-bold text-foreground outline-none" aria-label="Sort phones" data-testid="select-sort"><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label>
        </div>
        {filtered.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((phone) => <PhoneCard key={phone.id} phone={phone} favorite={favoriteIds.includes(phone.id)} compared={comparedIds.includes(phone.id)} onFavorite={() => toggleFavorite(phone.id)} onCompare={() => toggleCompare(phone.id)} />)}</div> :
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 text-center"><span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Search size={20} /></span><h2 className="display-font text-xl font-bold">No phones match those filters</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or clear a filter to widen the field.</p><button onClick={clear} className="mt-5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="button-empty-reset">Clear filters</button></div>}
      </section>
    </div>
  </main>;
}

function EmptyState({ title, detail, linkText, href }: { title: string; detail: string; linkText: string; href: string }) {
  return <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-border bg-card/60 px-6 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Heart size={22} /></span><h2 className="display-font mt-5 text-2xl font-bold tracking-[-.04em]">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-empty-explore">{linkText}<ArrowRight size={15} /></Link></div>;
}

function FavoritesPage({ favoriteIds, comparedIds, toggleFavorite, toggleCompare }: { favoriteIds: string[]; comparedIds: string[]; toggleFavorite: (id: string) => void; toggleCompare: (id: string) => void }) {
  const phones = usePhoneCatalog();
  const saved = phones.filter((phone) => favoriteIds.includes(phone.id));
  return <main className="page-enter mx-auto max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14 md:pb-16"><div className="mb-8"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">Your shortlist</p><h1 className="display-font text-4xl font-bold tracking-[-.07em] sm:text-6xl">Saved phones<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">{saved.length} {saved.length === 1 ? 'phone' : 'phones'} saved on this device.</p></div>
    {saved.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{saved.map((phone) => <PhoneCard key={phone.id} phone={phone} favorite compared={comparedIds.includes(phone.id)} onFavorite={() => toggleFavorite(phone.id)} onCompare={() => toggleCompare(phone.id)} />)}</div> : <EmptyState title="Nothing saved. Yet." detail="Tap the heart on a phone that catches your eye. Your shortlist stays right here on this device." linkText="Explore phones" href="/explore" />}
  </main>;
}

const specRows: { label: string; key: keyof Phone }[] = [
  { label: 'Price', key: 'price' }, { label: 'Rating', key: 'rating' }, { label: 'Released', key: 'releaseYear' }, { label: 'Color', key: 'color' },
  { label: 'Display', key: 'display' }, { label: 'Processor', key: 'processor' }, { label: 'Memory', key: 'ram' }, { label: 'Storage', key: 'storage' },
  { label: 'Cameras', key: 'cameras' }, { label: 'Battery', key: 'battery' }, { label: 'Charging', key: 'charging' }, { label: 'Operating system', key: 'os' }, { label: '5G', key: '5g' },
];
function specValue(phone: Phone, key: keyof Phone) {
  const value = phone[key];
  if (key === 'price') return money(value as number);
  if (key === 'rating') return `${(value as number).toFixed(1)} / 5`;
  if (key === '5g') return value ? 'Yes' : 'No';
  return String(value);
}
function DetailPage({ favoriteIds, comparedIds, toggleFavorite, toggleCompare }: { favoriteIds: string[]; comparedIds: string[]; toggleFavorite: (id: string) => void; toggleCompare: (id: string) => void }) {
  const phones = usePhoneCatalog();
  const [, params] = useRoute('/phones/:id'); const phone = params ? phones.find((item) => item.id === params.id) : undefined;
  if (!phone) return <main className="mx-auto max-w-4xl px-5 py-20"><EmptyState title="Phone not found" detail="That device isn't in this catalog. Browse the available phones instead." linkText="Browse catalog" href="/explore" /></main>;
  const specs = specRows.slice(4);
  return <main className="page-enter mx-auto max-w-[1120px] px-5 pb-24 pt-7 sm:px-8 sm:pt-10 md:pb-16">
    <Link href="/explore" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary" data-testid="link-back-explore"><ArrowLeft size={16} />Back to phones</Link>
    <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.8rem] bg-[#e8e6dc] p-10 dark:bg-[#2a3333] sm:min-h-[470px]">
        <div className="absolute left-8 top-8 mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">{phone.brand} / {phone.releaseYear}</div>
        <DeviceImage phone={phone} className="h-[340px] w-full sm:h-[420px]" />
      </div>
      <section className="flex flex-col justify-center py-2">
        <p className="mono text-[10px] uppercase tracking-[.2em] text-primary">{phone.brand} · {phone.color}</p>
        <h1 className="display-font mt-3 text-4xl font-bold leading-[1.03] tracking-[-.07em] sm:text-6xl">{phone.model}</h1>
        <div className="mt-5 flex items-center gap-3"><span className="display-font text-3xl font-bold">{money(phone.price)}</span><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">★ {phone.rating.toFixed(1)} / 5</span></div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">A closer look at the specs, strengths, and details that make the {phone.model} what it is.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => toggleFavorite(phone.id)} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${favoriteIds.includes(phone.id) ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary hover:text-primary'}`} data-testid="button-detail-favorite"><Heart size={16} fill={favoriteIds.includes(phone.id) ? 'currentColor' : 'none'} />{favoriteIds.includes(phone.id) ? 'Saved' : 'Save phone'}</button>
          <button type="button" onClick={() => toggleCompare(phone.id)} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${comparedIds.includes(phone.id) ? 'bg-secondary text-secondary-foreground' : 'border border-border hover:border-primary hover:text-primary'}`} data-testid="button-detail-compare">{comparedIds.includes(phone.id) ? <Check size={16} /> : <Plus size={16} />}{comparedIds.includes(phone.id) ? 'In comparison' : 'Add to compare'}</button>
        </div>
      </section>
    </div>
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between"><div><p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-primary">All the useful bits</p><h2 className="display-font text-3xl font-bold tracking-[-.06em]">Specifications</h2></div><span className="mono text-xs text-muted-foreground">{phone.releaseYear}</span></div>
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
        <div className="grid grid-cols-[120px_1fr] border-b border-border bg-muted/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground sm:grid-cols-[190px_1fr] sm:px-6"><span>Specification</span><span>Details</span></div>
        {specs.map((row, i) => <div key={row.key} className={`grid grid-cols-[120px_1fr] gap-3 px-4 py-4 text-sm sm:grid-cols-[190px_1fr] sm:px-6 ${i < specs.length - 1 ? 'border-b border-border/70' : ''}`}><span className="font-bold text-muted-foreground">{row.label}</span><span className="font-semibold leading-6">{specValue(phone, row.key)}</span></div>)}
      </div>
    </section>
  </main>;
}

function ComparePage({ comparedIds, toggleCompare, setComparedIds }: { comparedIds: string[]; toggleCompare: (id: string) => void; setComparedIds: (ids: string[]) => void }) {
  const phones = usePhoneCatalog();
  const compared = comparedIds.map((id) => phones.find((p) => p.id === id)).filter((p): p is Phone => Boolean(p));
  const choices = phones.filter((p) => !comparedIds.includes(p.id));
  const [picker, setPicker] = useState('');
  const addPhone = (id: string) => { if (id && comparedIds.length < 4 && !comparedIds.includes(id)) setComparedIds([...comparedIds, id]); setPicker(''); };
  return <main className="page-enter mx-auto max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14 md:pb-16">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-primary">The details, together</p><h1 className="display-font text-4xl font-bold tracking-[-.07em] sm:text-6xl">Compare phones<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Choose 2–4 phones. Differences worth noticing rise to the surface.</p></div><span className="mono rounded-full bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground">{compared.length} / 4 SELECTED</span></div>
    <div className="mb-6 flex flex-wrap gap-3">
      <label className="sr-only" htmlFor="add-comparison">Add a phone to compare</label>
      <select id="add-comparison" value={picker} onChange={(e) => addPhone(e.target.value)} disabled={compared.length >= 4 || choices.length === 0} className="min-w-[220px] rounded-full border border-input bg-card px-4 py-3 text-sm font-bold outline-none focus:border-primary disabled:opacity-50" data-testid="select-add-compare"><option value="">Add a phone to compare…</option>{choices.map((p) => <option key={p.id} value={p.id}>{p.brand} {p.model}</option>)}</select>
      {compared.length > 0 && <button type="button" onClick={() => setComparedIds([])} className="rounded-full border border-border px-4 py-3 text-sm font-bold text-muted-foreground hover:text-primary" data-testid="button-clear-compare">Clear all</button>}
    </div>
    {compared.length === 0 ? <EmptyState title="Your comparison starts here." detail="Add phones from the catalog or choose one above. We'll line up every spec for you." linkText="Browse phones" href="/explore" /> : <>
      <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
        <div className="min-w-[620px]" style={{ gridTemplateColumns: `150px repeat(${Math.max(compared.length, 1)}, minmax(190px, 1fr))` }}>
          <div className="grid" style={{ gridTemplateColumns: `150px repeat(${Math.max(compared.length, 1)}, minmax(190px, 1fr))` }}>
            <div className="border-b border-r border-border bg-muted/60 p-4"><span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">Your options</span></div>
            {compared.map((phone) => <div key={phone.id} className="relative border-b border-r border-border p-4">
              <button type="button" onClick={() => toggleCompare(phone.id)} aria-label={`Remove ${phone.model} from comparison`} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground" data-testid={`button-remove-compare-${phone.id}`}><X size={15} /></button>
              <Link href={`/phones/${phone.id}`} className="block" data-testid={`compare-link-${phone.id}`}><DeviceImage phone={phone} className="h-36 w-full p-3" /><p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary">{phone.brand}</p><h2 className="display-font mt-1 pr-6 text-lg font-bold leading-tight">{phone.model}</h2><p className="mt-2 display-font text-xl font-bold">{money(phone.price)}</p></Link>
            </div>)}
          </div>
          {specRows.map((row) => {
            const values = compared.map((phone) => specValue(phone, row.key));
            const distinct = new Set(values).size > 1;
            return <div key={row.key} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `150px repeat(${Math.max(compared.length, 1)}, minmax(190px, 1fr))` }}>
              <div className="flex items-center border-r border-border bg-muted/60 px-4 py-3 text-xs font-bold text-muted-foreground">{row.label}</div>
              {compared.map((phone, i) => <div key={phone.id} className={`flex items-center border-r border-border px-4 py-3 text-sm leading-5 ${distinct ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{values[i]}</div>)}
            </div>;
          })}
        </div>
      </div>
      {compared.length < 2 && <p className="mt-4 text-center text-xs text-muted-foreground">Add one more phone to see the differences side by side.</p>}
    </>}
  </main>;
}

function CatalogMessage({ title, detail, retry }: { title: string; detail: string; retry?: () => void }) {
  return <main className="page-enter mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Smartphone size={24} /></span>
    <h1 className="display-font text-3xl font-bold tracking-[-.06em]">{title}</h1>
    <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{detail}</p>
    {retry && <button type="button" onClick={retry} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Try again</button>}
  </main>;
}

function AppContent() {
  const { data: catalog, isLoading, isError, refetch } = useListPhones({ query: { queryKey: getListPhonesQueryKey(), retry: 1 } });
  const phones = catalog ?? [];
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readList('phonecompare:favorites'));
  const [comparedIds, updateComparedIds] = useState<string[]>(() => readList('phonecompare:compare').slice(0, 4));
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('phonecompare:theme') === 'dark'; } catch { return false; } });
  useEffect(() => { localStorage.setItem('phonecompare:favorites', JSON.stringify(favoriteIds)); }, [favoriteIds]);
  useEffect(() => { localStorage.setItem('phonecompare:compare', JSON.stringify(comparedIds)); }, [comparedIds]);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('phonecompare:theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    if (!catalog) return;
    const catalogIds = new Set(catalog.map((phone) => phone.id));
    setFavoriteIds((current) => current.filter((id) => catalogIds.has(id)));
    updateComparedIds((current) => current.filter((id) => catalogIds.has(id)).slice(0, 4));
  }, [catalog]);
  const toggleFavorite = (id: string) => setFavoriteIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleCompare = (id: string) => updateComparedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  const setComparedIds = (ids: string[]) => updateComparedIds(ids.slice(0, 4));
  const shared = { favoriteIds, comparedIds, toggleFavorite, toggleCompare };
  return <PhoneCatalogContext.Provider value={phones}>
    <div className="noise min-h-[100dvh] bg-background text-foreground">
      <Header favoritesCount={favoriteIds.length} compareCount={comparedIds.length} dark={dark} toggleTheme={() => setDark((value) => !value)} />
      {isLoading ? <CatalogMessage title="Loading the catalog…" detail="Getting the latest phone details from Supabase." /> :
        isError ? <CatalogMessage title="Phone catalog unavailable." detail="Check that the Supabase phone table is set up, then try again." retry={() => { void refetch(); }} /> :
          <Switch>
            <Route path="/" component={() => <HomePage {...shared} />} />
            <Route path="/explore" component={() => <ExplorePage {...shared} />} />
            <Route path="/favorites" component={() => <FavoritesPage {...shared} />} />
            <Route path="/compare" component={() => <ComparePage comparedIds={comparedIds} toggleCompare={toggleCompare} setComparedIds={setComparedIds} />} />
            <Route path="/phones/:id" component={() => <DetailPage {...shared} />} />
            <Route component={NotFound} />
          </Switch>}
      <footer className="border-t border-border py-7"><div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:px-8"><Link href="/" className="display-font font-bold tracking-[-.04em] text-foreground">phone<span className="text-primary">compare</span></Link><span>Specs, side by side. Your call, better informed.</span><span className="mono">SUPABASE CATALOG · {phones.length} DEVICES</span></div></footer>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden" aria-label="Quick navigation">
        {[{href:'/',label:'Home',icon:Smartphone},{href:'/explore',label:'Explore',icon:Search},{href:'/compare',label:'Compare',icon:ArrowDownUp},{href:'/favorites',label:'Saved',icon:Heart}].map((item) => <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-1 text-[10px] font-bold text-muted-foreground" data-testid={`bottom-${item.label.toLowerCase()}`}><item.icon size={18} />{item.label}</Link>)}
      </nav>
    </div>
  </PhoneCatalogContext.Provider>;
}

function App() {
  return <QueryClientProvider client={queryClient}><AppContent /></QueryClientProvider>;
}

export default App;
