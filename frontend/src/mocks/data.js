"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleMembers = exports.sampleContract = exports.sampleItem = exports.feedItems = exports.tags = void 0;
exports.tags = ['3D', 'Typography', 'Streetwear', 'Synth', 'Photo'];
exports.feedItems = [
    {
        id: 'itm_aurora_pack',
        title: 'Aurora Motion Pack',
        coverUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1400&q=80',
        category: 'motion',
        tags: ['3D', 'Synth'],
        likes: 128,
        saves: 36,
        hasCollab: true,
        isVerified: true,
        price: 1200,
        currency: 'TRY',
        seller: {
            id: 'usr_nora',
            displayName: 'Nora Aydin',
            handle: '@noraforms',
            verified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
        },
    },
    {
        id: 'itm_mono_poster',
        title: 'Mono Grid Poster Set',
        coverUrl: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?auto=format&fit=crop&w=1400&q=80',
        category: 'print',
        tags: ['Typography', 'Streetwear'],
        likes: 92,
        saves: 18,
        hasCollab: false,
        isVerified: false,
        price: 640,
        currency: 'TRY',
        seller: {
            id: 'usr_mert',
            displayName: 'Mert Koc',
            handle: '@mertgrid',
            verified: false,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
        },
    },
];
exports.sampleItem = {
    ...exports.feedItems[0],
    description: 'A premium motion toolkit including transitions, overlays, and render presets tuned for social campaigns.',
    previewUrls: [exports.feedItems[0].coverUrl, 'https://images.unsplash.com/photo-1518300679707-30e8d4d9d2a5?auto=format&fit=crop&w=1400&q=80'],
    deliveryType: 'instant-download',
    metadata: {
        format: 'MP4 + PNG',
        durationSec: 15,
        commercialUse: true,
        package: { assets: 24, fps: 60 },
    },
    originalityStatus: 'VERIFIED',
    reviews: [
        {
            id: 'rev_01',
            reviewerName: 'Selin D.',
            rating: 5,
            comment: 'Files arrived organized and exactly as previewed.',
            createdAt: '2026-02-24T10:15:00.000Z',
        },
    ],
};
exports.sampleContract = {
    id: 'ctr_018',
    title: 'Campaign Visual Delivery Agreement',
    status: 'ACTIVE',
    freezeState: 'LOCKED',
    monitoringEnabled: true,
    milestones: [
        { id: 'ms_1', name: 'Concept Delivery', percentage: 30, status: 'RELEASED' },
        { id: 'ms_2', name: 'Production Bundle', percentage: 40, status: 'PENDING' },
        { id: 'ms_3', name: 'Final Transfer', percentage: 30, status: 'PENDING' },
    ],
    activityLog: [
        'Contract activated and escrow hold enabled.',
        'Concept milestone approved by buyer.',
    ],
    files: ['style-board-v2.pdf', 'preview-reel.mp4'],
};
exports.sampleMembers = [
    { id: 'mem_1', name: 'Nora Aydin', role: 'Creative Lead', percentage: 60 },
    { id: 'mem_2', name: 'Kerem B.', role: '3D Artist', percentage: 25 },
    { id: 'mem_3', name: 'Aylin S.', role: 'Sound Designer', percentage: 15 },
];
//# sourceMappingURL=data.js.map