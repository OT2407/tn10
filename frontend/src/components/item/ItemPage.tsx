import React from 'react';
import type { ItemDetail } from '../../types/domain';

interface ItemPageProps {
  item: ItemDetail;
}

export function ItemPage({ item }: ItemPageProps) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
      <div className="space-y-3">
        <img src={item.previewUrls[0]} alt={item.title} className="h-80 w-full rounded-2xl object-cover" />
        <div className="grid grid-cols-2 gap-3">
          {item.previewUrls.slice(1).map((url) => (
            <img key={url} src={url} alt={item.title} className="h-36 w-full rounded-xl object-cover" />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-zinc-500">{item.seller.displayName} · {item.seller.handle}</p>
          <h1 className="text-2xl font-bold text-zinc-900">{item.title}</h1>
          <p className="mt-2 text-zinc-600">{item.description}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4">
          <p className="text-sm font-semibold">Originality</p>
          <p className="mt-1 text-sm text-zinc-700">{item.originalityStatus.replace('_', ' ')}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4">
          <p className="text-sm font-semibold">Metadata</p>
          <pre className="mt-2 overflow-auto text-xs text-zinc-700">{JSON.stringify(item.metadata, null, 2)}</pre>
        </div>

        {item.reviews.length > 0 && (
          <div className="rounded-xl border border-zinc-200 p-4">
            <p className="text-sm font-semibold">Delivered Reviews</p>
            <ul className="mt-2 space-y-2 text-sm text-zinc-700">
              {item.reviews.map((review) => (
                <li key={review.id}>{review.reviewerName} · {review.rating}/5 · {review.comment}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-700">
          Buy for TRY {item.price}
        </button>
      </div>
    </section>
  );
}
