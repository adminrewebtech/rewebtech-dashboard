import { serverApi } from '@/lib/serverApi';
import PageHeader from '@/component/PageHeader';
import ReviewsList from '@/component/ReviewsList';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const data = await serverApi('/reviews');
  const reviews = data?.items ?? [];
  const total = data?.total ?? 0;

  // avgRating API se aata hai aur poore data ka hai — is page ki list par limit
  // lagi hai, isliye usme se average nikalna galat hota. `null` ka matlab koi
  // review hi nahi.
  const avgRating = data?.avgRating ?? null;

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${total} verified review${total === 1 ? '' : 's'} · avg rating ${avgRating ?? '—'}`}
      />
      <ReviewsList reviews={reviews} />
    </div>
  );
}
