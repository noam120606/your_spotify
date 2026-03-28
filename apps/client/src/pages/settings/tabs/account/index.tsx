import { SettingTabContent } from "../../components/settingTabContent";
import { AccountDetailsCard } from "./accountDetailsCard";
import { AppearanceCard } from "./appearanceCard";
import { ImportSpotifyDataCard } from "./importSpotifyDataCard";
import { ProfileHeaderCard } from "./profileHeaderCard";

export function AccountTab() {
  return (
    <SettingTabContent>
      <ProfileHeaderCard />
      <AccountDetailsCard />
      <AppearanceCard />
      <ImportSpotifyDataCard />
    </SettingTabContent>
  );
}
