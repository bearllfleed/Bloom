/**
 * 心情编辑器（第 3 期 3-8）：表情、文字、照片与草稿。
 * - 表情、文字、照片至少有一项才能保存；点选表情播放 M30，再点取消选择；
 * - 粘贴超长文字截断到 500 字并提示；到上限后无法继续输入；
 * - 照片最多 5 张：相册多选上限为剩余张数，压缩处理中显示花瓣转圈，失败可重试；
 * - 草稿每 2 秒与切到后台时保存，再次进入恢复并提示"接着上次写"；
 * - 有未保存内容时离开先确认"放弃这次心情吗"；已有心情时标题栏提供删除。
 */
import { usePreventRemove, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MOOD_TEXT_MAX_LENGTH,
  canSaveMood,
  editSession,
  hasMoodChanged,
  movePhoto,
  remainingPhotoSlots,
  truncateMoodText,
  type MoodContent,
  type MoodEntity,
  type MoodFace,
} from '@/domain/mood';
import { formatMonthDay } from '@/domain/date';
import type { LocalDate } from '@/domain/types';
import { moodCopy } from '@/copy/phase3';
import { haptics } from '@/platform/haptics';
import { kv } from '@/platform/kv';
import { media } from '@/platform/media';
import { getProject } from '@/services/queries';
import { moodService } from '@/services/moodService';
import { overlay } from '@/stores/overlayQueue';
import { AppText } from '@/ui/components/AppText';
import { RoundIconButton } from '@/ui/components/TopBar';
import { TextField } from '@/ui/components/TextField';
import { useTheme } from '@/ui/theme/ThemeProvider';
import { inset, space } from '@/ui/tokens';

import { MoodFacePicker } from './MoodFacePicker';
import { MoodPhotoGrid, type PhotoTile } from './MoodPhotoGrid';
import { PhotoViewer } from './PhotoViewer';
import { moodProjectLabel } from './heading';

export interface MoodEditorProps {
  date: LocalDate;
  projectId: string | null;
}

/** KV 适配层：键与 moodService 的草稿键一致 */
const draftStorage = {
  read: (key: string) => kv.getJSON<MoodContent>(key),
  write: (key: string, draft: MoodContent) => kv.setJSON(key, draft),
  remove: (key: string) => kv.remove(key),
};

let tileSeq = 0;
const nextKey = () => `tile-${++tileSeq}`;

function readyTiles(photos: readonly { id: string; fileName: string; width: number; height: number }[]): PhotoTile[] {
  return photos.map((photo) => ({ key: nextKey(), status: 'ready', photo }));
}

export function MoodEditor({ date, projectId }: MoodEditorProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  // 进入时读一次已保存心情、项目名与草稿；保存后不再重读，避免覆盖正在输入的内容
  const [initial] = useState(() => {
    const saved: MoodEntity | null = moodService.getFor(date, projectId);
    const project = projectId ? getProject(projectId) : null;
    const projectName = saved?.projectNameSnapshot ?? project?.name ?? null;
    const session = editSession({ ...draftStorage, date, projectId, original: saved });
    const restored = session.restore();
    session.dispose();
    const draft = restored.draft;
    // 草稿里的照片文件可能已被清理（例如上一次放弃后）；与原文相同也不算改动
    const usable =
      draft !== null && hasMoodChanged(saved, draft) && draft.photos.every((photo) => media.exists(photo.fileName));
    return { saved, projectName, draft: usable ? draft : null };
  });

  const saved = initial.saved;
  const savedPhotoIds = useRef(new Set(saved?.photos.map((photo) => photo.id) ?? []));
  const [face, setFace] = useState<MoodFace | null>(initial.draft?.face ?? saved?.face ?? null);
  const [text, setText] = useState(initial.draft?.text ?? saved?.text ?? '');
  const [tiles, setTiles] = useState<PhotoTile[]>(() => readyTiles(initial.draft?.photos ?? saved?.photos ?? []));
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const sessionRef = useRef<ReturnType<typeof editSession> | null>(null);
  const gridAnchor = useRef<ComponentRef<typeof View>>(null);

  const photos = useMemo(() => tiles.flatMap((tile) => (tile.status === 'ready' ? [tile.photo] : [])), [tiles]);
  const processing = tiles.some((tile) => tile.status === 'processing');
  const dirty = hasMoodChanged(saved, { face, text, photos });
  const canSave = canSaveMood({ face, text, photoCount: photos.length }) && !processing;

  // 草稿会话：卸载时只取消计时，不清除（下次进入接着写）
  useEffect(() => {
    const session = editSession({ ...draftStorage, date, projectId, original: saved });
    sessionRef.current = session;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') session.background();
    });
    return () => {
      sub.remove();
      session.dispose();
      sessionRef.current = null;
    };
  }, [date, projectId, saved]);

  useEffect(() => {
    if (initial.draft) overlay.toast(moodCopy.draft);
  }, [initial.draft]);

  // 内容变化时重新计时，2 秒后写草稿；与原文相同时调度器自己会清掉草稿
  useEffect(() => {
    sessionRef.current?.update({ face, text, photos });
  }, [face, text, photos]);

  const removeTile = (key: string) => {
    const tile = tiles.find((item) => item.key === key);
    if (!tile) return;
    haptics.soft();
    setTiles((list) => list.filter((item) => item.key !== key));
    // 还没进数据库的新照片直接删文件；已保存的照片等保存时由服务清理
    if (tile.status === 'ready' && !savedPhotoIds.current.has(tile.photo.id)) media.remove(tile.photo.fileName);
  };

  const runProcess = async (tileKey: string, sourceUri: string) => {
    try {
      const photo = await media.process(sourceUri);
      setTiles((list) => list.map((item) => (item.key === tileKey ? { key: tileKey, status: 'ready', photo } : item)));
    } catch {
      setTiles((list) =>
        list.map((item) => (item.key === tileKey ? { key: tileKey, status: 'failed', sourceUri } : item)),
      );
    }
  };

  const addUris = (uris: readonly string[]) => {
    const entries = uris.map((uri) => ({ key: nextKey(), uri }));
    setTiles((list) => [...list, ...entries.map(({ key }): PhotoTile => ({ key, status: 'processing' }))]);
    entries.forEach(({ key, uri }) => void runProcess(key, uri));
  };

  const addFromLibrary = async () => {
    const result = await media.pickFromLibrary(remainingPhotoSlots(tiles.length));
    if (result.kind === 'picked') addUris(result.uris);
  };

  const addFromCamera = async () => {
    const result = await media.takePhoto();
    if (result.kind === 'denied') overlay.toast(moodCopy.cameraDenied);
    else if (result.kind === 'picked') addUris(result.uris);
  };

  const openAddMenu = () => {
    gridAnchor.current?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
      overlay.openMenu(
        [
          { label: moodCopy.library, icon: 'photo', onPress: () => void addFromLibrary() },
          { label: moodCopy.camera, icon: 'camera', onPress: () => void addFromCamera() },
        ],
        y + h / 2,
      );
    });
  };

  /** 放弃或保存前：清掉草稿；放弃时把新加的照片文件也删掉 */
  const discardDraft = (removeNewPhotos: boolean) => {
    sessionRef.current?.discard();
    if (!removeNewPhotos) return;
    for (const tile of tiles) {
      if (tile.status === 'ready' && !savedPhotoIds.current.has(tile.photo.id)) media.remove(tile.photo.fileName);
    }
  };

  const disablePrevention = usePreventRemove(dirty, ({ repeat }) => {
    void overlay
      .confirm({
        title: moodCopy.discardTitle,
        confirmLabel: moodCopy.discard,
        cancelLabel: moodCopy.keepWriting,
        destructive: true,
      })
      .then((discard) => {
        if (!discard) return;
        discardDraft(true);
        repeat();
      });
  });

  const close = () => {
    if (!dirty) {
      discardDraft(true);
      disablePrevention();
    }
    // 有未保存内容时由 usePreventRemove 拦截并询问
    router.back();
  };

  const save = () => {
    if (!canSave) return;
    const result = moodService.saveDraft({ date, projectId, face, text, photos });
    if (!result) return;
    sessionRef.current?.saved();
    haptics.success();
    disablePrevention();
    overlay.toast(moodCopy.saved);
    router.back();
  };

  const removeSaved = (entity: MoodEntity) => {
    void overlay
      .confirm({
        title: moodCopy.deleteTitle,
        message: moodCopy.deleteMessage,
        confirmLabel: moodCopy.delete,
        cancelLabel: moodCopy.cancel,
        destructive: true,
      })
      .then((confirmed) => {
        if (!confirmed) return;
        sessionRef.current?.discard();
        moodService.delete(entity.id);
        // 已保存照片随记录删除；刚加的新照片也要清理
        for (const tile of tiles) {
          if (tile.status === 'ready' && !savedPhotoIds.current.has(tile.photo.id)) media.remove(tile.photo.fileName);
        }
        haptics.warning();
        disablePrevention();
        overlay.toast(moodCopy.deleted);
        router.back();
      });
  };

  const onMore = () => {
    if (!saved) return;
    gridAnchor.current?.measureInWindow((_x: number, y: number, _w: number, _h: number) => {
      overlay.openMenu(
        [{ label: moodCopy.delete, icon: 'trash', destructive: true, onPress: () => removeSaved(saved) }],
        y + 20,
      );
    });
  };

  const projectLabel = moodProjectLabel(initial.projectName, projectId !== null && getProject(projectId) !== null);
  const title = `${formatMonthDay(date)} · ${projectLabel ?? moodCopy.dayTitle}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={close} style={styles.titleSide}>
          <AppText variant="callout" tone="secondary">
            {moodCopy.cancel}
          </AppText>
        </Pressable>
        <AppText variant="title3" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <View style={[styles.titleSide, styles.titleRight]}>
          {saved ? <RoundIconButton icon="more" label={moodCopy.more} onPress={onMore} /> : null}
          <Pressable accessibilityRole="button" hitSlop={8} disabled={!canSave} onPress={save}>
            <AppText variant="title3" tone={canSave ? 'link' : 'muted'}>
              {moodCopy.save}
            </AppText>
          </Pressable>
        </View>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.giant }]}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="title2">{moodCopy.question}</AppText>
          <MoodFacePicker value={face} onChange={setFace} />
          <TextField
            value={text}
            onChangeText={(next) => {
              const result = truncateMoodText(next, MOOD_TEXT_MAX_LENGTH);
              setText(result.text);
              if (result.wasTruncated) overlay.toast(moodCopy.maxLength);
            }}
            maxLength={MOOD_TEXT_MAX_LENGTH}
            nativeMaxLength={MOOD_TEXT_MAX_LENGTH * 4}
            countFrom={400}
            placeholder={moodCopy.placeholder}
            multiline
          />
          <View ref={gridAnchor} collapsable={false}>
            <MoodPhotoGrid
              tiles={tiles}
              onAdd={openAddMenu}
              onRemove={removeTile}
              onRetry={(key) => {
                const tile = tiles.find((item) => item.key === key);
                if (!tile || tile.status !== 'failed') return;
                setTiles((list) => list.map((item) => (item.key === key ? { key, status: 'processing' } : item)));
                void runProcess(key, tile.sourceUri);
              }}
              onReorder={(from, to) => {
                setTiles((list) => movePhoto(list, from, to));
              }}
              onOpen={setViewerIndex}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {viewerIndex !== null ? (
        <PhotoViewer
          photos={photos.map((photo) => ({ fileName: photo.fileName }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: inset.page,
    gap: space.sm,
  },
  titleSide: { minWidth: 84, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  titleRight: { justifyContent: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  content: { padding: inset.page, gap: space.lg, paddingTop: space.sm },
});
