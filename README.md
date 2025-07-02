# S3 CloudFront Image Viewer

S3バケットとCloudFrontを使用した画像配信システム。キャッシュありとキャッシュなしの動作比較ができます。

## 前提条件

- AWS CLIが設定済みであること
- AWS CDKがインストール済みであること

## 手順

### 1. AWSリソースのデプロイ

```bash
cd aws
npm install
cdk deploy
```

### 2. デプロイ後の設定

#### S3バケットの設定
- CDK完了後に、no-cacheバケットに`/no-cache`フォルダを作成
- 手動で各バケットに画像を保存する

#### フロントエンド設定
```bash
cd frontend
npm install
```

- `.env`ファイルを作成し、`VITE_CLOUDFRONT_URL`にCloudFrontのURLを設定
- `App.tsx`の画像配列にアップロードしたファイル名を設定

```typescript
const cachedImageFiles = ["your-image.jpg"];
const noCacheImageFiles = ["your-image.jpg"];
```

### 3. アプリケーション起動

```bash
npm run dev
```

### 4. キャッシュ動作確認

- 数回リロードしてブラウザの開発者ツールでレスポンスヘッダーを確認
- `x-cache: Hit from cloudfront` → キャッシュ成功
- `x-cache: Miss from cloudfront` → キャッシュなし
- 3分後に再取得してキャッシュが更新されているか確認
- キャッシュ期間中に、同一ファイル名で違う画像をS3バケットにアップロードして、キャッシュ中は画像が変わらないことを確認
