import React from 'react';
import { ItemPage } from '../components/item/ItemPage';
import { sampleItem } from '../mocks/data';

export function ItemScreen() {
  return <main className="min-h-screen bg-zinc-50"><ItemPage item={sampleItem} /></main>;
}
