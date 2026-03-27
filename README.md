# GymTracker

Spor salonunda kullanmak icin tasarlanmis, haftalik antrenman programini takip eden bir React Native (Expo) uygulamasi.

## Ozellikler

- 4 gunluk antrenman programi (Upper/Lower split)
- Egzersiz bazinda agirlik takibi (bu hafta / gecen hafta karsilastirmasi)
- Surukle-birak ile egzersiz siralama
- Egzersiz ekleme ve silme
- "Haftayi Tamamla" ile otomatik gecen hafta kaydi
- AsyncStorage ile kalici veri saklama
- Expo Go uyumlu

## Teknoloji

- React Native + Expo (SDK 55)
- TypeScript
- expo-router (file-based routing)
- AsyncStorage
- react-native-draggable-flatlist
- react-native-reanimated + gesture-handler

## Kurulum

```bash
npm install
npx expo start
```

Expo Go uygulamasiyla QR kodu okutarak telefonunuzda calistirabilirsiniz.

## Proje Yapisi

```
app/
  _layout.tsx          # Root layout
  index.tsx            # Ana ekran (4 gun karti)
  day/[id].tsx         # Gun detay ekrani
components/
  DayCard.tsx          # Gun karti
  ExerciseRow.tsx      # Egzersiz satiri
  AddExerciseModal.tsx # Egzersiz ekleme modali
store/
  workoutStore.ts      # Veri katmani (AsyncStorage)
types/
  index.ts             # TypeScript tipleri
constants/
  defaultData.ts       # Varsayilan egzersiz verileri
```
