# YETI - Modern & Dinamik Masaüstü Uygulaması Geliştirme Rehberi

## 1. Teknoloji Kararı ve Mimari

**Seçim:** **Electron + React (Next.js)**
**Neden:**

* **Stabilite & Olgunluk:** VS Code, Discord, Notion gibi devlerin kullandığı, rüştünü ispatlamış bir altyapı.
* **Dinamiklik:** Next.js ile React'in en güncel özelliklerini (Server Components, API Routes) masaüstünde kullanabiliriz.
* **Çoklu Dil Desteği (Polyglot):** İleride Python (LLM), C++ (Ağır işlem) veya Java entegre etmek istediğimizde, Node.js'in `child_process` yetenekleri ve geniş kütüphane desteği sayesinde bu dilleri "Native Module" veya "Sidecar" olarak çalıştırmak çok kolaydır. Tauri'de bu işlemler için Rust bilgisi gerekirken, Electron'da JavaScript/TypeScript ile yönetebiliriz.
* **Büyük Dosya İşleme:** Node.js'in "Stream" yapısı, GB'larca büyüklükteki dosyaları belleği şişirmeden okumak ve işlemek için mükemmeldir.

## 2. Proje Vizyonu ve İlk Adımlar

Uygulama, standart işletim sistemi pencerelerinden tamamen bağımsız, kendi özel tasarım diline sahip olacak.

### Hedeflenen UI/UX (İlk Sürüm)

1. **Splash Screen (Açılış):**
    * Çerçevesiz (Frameless).
    * Sadece "YETI" yazısı belirecek, şık ve akıcı bir animasyonla ekrana gelecek.
2. **Ana Ekran:**
    * Özel Tasarım Çerçeve (Custom Titlebar): Standart Windows kapat/küçült butonları yerine özel tasarım ikonlar.
    * **Orta Alan:**
        * Soluk, atmosferik bir arka plan görseli/efekti.
        * "YETI Modern Uygulama" yazısı (Modern tipografi).
        * Altında daha silik "Yaratıcı Emin" imzası.
    * **Sol Üst:**
        * Dinamik Versiyon Göstergesi (GitHub'dan çekilen veri, örn: `v0.1.0-alpha`).

## 3. Detaylı Yol Haritası

### Faz 1: Altyapı ve Kurulum (Foundation)

* **Repo Kurulumu:** `https://github.com/Brostagma/yeti.git` bağlantısının yapılandırılması.
* **Electron + Next.js Entegrasyonu:** `electron-vite` veya `nextron` kullanarak en güncel boilerplate'in kurulması.
* **TypeScript Konfigürasyonu:** Tip güvenliği ve profesyonel kod yapısı için sıkı TS kuralları.
* **TailwindCSS Kurulumu:** Hızlı ve modern stillendirme için.

### Faz 2: "YETI" UI Çekirdeği (The Core UI)

* **Frameless Window Yapısı:** İşletim sistemi çerçevelerinin kaldırılması ve şeffaf pencere ayarları.
* **Splash Screen Geliştirmesi:** Uygulama yüklenirken kullanıcıyı karşılayan animasyonlu giriş ekranı.
* **Custom Titlebar:** Sürükle-bırak yapılabilen, pencere kontrol butonlarını içeren özel üst bar.
* **Ana Ekran Tasarımı:** İstenilen görsel öğelerin (Yazılar, arka plan) yerleştirilmesi.

### Faz 3: Versiyon Kontrol ve Otomasyon (DevOps)

* **GitHub Actions:** Her `push` işleminde kodun derlenmesi.
* **Auto-Updater:** `electron-updater` kurulumu. Uygulama açıldığında GitHub Releases üzerinden yeni sürüm var mı kontrol edecek.
* **Versiyon Göstergesi:** `package.json`'dan okunan versiyon bilgisinin UI'da gösterilmesi.

### Faz 4: Dosya Sistemi ve Analiz (Backend Logic)

* **Dosya Tarayıcı (Scanner):** Kullanıcının seçtiği klasördeki dosyaları (büyük boyutlu olsa bile) tarayan modül.
* **Metadata Motoru:** Taranan dosyalar için `.meta` dosyaları oluşturan yapı.
* **Stream İşleme:** Büyük dosyaları parça parça okuyup analiz eden Node.js servisi.

### Faz 5: Gelecek Entegrasyonlar (Future Proofing)

* **Python Sidecar:** LLM işlemleri için Python sanal ortamının (venv) paketlenip uygulamayla dağıtılması altyapısı.
* **API Katmanı:** Frontend (React) ile Backend (Node/Python) arasında hızlı veri akışı için IPC (Inter-Process Communication) kanallarının tasarlanması.

## 4. Teknik Gereksinimler

* **Dil:** TypeScript (Frontend & Backend)
* **Framework:** React, Next.js, Electron
* **Styling:** TailwindCSS, Framer Motion (Animasyonlar için)
* **State Management:** Zustand (Hafif ve hızlı)
* **Veritabanı (Opsiyonel):** SQLite veya LowDB (Metadata saklamak için yerel JSON DB)

Bu rehber doğrultusunda, profesyonel ve genişletilebilir bir yapı kuracağız.
