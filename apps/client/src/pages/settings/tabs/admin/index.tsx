import { SettingTabContent } from "../../components/settingTabContent";
import { UserManagementCard } from "./userManagementCard";

export function AdminTab() {
  return (
    <SettingTabContent>
      <UserManagementCard />
    </SettingTabContent>
  );
}
