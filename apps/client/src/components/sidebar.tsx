import * as stylex from "@stylexjs/stylex";
import {
  Home,
  ListMusic,
  Users,
  Disc,
  Settings as SettingsIcon,
  Share2,
  BarChart2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import packageJson from "../../package.json";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, borderRadius, transitions } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";
import { MediaPlayer } from "./mediaPlayer";
import { UserProfile } from "./userProfile";

export function Sidebar() {
  const { logout, isGuestSession } = useAuthStore();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const navItems: Array<{ path: string; label: string; group?: string; icon: React.ElementType }> =
    [
      { path: "/", label: "Home", icon: Home },
      { path: "/tops/tracks", label: "Top tracks", group: "Tops", icon: ListMusic },
      { path: "/tops/artists", label: "Top artists", group: "Tops", icon: Users },
      { path: "/tops/albums", label: "Top albums", group: "Tops", icon: Disc },
      { path: "/stats", label: "All stats", group: "Tops", icon: BarChart2 },
      { path: "/affinity", label: "Affinity", group: "Tops", icon: Users },
      { path: "/settings", label: "Settings", group: "Settings", icon: SettingsIcon },
      { path: "/share", label: "Share this page", group: "Settings", icon: Share2 },
    ];

  const visibleNavItems = isGuestSession
    ? navItems.filter(
        (item) => item.path !== "/affinity" && item.path !== "/settings" && item.path !== "/share",
      )
    : navItems;

  const settingsItems = visibleNavItems.filter((i) => i.group === "Settings");

  function renderNavItem(item: {
    path: string;
    label: string;
    group?: string;
    icon: React.ElementType;
  }) {
    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.path}
        to={item.path}
        {...stylex.props(styles.navItem)}
        onMouseEnter={() => setHoveredPath(item.path)}
      >
        {hoveredPath === item.path && (
          <motion.div
            layoutId="sidebar-hover"
            {...stylex.props(styles.hoverBackground)}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <div {...stylex.props(styles.navItemContent, isActive && styles.navItemContentActive)}>
          <item.icon size={20} strokeWidth={2.5} />
          <Text weight={isActive ? "bold" : "medium"} color={isActive ? "primary" : "text"}>
            {item.label}
          </Text>
        </div>
      </Link>
    );
  }

  return (
    <aside {...stylex.props(styles.sidebar)} onMouseLeave={() => setHoveredPath(null)}>
      <div {...stylex.props(styles.topSection)}>
        <Link to="/" {...stylex.props(styles.brandLink)}>
          <Text size="xlarge" weight="bold" color="primary">
            YourSpotify
          </Text>
        </Link>

        <nav {...stylex.props(styles.navigation)}>
          {renderNavItem(visibleNavItems[0]!)}

          <div {...stylex.props(styles.navGroup)}>
            <div {...stylex.props(styles.groupTitle)}>
              <Text size="small" weight="bold" color="textSecondary">
                Tops
              </Text>
            </div>
            {visibleNavItems.filter((i) => i.group === "Tops").map((i) => renderNavItem(i))}
          </div>

          {settingsItems.length > 0 && (
            <div {...stylex.props(styles.navGroup)}>
              <div {...stylex.props(styles.groupTitle)}>
                <Text size="small" weight="bold" color="textSecondary">
                  Settings
                </Text>
              </div>
              {settingsItems.map((i) => renderNavItem(i))}
            </div>
          )}
        </nav>
      </div>

      <div {...stylex.props(styles.bottomSection)}>
        <MediaPlayer showControls={!isGuestSession} />
        <UserProfile />
        <button {...stylex.props(styles.logoutButton)} onClick={logout}>
          <Text weight="semiBold" color="error">
            Log out
          </Text>
        </button>
        <div {...stylex.props(styles.versionContainer)}>
          <Text size="small" color="textSecondary">
            v{packageJson.version}
          </Text>
        </div>
      </div>
    </aside>
  );
}

const styles = stylex.create({
  sidebar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "260px",
    height: "100vh",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: colors.border,
    position: "sticky",
    top: 0,
    overflowY: "auto",
  },
  topSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
  },
  brandLink: {
    textDecoration: "none",
    display: "inline-block",
    marginTop: spacing.md,
    marginLeft: spacing.md,
  },
  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  groupTitle: {
    paddingLeft: spacing.md,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    position: "relative",
    zIndex: 1,
  },
  navItem: {
    position: "relative",
    textDecoration: "none",
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    display: "block",
  },
  hoverBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    zIndex: 0,
  },
  navItemContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    color: colors.textSecondary,
  },
  navItemContentActive: {
    color: colors.primary,
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: transitions.default,
    fontFamily: "inherit",
    ":hover": {
      backgroundColor: colors.surfaceHover,
    },
  },
  versionContainer: {
    paddingTop: spacing.md,
    display: "flex",
    justifyContent: "flex-start",
    opacity: 0.6,
  },
});
