import * as stylex from '@stylexjs/stylex';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../api/spotifyApi';
import { AdminAccount } from '../../../api/types';
import { Card } from '../../../components/designSystem/card';
import { SettingTabContent } from './settingTabContent';
import { Text } from '../../../components/designSystem/text';
import { Button } from '../../../components/designSystem/button';
import { useConfirmation } from '../../../hooks/useConfirmation';
import { useAuthStore } from '../../../store/authStore';
import {
  colors,
  spacing,
  borderRadius,
} from '../../../components/designSystem/designConstants.stylex';

const mockedUsers: AdminAccount[] = (() => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Sam', 'Jamie', 'Morgan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return Array.from({ length: 10 }).map(() => ({
    id: `mock-${Math.random().toString(36).substring(2, 11)}`,
    username: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    admin: Math.random() > 0.8,
    firstListenedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));
})();

export function AdminTab() {
  const { data: accounts, loading, refetch } = useApi(api.getAccounts);
  const { confirm, ConfirmationModal } = useConfirmation();
  const { user } = useAuthStore();

  const allAccounts = accounts ? [...accounts, ...mockedUsers] : mockedUsers;

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (userId.startsWith('mock-')) return;
    const isConfirmed = await confirm({
      title: currentStatus ? 'Revoke Admin' : 'Grant Admin',
      description: `Are you sure you want to ${currentStatus ? 'revoke' : 'grant'
        } admin privileges for this user?`,
      confirmText: 'Yes',
      cancelText: 'Cancel',
      isDestructive: currentStatus,
    });

    if (isConfirmed) {
      try {
        await api.setAdmin(userId, !currentStatus);
        refetch();
      } catch (error) {
        console.error('Failed to change admin status', error);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId.startsWith('mock-')) return;
    const isConfirmed = await confirm({
      title: 'Delete User',
      description: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (isConfirmed) {
      try {
        await api.deleteUser(userId);
        refetch();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  if (loading) {
    return (
      <div {...stylex.props(styles.loadingContainer)}>
        <Text color="textSecondary">Loading users...</Text>
      </div>
    );
  }

  return (
    <SettingTabContent>
      <Card title="User Management" fullWidth>
        <div {...stylex.props(styles.listContainer)}>
          {allAccounts.map((account: AdminAccount) => (
            <div key={account.id} {...stylex.props(styles.userRow)}>
              <div {...stylex.props(styles.userInfo)}>
                <Text weight="bold" size="medium">
                  {account.username}
                </Text>
                {account.admin && (
                  <div {...stylex.props(styles.adminBadge)}>
                    <Text size="small" weight="bold" color="text">
                      Admin
                    </Text>
                  </div>
                )}
              </div>

              <div {...stylex.props(styles.actions)}>
                {account.id !== user?.id && (
                  <>
                    <Button
                      variant={account.admin ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleAdmin(account.id, account.admin)}
                    >
                      {account.admin ? 'Unadmin' : 'Make Admin'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(account.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {allAccounts.length === 0 && (
            <div {...stylex.props(styles.emptyState)}>
              <Text color="textSecondary">No users found.</Text>
            </div>
          )}
        </div>
      </Card>
      <ConfirmationModal />
    </SettingTabContent>
  );
}

const styles = stylex.create({
  loadingContainer: {
    padding: spacing.xl,
    textAlign: 'center',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.sm} 0`,
    borderRadius: borderRadius.md,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  adminBadge: {
    backgroundColor: colors.primary,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.sm,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyState: {
    padding: spacing.lg,
    textAlign: 'center',
  },
});
