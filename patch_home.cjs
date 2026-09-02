const fs = require('fs');

let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

c = c.replace(
  'const [featured, setFeatured] = useState<BookCardData[]>([]);',
  'const [featured, setFeatured] = useState<BookCardData[]>([]);\n  const [staffPicks, setStaffPicks] = useState<BookCardData[]>([]);\n  const [trending, setTrending] = useState<BookCardData[]>([]);'
);

c = c.replace(
  'const [booksRes, langsRes, catsRes] = await Promise.all([',
  'const [booksRes, staffRes, trendingRes, langsRes, catsRes] = await Promise.all(['
);

c = c.replace(
  'pb.collection("books").getList(1, 12, { filter: "is_published=true", sort: "-sales_count" }),',
  'pb.collection("books").getList(1, 12, { filter: "is_published=true", sort: "-sales_count" }),\n          pb.collection("books").getList(1, 12, { filter: "is_published=true && is_staff_pick=true", sort: "-created" }),\n          pb.collection("trending_books").getList(1, 12, { expand: "book" }),'
);

c = c.replace(
  'setFeatured(booksRes.items as unknown as BookCardData[]);',
  'setFeatured(booksRes.items as unknown as BookCardData[]);\n        setStaffPicks(staffRes.items as unknown as BookCardData[]);\n        setTrending(trendingRes.items.map(t => t.expand?.book).filter(Boolean) as unknown as BookCardData[]);'
);

const newShelves = 
      {/* Staff Picks shelf */}
      <section className="theme-retro py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 border-t-[3px] border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-comic text-4xl tracking-wide">Staff Picks</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Curated favorites from our team</p>
          </div>
        </div>
        {staffPicks.length === 0 ? (
          <div className="border-[3px] border-dashed border-border rounded-lg bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">No staff picks yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {staffPicks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>

      {/* Trending shelf */}
      <section className="theme-retro py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 border-t-[3px] border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-comic text-4xl tracking-wide">Trending Now</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Hot reads from the last 30 days</p>
          </div>
        </div>
        {trending.length === 0 ? (
          <div className="border-[3px] border-dashed border-border rounded-lg bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">Trending data unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>
;

c = c.replace(
  '{/* Categories & Languages */}',
  newShelves + '\n      {/* Categories & Languages */}'
);

fs.writeFileSync('src/pages/Home.tsx', c);
console.log('patched Home.tsx');
