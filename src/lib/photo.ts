import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { savePhoto } from '../state/persist';

/**
 * Lets the user pick a profile photo (square crop), shrinks it to 400 px and saves it encrypted
 * on this phone. Resolves false if they cancelled. The system photo picker needs no permission.
 */
export async function pickPhoto() {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (res.canceled || !res.assets[0]) return false;
  const image = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 400 }).renderAsync();
  const out = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!out.base64) throw new Error('No image data');
  await savePhoto(out.base64);
  return true;
}

export const removePhoto = () => savePhoto(null);
