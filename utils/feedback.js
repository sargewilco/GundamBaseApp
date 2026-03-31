import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

let clickSound = null;
let completeSound = null;

async function loadSounds() {
  if (!clickSound) {
    const { sound } = await Audio.Sound.createAsync(require('../assets/click.wav'));
    clickSound = sound;
  }
  if (!completeSound) {
    const { sound } = await Audio.Sound.createAsync(require('../assets/complete.wav'));
    completeSound = sound;
  }
}

loadSounds().catch(() => {});

export async function tapFeedback() {
  try {
    await Promise.all([
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      clickSound?.replayAsync(),
    ]);
  } catch {}
}

export async function selectFeedback() {
  try {
    await Promise.all([
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      clickSound?.replayAsync(),
    ]);
  } catch {}
}

export async function successFeedback() {
  try {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      completeSound?.replayAsync(),
    ]);
  } catch {}
}

export async function errorFeedback() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}
