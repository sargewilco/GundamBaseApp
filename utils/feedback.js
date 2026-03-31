import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';

let clickPlayer = null;
let completePlayer = null;

async function loadSounds() {
  try {
    if (!clickPlayer) clickPlayer = createAudioPlayer(require('../assets/click.wav'));
    if (!completePlayer) completePlayer = createAudioPlayer(require('../assets/complete.wav'));
  } catch {}
}

loadSounds();

export async function tapFeedback() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clickPlayer?.seekTo(0);
    clickPlayer?.play();
  } catch {}
}

export async function selectFeedback() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clickPlayer?.seekTo(0);
    clickPlayer?.play();
  } catch {}
}

export async function successFeedback() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completePlayer?.seekTo(0);
    completePlayer?.play();
  } catch {}
}

export async function errorFeedback() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}
