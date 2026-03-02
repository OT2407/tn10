declare const tabs: readonly ["Explore", "Shop", "Collections", "Saved"];
interface TopNavTabsProps {
    activeTab: (typeof tabs)[number];
    onTabSelect: (tab: (typeof tabs)[number]) => void;
}
export declare function TopNavTabs({ activeTab, onTabSelect }: TopNavTabsProps): any;
export {};
//# sourceMappingURL=TopNavTabs.d.ts.map