import Shell from "./components/Shell";
import { Button } from "./components/ui";

export default function NotFound() {
  return (
    <Shell>
      <div className="wrap flex flex-col items-center py-28 text-center">
        <p className="bg-gradient-to-b from-jade to-transparent bg-clip-text text-[clamp(6rem,22vw,14rem)] font-black leading-none tracking-tighter text-transparent">404</p>
        <h1 className="t-h1 -mt-4 text-ink">This trail doesn&rsquo;t lead anywhere</h1>
        <p className="t-lead mt-4 max-w-md text-ink2">The page you&rsquo;re looking for moved or never existed. Let&rsquo;s get you back on the route.</p>
        <div className="mt-8 flex gap-3">
          <Button href="/" size="lg">Back home</Button>
          <Button href="/packages" variant="outline" size="lg">Browse tours</Button>
        </div>
      </div>
    </Shell>
  );
}
