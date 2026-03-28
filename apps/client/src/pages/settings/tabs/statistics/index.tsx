import { SettingTabContent } from "../../components/settingTabContent";
import { BlacklistArtistsSearchCard } from "./blacklistArtistsSearchCard";
import { BlacklistedArtistsCard } from "./blacklistedArtistsCard";
import { StatMeasurementCard } from "./statMeasurementCard";

export function StatisticsTab() {
  return (
    <SettingTabContent>
      <StatMeasurementCard />
      <BlacklistArtistsSearchCard />
      <BlacklistedArtistsCard />
    </SettingTabContent>
  );
}
