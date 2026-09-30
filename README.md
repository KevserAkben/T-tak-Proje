# HastaneNavi — Kapalı Alan Konum & Yönlendirme

TÜBİTAK araştırma önerisine uygun **React Native (Expo)** Android demosu.

Wi-Fi/BLE benzeri **RSSI simülasyonu** → path-loss mesafe → **üçgenleme** → **Dijkstra** rota → yazılı/sesli yönlendirme.

## Özellikler

- Örnek hastane kat planı (oda + koridor grafı)
- 5 sanal beacon ile RSSI üretimi
- Trilateration konum tahmini
- Hedef seçimi (Acil, Radyoloji, Laboratuvar, …)
- Türkçe adım adım yönlendirme + `expo-speech`
- **Simüle Yürü** ile jüri demosu

## Kurulum

```bash
npm install
npx expo start
```

Android emülatör / telefon:

```bash
npx expo start --android
```

Expo Go ile QR kodu okutarak da çalıştırabilirsiniz (simülasyon modu donanım gerektirmez).

## Demo senaryosu

1. Uygulama açılır → konum **Ana Giriş** yakınında
2. **Hedef Seç** → örn. **Radyoloji**
3. Rota ve yön adımları görünür
4. **Simüle Yürü** → nokta rota üzerinde ilerler
5. Varışta uyarı + sesli bildirim

## Proje yapısı

```
src/
  data/          # floor_map, beacons, destinations
  engine/        # pathLoss, trilateration, dijkstra, navigationSteps
  sensors/       # SimulationSensor, BleSensor stub, SensorAdapter
  screens/       # Map, Destination, Navigate, Settings
  components/    # FloorMap SVG
  hooks/         # useIndoorPosition, PositionContext
```

## İş paketleri eşlemesi

| IP | Karşılık |
|----|----------|
| IP1 Ağ/erişim | `SensorAdapter` + simülasyon RSSI |
| IP2 Konum | `trilateration.ts` + `pathLoss.ts` |
| IP3 Harita | `floor_map.json` + `FloorMap` |
| IP4 Mesafe/zaman | Dijkstra mesafe + yürüyüş süresi |
| IP5 Yönlendirme | `navigationSteps.ts` + ses |

## Sonraki adım (gerçek BLE)

`src/sensors/BleSensor.stub.ts` yerine `react-native-ble-plx` ile beacon taraması eklenir; `SensorAdapter` arayüzü aynı kalır.
