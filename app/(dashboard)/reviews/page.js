import prisma from '@/lib/prisma';
import PageHeader from '@/component/PageHeader';
import ReviewsList from '@/component/ReviewsList';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} verified review${reviews.length === 1 ? '' : 's'} · avg rating ${avgRating}`}
      />
      <ReviewsList reviews={reviews} />
    </div>
  );
}
