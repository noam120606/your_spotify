import * as stylex from "@stylexjs/stylex";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/spotifyApi";
import { CollaborativeMode } from "../api/types";
import { CalendarIntervalPicker } from "../components/calendarIntervalPicker";
import { Button } from "../components/designSystem/button";
import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { PageCard } from "../components/designSystem/pageCard";
import { Popover } from "../components/designSystem/popover";
import { Select } from "../components/designSystem/select";
import { Text } from "../components/designSystem/text";
import { PageHeader } from "../components/pageHeader";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";

type AffinityType = "songs" | "albums" | "artists";

export function Affinity() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { data: accountsRaw } = useApi(api.getAccounts);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [affinityMode, setAffinityMode] = useState<CollaborativeMode>(CollaborativeMode.AVERAGE);
  const [affinityType, setAffinityType] = useState<AffinityType>("songs");

  const accounts = accountsRaw ? accountsRaw.filter((a) => a.id !== currentUser?.id) : [];
  const userOptions = accounts.map((a) => ({ label: a.username, value: a.id }));

  const handleCompute = () => {
    if (selectedUserIds.length === 0 || !startDate || !endDate) return;

    const params = new URLSearchParams({
      type: affinityType,
      mode: affinityMode,
      userIds: selectedUserIds.join(","),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    navigate(`/affinity/results?${params.toString()}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <main {...stylex.props(styles.mainContent)}>
      <PageHeader title="Affinity" subtitle="Compare your music taste with other users" />

      <div {...stylex.props(styles.content)}>
        <PageCard title="Selection">
          <div {...stylex.props(styles.controls)}>
              <div {...stylex.props(styles.controlGroup)}>
                <Text weight="bold" size="small" color="textSecondary">
                  Users
                </Text>
                <Select
                  multiple
                  options={userOptions}
                  value={selectedUserIds}
                  onChange={setSelectedUserIds}
                  placeholder="Select users to compare..."
                  darken
                />
              </div>

              <div {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.controlGroup, styles.flexible)}>
                  <Text weight="bold" size="small" color="textSecondary">
                    Type
                  </Text>
                  <Select
                    options={[
                      { label: "Songs", value: "songs" },
                      { label: "Albums", value: "albums" },
                      { label: "Artists", value: "artists" },
                    ]}
                    value={affinityType}
                    onChange={(val) => setAffinityType(val as AffinityType)}
                    darken
                  />
                </div>

                <div {...stylex.props(styles.controlGroup, styles.flexible)}>
                  <Text weight="bold" size="small" color="textSecondary">
                    Mode
                  </Text>
                  <Select
                    options={[
                      { label: "Average", value: CollaborativeMode.AVERAGE },
                      { label: "Minima", value: CollaborativeMode.MINIMA },
                    ]}
                    value={affinityMode}
                    onChange={(val) => setAffinityMode(val as CollaborativeMode)}
                    darken
                  />
                </div>
              </div>

              <div {...stylex.props(styles.controlGroup)}>
                <Text weight="bold" size="small" color="textSecondary">
                  Interval
                </Text>
                <Popover.Root onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
                  <Popover.Trigger>
                    {({ ...props }) => (
                      <Button variant="outline" fullWidth {...props}>
                        <div {...stylex.props(styles.dateTrigger)}>
                          <Calendar size={16} />
                          <Text size="small" weight="medium">
                            {formatDate(startDate)} - {formatDate(endDate)}
                          </Text>
                        </div>
                      </Button>
                    )}
                  </Popover.Trigger>
                  <Popover.Content>
                    <div {...stylex.props(styles.calendarContainer)}>
                      <CalendarIntervalPicker
                        startDate={startDate}
                        endDate={endDate}
                        onApply={(s, e) => {
                          setStartDate(s);
                          setEndDate(e);
                          setIsPopoverOpen(false);
                        }}
                      />
                    </div>
                  </Popover.Content>
                </Popover.Root>
              </div>

            <Button
              variant="primary"
              onClick={handleCompute}
              disabled={selectedUserIds.length === 0 || !startDate || !endDate}
              fullWidth
            >
              Compute Affinity
            </Button>
          </div>
        </PageCard>
      </div>
    </main>
  );
}

const styles = stylex.create({
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: `0 ${spacing.xl}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    flex: 1,
    marginBottom: spacing.xxl,
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  row: {
    display: "flex",
    gap: spacing.md,
  },
  flexible: {
    flex: 1,
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  dateTrigger: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  calendarContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: "12px",
    width: "320px",
  },
});