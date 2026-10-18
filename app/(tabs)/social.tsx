import { useCallback, useEffect, useState } from "react";
import { RefreshControl, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { BrandTopBar } from "@/components/navigation/BrandTopBar";
import { useTabBarClearance } from "@/components/navigation/tabBar";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSession } from "@/features/auth/SessionProvider";
import { ActivityTab } from "@/features/social/components/activity/ActivityTab";
import { SharingInfoSheet } from "@/features/social/components/activity/SharingInfoSheet";
import { CompetitionsTab } from "@/features/social/components/competitions/CompetitionsTab";
import { FriendsTab } from "@/features/social/components/friends/FriendsTab";
import { SocialTabs } from "@/features/social/components/SocialTabs";
import { ActionError } from "@/features/social/components/TabState";
import { UsernameSetupModal } from "@/features/social/components/UsernameSetupModal";
import { useCompetitions } from "@/features/social/hooks/useCompetitions";
import { useFriendChats } from "@/features/social/hooks/useFriendChats";
import { useFriends } from "@/features/social/hooks/useFriends";
import { useInviteLink } from "@/features/social/hooks/useInviteLink";
import { useSocialFeed } from "@/features/social/hooks/useSocialFeed";
import { isSocialTab, type SocialTab } from "@/features/social/types";
import { confirmAction } from "@/services/native/confirm";
import type { FriendResponse } from "@/services/http/types";
import { uiPreferences } from "@/services/storage/preferencesStorage";

/**
 * Social: Atividade (o resumo semanal dos amigos), Amigos (pedidos, lista e
 * conversa) e Competições.
 *
 * Cada aba tem o próprio recurso — carregando ou com erro, só ela mostra o
 * estado; cabeçalho e abas ficam sempre na tela. A aba ativa vive na URL
 * (`/social?tab=amigos`) para notificação e link abrirem no lugar certo.
 */
export default function SocialScreen() {
  const { colors } = useTheme();
  const bottomClearance = useTabBarClearance();
  const { user, refreshUser } = useSession();
  const params = useLocalSearchParams<{ tab?: string }>();
  const activeTab: SocialTab = isSocialTab(params.tab) ? params.tab : "atividade";

  const feed = useSocialFeed();
  const friends = useFriends();
  const chats = useFriendChats();
  const competitions = useCompetitions();
  const invite = useInviteLink();

  const [askUsername, setAskUsername] = useState(false);
  const [sharingOpen, setSharingOpen] = useState(false);

  // Primeira visita ao social: confirmar o @usuário público.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void uiPreferences.hasConfirmedUsername(user.id).then((confirmed) => {
      if (!cancelled && !confirmed) setAskUsername(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const onUsernameDone = useCallback(async () => {
    setAskUsername(false);
    if (user) await uiPreferences.markUsernameConfirmed(user.id);
    await refreshUser();
  }, [refreshUser, user]);

  const setTab = useCallback((tab: SocialTab) => router.setParams({ tab }), []);

  const openChat = useCallback(
    async (friend: FriendResponse) => {
      const conversationId = await chats.conversationIdFor(friend.id);
      if (conversationId) router.push(`/chat/${conversationId}`);
    },
    [chats],
  );

  const friendOptions = useCallback(
    (friend: FriendResponse) =>
      confirmAction({
        title: `Desfazer amizade com ${friend.name}?`,
        message: "Vocês deixam de ver a atividade um do outro. A conversa continua guardada.",
        confirmLabel: "Desfazer amizade",
        destructive: true,
        onConfirm: () => void friends.removeFriend(friend.id),
      }),
    [friends],
  );

  const tabResources = {
    atividade: [feed],
    amigos: [friends, chats],
    competicoes: [competitions],
  }[activeTab];

  const hasNews = friends.incoming.length > 0 || competitions.invites.length > 0;

  return (
    <Screen>
      <UsernameSetupModal
        visible={askUsername}
        currentUsername={user?.username ?? ""}
        onDone={() => void onUsernameDone()}
      />
      <SharingInfoSheet
        visible={sharingOpen}
        onClose={() => setSharingOpen(false)}
        onOpenPrivacy={() => {
          setSharingOpen(false);
          router.push("/settings/privacy");
        }}
      />

      <KeyboardAwareScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomClearance }}
        refreshControl={
          <RefreshControl
            refreshing={tabResources.some((resource) => resource.refreshing)}
            onRefresh={() => tabResources.forEach((resource) => void resource.refresh())}
            tintColor={colors.ember}
          />
        }
      >
        <BrandTopBar
          name={user?.name ?? ""}
          avatarUrl={user?.avatarUrl}
          hasNotification={hasNews}
          onPressBell={() => router.push("/notifications")}
          onPressAvatar={() => router.navigate("/profile")}
        />

        <View className="px-6" style={{ paddingTop: 20 }}>
          <AppText
            accessibilityRole="header"
            family="archivo"
            weight="black"
            style={{ fontSize: 44, lineHeight: 50, letterSpacing: -1.8, color: colors.text }}
          >
            Social
          </AppText>
        </View>

        <SocialTabs active={activeTab} onChange={setTab} />

        {activeTab === "atividade" ? (
          <ActivityTab
            items={feed.items}
            loading={feed.loading}
            error={feed.error}
            hasFriends={friends.friends.length > 0}
            onRetry={() => void feed.refresh()}
            onToggleLike={(id) => void feed.toggleLike(id)}
            onFindFriends={() => setTab("amigos")}
            onOpenSharing={() => setSharingOpen(true)}
          />
        ) : null}

        {activeTab === "amigos" ? (
          <>
            <FriendsTab
              friends={friends.friends}
              incoming={friends.incoming}
              outgoing={friends.outgoing}
              loading={friends.loading}
              error={friends.error}
              actionError={friends.actionError ?? chats.error}
              onRetry={() => void friends.refresh()}
              chatWith={chats.chatWith}
              openingChatId={chats.openingId}
              onOpenChat={(friend) => void openChat(friend)}
              onFriendOptions={friendOptions}
              onAddFriend={(query) =>
                router.push(query?.trim() ? { pathname: "/add-friend", params: { q: query.trim() } } : "/add-friend")
              }
              onOpenRequests={() => router.push("/friend-requests")}
              onInvite={() => void invite.share()}
            />
            <ActionError message={invite.error} />
          </>
        ) : null}

        {activeTab === "competicoes" ? (
          <CompetitionsTab
            invites={competitions.invites}
            ongoing={competitions.ongoing}
            upcoming={competitions.upcoming}
            finishedCount={competitions.finished.length}
            loading={competitions.loading}
            error={competitions.error}
            actionError={competitions.actionError}
            busyId={competitions.busyId}
            onRetry={() => void competitions.refresh()}
            onAccept={competitions.accept}
            onDecline={competitions.decline}
            onOpen={(id) => router.push(`/competition/${id}`)}
            onCreate={() => router.push("/new-competition")}
            onJoinWithCode={() => router.push("/join-competition")}
            onOpenFinished={() => router.push("/finished-competitions")}
          />
        ) : null}
      </KeyboardAwareScrollView>
    </Screen>
  );
}
