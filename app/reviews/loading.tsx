import { ReviewLoadingCard } from '@/components/card/ReviewLoadingCard';

export default function Loading() {
  return (
    <section className="grid md:grid-cols-2 gap-8 mt-4 ">
      <ReviewLoadingCard />
      <ReviewLoadingCard />
    </section>
  );
}