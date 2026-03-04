export type OriginalityStatus = 'SELF_DECLARED' | 'VERIFIED' | 'FLAGGED';
export type ExploreMode = 'FOR_YOU' | 'FOLLOWING' | 'TRENDING' | 'NEWEST';

export interface Designer {
  id: string;
  displayName: string;
  handle: string;
  verified: boolean;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  specialties: string[];
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  title: string;
  coverUrl: string;
  category: string;
  tags: string[];
  likes: number;
  saves: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  hasCollab: boolean;
  isVerified: boolean;
  price: number;
  currency: 'TRY';
  seller: Designer;
  createdAt?: string;
  _ranking?: LayerBreakdown;
}

export interface LayerBreakdown {
  personalizationLayer: number;
  engagementQualityLayer: number;
  freshnessLayer: number;
  creatorGrowthLayer: number;
  emergingBoost: number;
  explorationNoise: number;
  preferenceBoost: number;
  sessionBoost: number;
  diversityPenalty?: number;
  totalScore: number;
}

export interface ItemDetail extends FeedItem {
  description: string;
  previewUrls: string[];
  deliveryType: string;
  metadata: Record<string, string | number | boolean | Record<string, unknown>>;
  originalityStatus: OriginalityStatus;
  reviews: Review[];
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  status: 'PENDING' | 'RELEASED';
}

export interface ContractViewModel {
  id: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  freezeState: 'STABLE' | 'UPDATED' | 'LOCKED';
  monitoringEnabled: boolean;
  milestones: Milestone[];
  activityLog: string[];
  files: string[];
}

export interface CollaborationMember {
  id: string;
  name: string;
  role: string;
  percentage: number;
}

export interface DesignerProfile {
  designer: Designer;
  portfolio: FeedItem[];
  collaborations: Array<{ id: string; title: string; role: string }>;
  followsMe?: boolean;
}
